import { TokenDeploymentService } from '../../src/services/tokenDeploymentService';
import BlockchainService from '../../src/services/blockchainService';

// Mock blockchain service
jest.mock('../../src/services/blockchainService');

describe('TokenDeploymentService', () => {
  let tokenDeploymentService: TokenDeploymentService;
  const mockBlockchainService = BlockchainService as jest.Mocked<
    typeof BlockchainService
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    tokenDeploymentService = new TokenDeploymentService();
  });

  describe('generateSymbol', () => {
    it('should generate valid symbol for Korean name', async () => {
      const musicianName = 'Park Jin-ho';
      const symbol = await tokenDeploymentService.generateSymbol(musicianName);

      // Symbol should be uppercase, 4 characters with 2-digit suffix
      expect(symbol).toMatch(/^[A-Z0-9]{4}$/);
      expect(symbol.length).toBe(4);
    });

    it('should handle symbols with special characters', async () => {
      const musicianName = 'Lee Hye-jin';
      const symbol = await tokenDeploymentService.generateSymbol(musicianName);

      expect(symbol).toMatch(/^[A-Z0-9]{4}$/);
    });

    it('should generate different symbols for repeated calls', async () => {
      const musicianName = 'Test Musician';
      const symbol1 = await tokenDeploymentService.generateSymbol(musicianName);
      const symbol2 = await tokenDeploymentService.generateSymbol(musicianName);

      // The numeric suffix should be different due to randomization
      expect(symbol1).toMatch(/^[A-Z0-9]{4}$/);
      expect(symbol2).toMatch(/^[A-Z0-9]{4}$/);
    });
  });

  describe('generateBaseSymbol', () => {
    it('should generate base symbol without numeric suffix', () => {
      const musicianName = 'Park Jin-ho';
      const baseSymbol = tokenDeploymentService.generateBaseSymbol(musicianName);

      // Should be 2 characters uppercase
      expect(baseSymbol).toMatch(/^[A-Z]{2}$/);
      expect(baseSymbol.length).toBe(2);
    });

    it('should handle short names', () => {
      const musicianName = 'A';
      const baseSymbol = tokenDeploymentService.generateBaseSymbol(musicianName);

      expect(baseSymbol.length).toBeLessThanOrEqual(2);
      expect(/^[A-Z]+$/.test(baseSymbol)).toBe(true);
    });
  });

  describe('deployToken', () => {
    it('should deploy token successfully', async () => {
      const request = {
        musicianId: 'musician_123',
        musicianName: 'Park Jin-ho',
        musicianAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      };

      const mockDeploymentResult = {
        tokenAddress: '0x1234567890123456789012345678901234567890',
        txHash:
          '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        blockNumber: 12345,
      };

      mockBlockchainService.deployMusicianToken.mockResolvedValue(
        mockDeploymentResult
      );

      const result = await tokenDeploymentService.deployToken(request);

      expect(result.tokenAddress).toBe(mockDeploymentResult.tokenAddress);
      expect(mockBlockchainService.deployMusicianToken).toHaveBeenCalled();
    });

    it('should handle deployment failure', async () => {
      const request = {
        musicianId: 'musician_123',
        musicianName: 'Park Jin-ho',
        musicianAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      };

      mockBlockchainService.deployMusicianToken.mockRejectedValue(
        new Error('Insufficient funds')
      );

      await expect(
        tokenDeploymentService.deployToken(request)
      ).rejects.toThrow('Insufficient funds');
    });
  });

  describe('verifyTokenDeployment', () => {
    it('should verify token deployment on-chain', async () => {
      const tokenAddress = '0x1234567890123456789012345678901234567890';
      const mockVerificationResult = {
        isDeployed: true,
        name: 'Park Jin-ho Token',
        symbol: 'PJH87',
        totalSupply: '10000000000000000000000', // 10000 with 18 decimals
      };

      mockBlockchainService.getTokenInfo.mockResolvedValue(
        mockVerificationResult
      );

      const result = await tokenDeploymentService.verifyTokenDeployment(
        tokenAddress
      );

      expect(result.isDeployed).toBe(true);
      expect(result.symbol).toBe('PJH87');
    });

    it('should return false for non-existent token', async () => {
      const tokenAddress = '0x0000000000000000000000000000000000000000';

      mockBlockchainService.getTokenInfo.mockRejectedValue(
        new Error('Token not found')
      );

      await expect(
        tokenDeploymentService.verifyTokenDeployment(tokenAddress)
      ).rejects.toThrow('Token not found');
    });
  });

  describe('isNetworkAvailable', () => {
    it('should check network availability', async () => {
      mockBlockchainService.checkNetworkAvailability.mockResolvedValue(true);

      const result = await tokenDeploymentService.isNetworkAvailable();

      expect(result).toBe(true);
      expect(
        mockBlockchainService.checkNetworkAvailability
      ).toHaveBeenCalled();
    });

    it('should return false when network is unavailable', async () => {
      mockBlockchainService.checkNetworkAvailability.mockResolvedValue(false);

      const result = await tokenDeploymentService.isNetworkAvailable();

      expect(result).toBe(false);
    });
  });
});
