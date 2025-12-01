import { Musician } from '../models/musician';
import { WalletValidator } from '../utils/walletValidator';

/**
 * T031: Musician Service
 * Handles all musician-related database operations
 */

interface CreateMusicianInput {
  userId: string;
  musicianName: string;
  genre?: string;
  bio?: string;
  profileImage?: string;
  walletAddress: string;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
}

interface UpdateMusicianInput {
  genre?: string;
  bio?: string;
  profileImage?: string;
  walletAddress?: string;
  tokenAddress?: string;
  tokenDeploymentStatus?: 'pending' | 'confirmed' | 'failed';
  deploymentTxHash?: string;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
}

class MusicianService {
  /**
   * Create a new musician profile
   */
  static async createMusician(input: CreateMusicianInput) {
    try {
      // Validate wallet address
      const normalized = WalletValidator.validateAndNormalize(input.walletAddress);

      // Create new musician (allow multiple musicians per wallet)
      const musician = new Musician({
        userId: input.userId,
        musicianName: input.musicianName,
        genre: input.genre,
        bio: input.bio,
        profileImage: input.profileImage,
        walletAddress: normalized,
        socialLinks: input.socialLinks || {},
        isTokenDeployed: false,
      });

      await musician.save();
      return musician;
    } catch (error: any) {
      throw new Error(`Failed to create musician: ${error.message}`);
    }
  }

  /**
   * Get musician by ID
   */
  static async getMusicianById(musicianId: string) {
    try {
      const musician = await Musician.findById(musicianId);
      if (!musician) {
        throw new Error('Musician not found');
      }
      return musician;
    } catch (error: any) {
      throw new Error(`Failed to get musician: ${error.message}`);
    }
  }

  /**
   * Get all musicians by wallet address
   */
  static async getMusicianByWallet(walletAddress: string) {
    try {
      const normalized = WalletValidator.validateAndNormalize(walletAddress);
      const musicians = await Musician.find({ walletAddress: normalized }).sort({ createdAt: -1 });
      if (!musicians || musicians.length === 0) {
        throw new Error('Musicians not found for this wallet address');
      }
      return musicians;
    } catch (error: any) {
      throw new Error(`Failed to get musicians by wallet: ${error.message}`);
    }
  }

  /**
   * Get musician by user ID
   */
  static async getMusicianByUserId(userId: string) {
    try {
      const musician = await Musician.findOne({ userId });
      if (!musician) {
        throw new Error('Musician not found for this user');
      }
      return musician;
    } catch (error: any) {
      throw new Error(`Failed to get musician by user ID: ${error.message}`);
    }
  }

  /**
   * Update musician profile
   */
  static async updateMusician(musicianId: string, input: UpdateMusicianInput) {
    try {
      // Validate wallet if provided
      if (input.walletAddress) {
        input.walletAddress = WalletValidator.validateAndNormalize(input.walletAddress);
      }

      const musician = await Musician.findByIdAndUpdate(
        musicianId,
        { ...input, updatedAt: new Date() },
        { new: true }
      );

      if (!musician) {
        throw new Error('Musician not found');
      }

      return musician;
    } catch (error: any) {
      throw new Error(`Failed to update musician: ${error.message}`);
    }
  }

  /**
   * Update musician token information after deployment
   */
  static async updateTokenInfo(
    musicianId: string,
    tokenAddress: string,
    deploymentTxHash: string
  ) {
    try {
      // Validate token address
      WalletValidator.validateApiAddress(tokenAddress);

      const musician = await Musician.findByIdAndUpdate(
        musicianId,
        {
          tokenAddress,
          deploymentTxHash,
          isTokenDeployed: true,
          tokenDeploymentStatus: 'confirmed',
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!musician) {
        throw new Error('Musician not found');
      }

      return musician;
    } catch (error: any) {
      throw new Error(`Failed to update token info: ${error.message}`);
    }
  }

  /**
   * Check if musician already has a deployed token
   */
  static async hasDeployedToken(musicianId: string): Promise<boolean> {
    try {
      const musician = await Musician.findById(musicianId);
      return musician?.isTokenDeployed || false;
    } catch (error: any) {
      throw new Error(`Failed to check deployment status: ${error.message}`);
    }
  }

  /**
   * List all musicians (with pagination)
   */
  static async listMusicians(skip: number = 0, limit: number = 20) {
    try {
      // Get musicians from database
      const musicians = await Musician.find()
        .sort({ createdAt: -1 });

      // Apply pagination
      const paginatedMusicians = musicians.slice(skip, skip + limit);
      const total = musicians.length;

      return {
        musicians: paginatedMusicians,
        pagination: {
          skip,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to list musicians: ${error.message}`);
    }
  }

  /**
   * Search musicians by name
   */
  static async searchByName(name: string, skip: number = 0, limit: number = 20) {
    try {
      const regex = new RegExp(name, 'i'); // Case-insensitive search

      // Get musicians from database
      const musicians = await Musician.find({ musicianName: regex }).sort({
        createdAt: -1,
      });

      // Apply pagination
      const paginatedMusicians = musicians.slice(skip, skip + limit);
      const total = musicians.length;

      return {
        musicians: paginatedMusicians,
        pagination: {
          skip,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to search musicians: ${error.message}`);
    }
  }
}

export { MusicianService, CreateMusicianInput, UpdateMusicianInput };
