import mongoose from 'mongoose';
import { MusicianService } from '../../src/services/musicianService';
import Musician from '../../src/models/musician';

// Mock the Musician model
jest.mock('../../src/models/musician');

describe('MusicianService', () => {
  let musicianService: MusicianService;
  const mockMusician = Musician as jest.Mocked<typeof Musician>;

  beforeEach(() => {
    jest.clearAllMocks();
    musicianService = new MusicianService();
  });

  describe('createMusician', () => {
    it('should create a musician with valid input', async () => {
      const input = {
        userId: 'user_123',
        musicianName: 'Park Jin-ho',
        genre: 'K-pop',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      };

      const mockCreatedMusician = {
        _id: new mongoose.Types.ObjectId(),
        ...input,
        isTokenDeployed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMusician.create.mockResolvedValue(mockCreatedMusician);

      const result = await musicianService.createMusician(input);

      expect(result).toEqual(mockCreatedMusician);
      expect(mockMusician.create).toHaveBeenCalledWith(input);
    });

    it('should throw error when musician name is empty', async () => {
      const input = {
        userId: 'user_123',
        musicianName: '',
        genre: 'K-pop',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      };

      mockMusician.create.mockRejectedValue(new Error('Musician name is required'));

      await expect(musicianService.createMusician(input)).rejects.toThrow(
        'Musician name is required'
      );
    });

    it('should throw error for invalid wallet address', async () => {
      const input = {
        userId: 'user_123',
        musicianName: 'Park Jin-ho',
        genre: 'K-pop',
        walletAddress: 'invalid_address',
      };

      mockMusician.create.mockRejectedValue(
        new Error('Invalid wallet address')
      );

      await expect(musicianService.createMusician(input)).rejects.toThrow(
        'Invalid wallet address'
      );
    });
  });

  describe('getMusicianById', () => {
    it('should retrieve musician by ID', async () => {
      const musicianId = new mongoose.Types.ObjectId().toString();
      const mockData = {
        _id: musicianId,
        userId: 'user_123',
        musicianName: 'Park Jin-ho',
        genre: 'K-pop',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        isTokenDeployed: false,
      };

      mockMusician.findById.mockResolvedValue(mockData);

      const result = await musicianService.getMusicianById(musicianId);

      expect(result).toEqual(mockData);
      expect(mockMusician.findById).toHaveBeenCalledWith(musicianId);
    });

    it('should return null for non-existent musician', async () => {
      const musicianId = new mongoose.Types.ObjectId().toString();
      mockMusician.findById.mockResolvedValue(null);

      const result = await musicianService.getMusicianById(musicianId);

      expect(result).toBeNull();
    });
  });

  describe('getMusicianByWallet', () => {
    it('should retrieve musician by wallet address', async () => {
      const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const mockData = {
        _id: new mongoose.Types.ObjectId(),
        userId: 'user_123',
        musicianName: 'Park Jin-ho',
        genre: 'K-pop',
        walletAddress: walletAddress,
        isTokenDeployed: false,
      };

      mockMusician.findOne.mockResolvedValue(mockData);

      const result = await musicianService.getMusicianByWallet(walletAddress);

      expect(result).toEqual(mockData);
      expect(mockMusician.findOne).toHaveBeenCalledWith({
        walletAddress: walletAddress,
      });
    });

    it('should return null for non-existent wallet', async () => {
      const walletAddress = '0x0000000000000000000000000000000000000000';
      mockMusician.findOne.mockResolvedValue(null);

      const result = await musicianService.getMusicianByWallet(walletAddress);

      expect(result).toBeNull();
    });
  });

  describe('updateTokenInfo', () => {
    it('should update musician token information', async () => {
      const musicianId = new mongoose.Types.ObjectId().toString();
      const tokenAddress = '0x1234567890123456789012345678901234567890';
      const txHash =
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';

      const mockUpdatedMusician = {
        _id: musicianId,
        userId: 'user_123',
        musicianName: 'Park Jin-ho',
        genre: 'K-pop',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        isTokenDeployed: true,
        tokenAddress,
        deploymentTxHash: txHash,
      };

      mockMusician.findByIdAndUpdate.mockResolvedValue(mockUpdatedMusician);

      const result = await musicianService.updateTokenInfo(
        musicianId,
        tokenAddress,
        txHash
      );

      expect(result.isTokenDeployed).toBe(true);
      expect(result.tokenAddress).toBe(tokenAddress);
      expect(mockMusician.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('listMusicians', () => {
    it('should list musicians with pagination', async () => {
      const mockMusicians = [
        {
          _id: new mongoose.Types.ObjectId(),
          musicianName: 'Park Jin-ho',
          genre: 'K-pop',
          isTokenDeployed: false,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          musicianName: 'Lee Hye-jin',
          genre: 'Ballad',
          isTokenDeployed: true,
        },
      ];

      mockMusician.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockMusicians),
        }),
      } as any);

      const result = await musicianService.listMusicians(0, 10);

      expect(result).toEqual(mockMusicians);
      expect(mockMusician.find).toHaveBeenCalled();
    });
  });

  describe('searchByName', () => {
    it('should search musicians by name', async () => {
      const query = 'Park';
      const mockResults = [
        {
          _id: new mongoose.Types.ObjectId(),
          musicianName: 'Park Jin-ho',
          genre: 'K-pop',
        },
      ];

      mockMusician.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockResults),
        }),
      } as any);

      const result = await musicianService.searchByName(query, 0, 10);

      expect(result).toEqual(mockResults);
      expect(mockMusician.find).toHaveBeenCalledWith({
        musicianName: { $regex: query, $options: 'i' },
      });
    });

    it('should return empty array for no matches', async () => {
      const query = 'NonExistent';

      mockMusician.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await musicianService.searchByName(query, 0, 10);

      expect(result).toEqual([]);
    });
  });
});
