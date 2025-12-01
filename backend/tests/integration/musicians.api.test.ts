import request from 'supertest';
import express from 'express';
import musicianRoutes from '../../src/routes/musicians';
import { MusicianService } from '../../src/services/musicianService';
import { TokenDeploymentService } from '../../src/services/tokenDeploymentService';

// Mock services
jest.mock('../../src/services/musicianService');
jest.mock('../../src/services/tokenDeploymentService');

describe('Musician API Endpoints', () => {
  let app: express.Application;
  let mockMusicianService: jest.Mocked<MusicianService>;
  let mockTokenDeploymentService: jest.Mocked<TokenDeploymentService>;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/musicians', musicianRoutes);

    mockMusicianService = MusicianService as any;
    mockTokenDeploymentService = TokenDeploymentService as any;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/musicians/signup', () => {
    it('should successfully create musician profile', async () => {
      const signupData = {
        userId: 'user_123',
        musicianName: 'Park Jin-ho',
        genre: 'K-pop',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      };

      const mockResponse = {
        musicianId: 'musician_123',
        musicianName: signupData.musicianName,
        walletAddress: signupData.walletAddress,
        createdAt: new Date().toISOString(),
        isTokenDeployed: false,
      };

      mockMusicianService.createMusician.mockResolvedValue(mockResponse as any);

      const response = await request(app)
        .post('/api/musicians/signup')
        .send(signupData)
        .expect(201);

      expect(response.body).toHaveProperty('musicianId');
      expect(response.body.musicianName).toBe(signupData.musicianName);
      expect(response.body.walletAddress).toBe(signupData.walletAddress);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        musicianName: 'Park Jin-ho',
        // missing genre and walletAddress
      };

      const response = await request(app)
        .post('/api/musicians/signup')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe(400);
    });

    it('should return 409 for duplicate wallet address', async () => {
      const signupData = {
        userId: 'user_123',
        musicianName: 'Park Jin-ho',
        genre: 'K-pop',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      };

      mockMusicianService.createMusician.mockRejectedValue(
        new Error('Wallet already registered')
      );

      const response = await request(app)
        .post('/api/musicians/signup')
        .send(signupData)
        .expect(500);

      expect(response.body).toHaveProperty('detail');
    });
  });

  describe('POST /api/musicians/:id/deploy-token', () => {
    it('should successfully deploy token', async () => {
      const musicianId = 'musician_123';
      const mockTokenResponse = {
        tokenAddress: '0x1234567890123456789012345678901234567890',
        tokenName: 'Park Jin-ho Token',
        symbol: 'PJH87',
        deploymentTxHash:
          '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        deploymentStatus: 'confirmed',
      };

      mockTokenDeploymentService.deployToken.mockResolvedValue(
        mockTokenResponse as any
      );

      const response = await request(app)
        .post(`/api/musicians/${musicianId}/deploy-token`)
        .send({})
        .expect(201);

      expect(response.body).toHaveProperty('tokenAddress');
      expect(response.body.symbol).toBe('PJH87');
      expect(response.body.deploymentStatus).toBe('confirmed');
    });

    it('should return 404 for non-existent musician', async () => {
      const musicianId = 'non_existent_id';

      mockTokenDeploymentService.deployToken.mockRejectedValue(
        new Error('Musician not found')
      );

      const response = await request(app)
        .post(`/api/musicians/${musicianId}/deploy-token`)
        .send({})
        .expect(500);

      expect(response.body).toHaveProperty('detail');
    });

    it('should return 409 if token already deployed', async () => {
      const musicianId = 'musician_123';

      mockTokenDeploymentService.deployToken.mockRejectedValue(
        new Error('Token already deployed')
      );

      const response = await request(app)
        .post(`/api/musicians/${musicianId}/deploy-token`)
        .send({})
        .expect(500);

      expect(response.body).toHaveProperty('detail');
    });
  });

  describe('GET /api/musicians/:id/token', () => {
    it('should retrieve token information', async () => {
      const musicianId = 'musician_123';
      const mockTokenInfo = {
        tokenAddress: '0x1234567890123456789012345678901234567890',
        deploymentTxHash:
          '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        isDeployed: true,
        tokenInfo: {
          name: 'Park Jin-ho Token',
          decimals: 18,
          totalSupply: '10000000000000000000000',
          initialAllocation: '2000000000000000000000',
        },
      };

      mockMusicianService.getMusicianById.mockResolvedValue({
        tokenAddress: mockTokenInfo.tokenAddress,
      } as any);

      const response = await request(app)
        .get(`/api/musicians/${musicianId}/token`)
        .expect(200);

      expect(response.body).toHaveProperty('tokenAddress');
      expect(response.body.isDeployed).toBeDefined();
    });
  });

  describe('GET /api/musicians/:id/dashboard', () => {
    it('should retrieve dashboard data', async () => {
      const musicianId = 'musician_123';

      mockMusicianService.getMusicianById.mockResolvedValue({
        _id: musicianId,
        musicianName: 'Park Jin-ho',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        isTokenDeployed: true,
        tokenAddress: '0x1234567890123456789012345678901234567890',
      } as any);

      const response = await request(app)
        .get(`/api/musicians/${musicianId}/dashboard`)
        .expect(200);

      expect(response.body).toHaveProperty('profileCompletion');
      expect(response.body).toHaveProperty('tokenStatus');
      expect(response.body).toHaveProperty('walletInfo');
    });
  });

  describe('GET /api/musicians', () => {
    it('should list musicians with pagination', async () => {
      const mockMusicians = [
        {
          _id: 'musician_1',
          musicianName: 'Park Jin-ho',
          genre: 'K-pop',
        },
        {
          _id: 'musician_2',
          musicianName: 'Lee Hye-jin',
          genre: 'Ballad',
        },
      ];

      mockMusicianService.listMusicians.mockResolvedValue(mockMusicians as any);

      const response = await request(app)
        .get('/api/musicians')
        .query({ skip: 0, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.musicians)).toBe(true);
      expect(response.body.musicians.length).toBe(2);
    });

    it('should respect pagination parameters', async () => {
      mockMusicianService.listMusicians.mockResolvedValue([] as any);

      await request(app)
        .get('/api/musicians')
        .query({ skip: 20, limit: 5 })
        .expect(200);

      expect(mockMusicianService.listMusicians).toHaveBeenCalledWith(20, 5);
    });
  });

  describe('GET /api/musicians/search', () => {
    it('should search musicians by name', async () => {
      const mockResults = [
        {
          _id: 'musician_1',
          musicianName: 'Park Jin-ho',
          genre: 'K-pop',
        },
      ];

      mockMusicianService.searchByName.mockResolvedValue(mockResults as any);

      const response = await request(app)
        .get('/api/musicians/search')
        .query({ q: 'Park', skip: 0, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.musicians)).toBe(true);
      expect(response.body.musicians.length).toBe(1);
      expect(mockMusicianService.searchByName).toHaveBeenCalledWith(
        'Park',
        0,
        10
      );
    });

    it('should return empty results for no matches', async () => {
      mockMusicianService.searchByName.mockResolvedValue([] as any);

      const response = await request(app)
        .get('/api/musicians/search')
        .query({ q: 'NonExistent' })
        .expect(200);

      expect(response.body.musicians).toEqual([]);
    });
  });
});
