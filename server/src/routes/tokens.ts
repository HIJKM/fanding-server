import express, { Request, Response, Router } from 'express';
import { tokenPurchaseService, PurchaseRequest } from '../services/tokenPurchaseService';
import * as withdrawalService from '../services/withdrawalService';
import { Musician } from '../models/musician';
import { formatError, formatValidationError } from '../utils/apiErrorFormatter';
import { validateNonEmptyBodyMiddleware, sanitizeRequestMiddleware } from '../middleware/validation';

/**
 * T046-T049: Token Purchase & Fan Engagement API Routes
 * Handles token purchases, governance, and fan dashboard
 */

const router: Router = express.Router();

// Apply global middleware
router.use(sanitizeRequestMiddleware());

/**
 * T046: POST /api/tokens/:musicianId/purchase
 * Purchase musician token
 *
 * Request body:
 * {
 *   "amount": 100,
 *   "fanWalletAddress": "0x...",
 *   "tokenAddress": "0x..."
 * }
 *
 * Response:
 * {
 *   "purchaseId": "...",
 *   "musicianId": "...",
 *   "amount": 100,
 *   "totalCost": "...",
 *   "txHash": "0x...",
 *   "status": "completed",
 *   "blockNumber": 123456,
 *   "createdAt": "2024-11-29T..."
 * }
 */
router.post('/:musicianId/purchase', validateNonEmptyBodyMiddleware(), async (req: Request, res: Response) => {
  try {
    const { musicianId } = req.params;
    const { amount, fanWalletAddress, tokenAddress } = req.body;

    // Validate required fields
    const errors: { [key: string]: string } = {};

    if (!musicianId || musicianId.trim().length === 0) {
      errors.musicianId = 'Musician ID is required';
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      errors.amount = 'Amount must be a positive number';
    }

    if (!fanWalletAddress || typeof fanWalletAddress !== 'string') {
      errors.fanWalletAddress = 'Fan wallet address is required';
    }

    if (!tokenAddress || typeof tokenAddress !== 'string') {
      errors.tokenAddress = 'Token address is required';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(
        formatValidationError(errors, 400, req.originalUrl)
      );
    }

    // Prepare purchase request
    const purchaseRequest: PurchaseRequest = {
      musicianId,
      fanWalletAddress,
      tokenAddress,
      amount,
    };

    // Process purchase
    const result = await tokenPurchaseService.purchaseToken(purchaseRequest);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Purchase endpoint error:', error.message);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error.message, statusCode, req.originalUrl));
  }
});

/**
 * GET /api/tokens/:musicianId/purchases
 * Get token purchases for a musician
 *
 * Query parameters:
 * - skip: number (default: 0)
 * - limit: number (default: 20)
 */
router.get('/:musicianId/purchases', async (req: Request, res: Response) => {
  try {
    const { musicianId } = req.params;
    let skip = parseInt(req.query.skip as string) || 0;
    let limit = parseInt(req.query.limit as string) || 20;

    if (skip < 0) skip = 0;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    const purchases = await tokenPurchaseService.getMusicianPurchases(musicianId, skip, limit);

    return res.status(200).json({
      musicianId,
      purchases,
      pagination: {
        skip,
        limit,
        count: purchases.length,
      },
    });
  } catch (error: any) {
    return res
      .status(500)
      .json(formatError(error.message, 500, req.originalUrl));
  }
});

/**
 * GET /api/tokens/fan/:fanWalletAddress/history
 * Get purchase history for a fan
 *
 * Query parameters:
 * - skip: number (default: 0)
 * - limit: number (default: 20)
 */
router.get('/fan/:fanWalletAddress/history', async (req: Request, res: Response) => {
  try {
    const { fanWalletAddress } = req.params;
    let skip = parseInt(req.query.skip as string) || 0;
    let limit = parseInt(req.query.limit as string) || 20;

    if (skip < 0) skip = 0;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    const purchases = await tokenPurchaseService.getPurchaseHistory(fanWalletAddress, skip, limit);

    return res.status(200).json({
      fanWalletAddress,
      purchases,
      pagination: {
        skip,
        limit,
        count: purchases.length,
      },
    });
  } catch (error: any) {
    return res
      .status(500)
      .json(formatError(error.message, 500, req.originalUrl));
  }
});

/**
 * GET /api/tokens/:musicianId/verify
 * Verify if a fan owns tokens of a musician
 *
 * Query parameters:
 * - fanWalletAddress: string (required) - The fan's wallet address
 *
 * Response:
 * {
 *   "hasToken": true,
 *   "tokenAmount": 100
 * }
 */
router.get('/:musicianId/verify', async (req: Request, res: Response) => {
  try {
    const { musicianId } = req.params;
    const { fanWalletAddress } = req.query;

    // Validate required query parameter
    if (!fanWalletAddress || typeof fanWalletAddress !== 'string') {
      return res.status(400).json(
        formatValidationError(
          { fanWalletAddress: 'Fan wallet address is required' },
          400,
          req.originalUrl
        )
      );
    }

    // Check if fan has purchased tokens from this musician
    const purchases = await tokenPurchaseService.getMusicianPurchases(musicianId, 0, 1000);

    // Find all purchases by this fan for this musician
    const fanPurchases = purchases.filter(
      (purchase: any) => purchase.fanWalletAddress?.toLowerCase() === fanWalletAddress.toLowerCase()
    );

    const hasToken = fanPurchases.length > 0;
    const tokenAmount = fanPurchases.reduce((sum: number, purchase: any) => sum + (purchase.amount || 0), 0);

    return res.status(200).json({
      hasToken,
      tokenAmount: hasToken ? tokenAmount : undefined,
    });
  } catch (error: any) {
    return res
      .status(500)
      .json(formatError(error.message, 500, req.originalUrl));
  }
});

/**
 * GET /api/tokens/:musicianId/withdrawal-stats
 * 아티스트의 출금 통계 조회
 * Response: { totalEarnings, withdrawnAmount, withdrawable }
 */
router.get('/:musicianId/withdrawal-stats', async (req: Request, res: Response) => {
  try {
    const { musicianId } = req.params;

    if (!musicianId || musicianId.trim().length === 0) {
      return res
        .status(400)
        .json(formatValidationError({ musicianId: 'Musician ID is required' }, 400, req.originalUrl));
    }

    const stats = await withdrawalService.getWithdrawalStats(musicianId);
    return res.status(200).json(stats);
  } catch (error: any) {
    return res
      .status(500)
      .json(formatError(error.message, 500, req.originalUrl));
  }
});

/**
 * POST /api/tokens/:musicianId/withdraw
 * 아티스트가 수익금 출금 요청
 * Request: { amount: "1000000000000000000" (wei), musicianWalletAddress: "0x..." }
 * Response: { withdrawalId, status, amount, createdAt }
 */
router.post('/:musicianId/withdraw', validateNonEmptyBodyMiddleware(), async (req: Request, res: Response) => {
  try {
    const { musicianId } = req.params;
    const { amount, musicianWalletAddress } = req.body;

    const errors: { [key: string]: string } = {};

    if (!musicianId || musicianId.trim().length === 0) {
      errors.musicianId = 'Musician ID is required';
    }

    if (!amount) {
      errors.amount = 'Withdrawal amount is required';
    } else if (typeof amount !== 'string' || !/^\d+$/.test(amount)) {
      errors.amount = 'Amount must be a valid number in wei';
    }

    if (!musicianWalletAddress) {
      errors.musicianWalletAddress = 'Musician wallet address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(musicianWalletAddress)) {
      errors.musicianWalletAddress = 'Invalid wallet address format';
    }

    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json(formatValidationError(errors, 400, req.originalUrl));
    }

    // 뮤지션이 실제로 존재하는지 확인
    const musician = await Musician.findById(musicianId);
    if (!musician) {
      return res
        .status(404)
        .json(formatError('Musician not found', 404, req.originalUrl));
    }

    // 지갑 주소 일치 확인 (보안)
    if (musician.walletAddress.toLowerCase() !== musicianWalletAddress.toLowerCase()) {
      return res
        .status(403)
        .json(formatError('Wallet address does not match musician account', 403, req.originalUrl));
    }

    // 출금 요청 생성
    const withdrawal = await withdrawalService.createWithdrawalRequest(
      musicianId,
      musicianWalletAddress,
      amount
    );

    return res.status(201).json({
      withdrawalId: withdrawal._id,
      status: withdrawal.status,
      amount: withdrawal.amount,
      createdAt: withdrawal.createdAt,
    });
  } catch (error: any) {
    return res
      .status(400)
      .json(formatError(error.message, 400, req.originalUrl));
  }
});

/**
 * GET /api/tokens/:musicianId/withdrawals
 * 아티스트의 출금 이력 조회
 */
router.get('/:musicianId/withdrawals', async (req: Request, res: Response) => {
  try {
    const { musicianId } = req.params;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!musicianId || musicianId.trim().length === 0) {
      return res
        .status(400)
        .json(formatValidationError({ musicianId: 'Musician ID is required' }, 400, req.originalUrl));
    }

    const result = await withdrawalService.getMusicianWithdrawals(musicianId, skip, limit);
    return res.status(200).json(result);
  } catch (error: any) {
    return res
      .status(500)
      .json(formatError(error.message, 500, req.originalUrl));
  }
});

export default router;
