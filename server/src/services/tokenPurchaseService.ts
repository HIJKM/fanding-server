import { getBlockchainService } from './blockchainService';
import { TokenPurchase } from '../models/tokenPurchase';

/**
 * T046: Token Purchase Service
 * Handles token purchase operations and records
 */

interface PurchaseRequest {
  musicianId: string;
  fanWalletAddress: string;
  tokenAddress: string;
  amount: number;
}

interface PurchaseResult {
  purchaseId: string;
  musicianId: string;
  fanWalletAddress: string;
  amount: number;
  totalCost: string;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
  blockNumber: number;
  createdAt: Date;
}

class TokenPurchaseService {
  /**
   * Purchase musician token
   */
  async purchaseToken(request: PurchaseRequest): Promise<PurchaseResult> {
    try {
      // Validate inputs
      this.validateRequest(request);

      const blockchainService = getBlockchainService();

      // Call blockchain to purchase token
      console.log(`🛒 Processing token purchase: ${request.amount} tokens for musician ${request.musicianId}`);

      const txHash = await blockchainService.buyToken(request.tokenAddress, request.amount);

      // Get current block number
      const provider = (blockchainService as any).provider;
      const blockNumber = await provider.getBlockNumber();

      // Store purchase record in MongoDB
      const purchaseRecord = new TokenPurchase({
        musicianId: request.musicianId,
        fanWalletAddress: request.fanWalletAddress.toLowerCase(),
        amount: request.amount,
        totalCost: '0', // Will be calculated by smart contract
        txHash: txHash.toLowerCase(),
        blockNumber,
        status: 'completed',
        tokenAddress: request.tokenAddress.toLowerCase(),
      });

      const savedRecord = await purchaseRecord.save();

      console.log(`✅ Token purchase recorded: ${txHash}`);

      return {
        purchaseId: savedRecord._id.toString(),
        musicianId: request.musicianId,
        fanWalletAddress: request.fanWalletAddress,
        amount: request.amount,
        totalCost: '0',
        txHash,
        status: 'completed',
        blockNumber,
        createdAt: savedRecord.createdAt,
      };
    } catch (error: any) {
      console.error('❌ Token purchase failed:', error.message);
      throw error;
    }
  }

  /**
   * Get purchase history for a fan
   */
  async getPurchaseHistory(fanWalletAddress: string, skip = 0, limit = 10) {
    try {
      const purchases = await TokenPurchase.find({
        fanWalletAddress: fanWalletAddress.toLowerCase(),
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return purchases;
    } catch (error: any) {
      throw new Error(`Failed to fetch purchase history: ${error.message}`);
    }
  }

  /**
   * Get purchases for a musician
   */
  async getMusicianPurchases(musicianId: string, skip = 0, limit = 10) {
    try {
      const purchases = await TokenPurchase.find({
        musicianId,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return purchases;
    } catch (error: any) {
      throw new Error(`Failed to fetch musician purchases: ${error.message}`);
    }
  }

  /**
   * Validate purchase request
   */
  private validateRequest(request: PurchaseRequest): void {
    if (!request.musicianId || request.musicianId.trim() === '') {
      throw new Error('Musician ID is required');
    }

    if (!request.fanWalletAddress || request.fanWalletAddress.trim() === '') {
      throw new Error('Fan wallet address is required');
    }

    if (!request.tokenAddress || request.tokenAddress.trim() === '') {
      throw new Error('Token address is required');
    }

    if (!request.amount || request.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Validate wallet address format (basic Ethereum address check)
    if (!/^0x[a-fA-F0-9]{40}$/.test(request.fanWalletAddress)) {
      throw new Error('Invalid wallet address format');
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(request.tokenAddress)) {
      throw new Error('Invalid token address format');
    }
  }
}

export const tokenPurchaseService = new TokenPurchaseService();
export type { PurchaseRequest, PurchaseResult };
