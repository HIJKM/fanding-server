"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tokenPurchaseService_1 = require("../services/tokenPurchaseService");
const withdrawalService = __importStar(require("../services/withdrawalService"));
const musician_1 = require("../models/musician");
const apiErrorFormatter_1 = require("../utils/apiErrorFormatter");
const validation_1 = require("../middleware/validation");
/**
 * T046-T049: Token Purchase & Fan Engagement API Routes
 * Handles token purchases, governance, and fan dashboard
 */
const router = express_1.default.Router();
// Apply global middleware
router.use((0, validation_1.sanitizeRequestMiddleware)());
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
router.post('/:musicianId/purchase', (0, validation_1.validateNonEmptyBodyMiddleware)(), async (req, res) => {
    try {
        const { musicianId } = req.params;
        const { amount, fanWalletAddress, tokenAddress } = req.body;
        // Validate required fields
        const errors = {};
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
            return res.status(400).json((0, apiErrorFormatter_1.formatValidationError)(errors, 400, req.originalUrl));
        }
        // Prepare purchase request
        const purchaseRequest = {
            musicianId,
            fanWalletAddress,
            tokenAddress,
            amount,
        };
        // Process purchase
        const result = await tokenPurchaseService_1.tokenPurchaseService.purchaseToken(purchaseRequest);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error('Purchase endpoint error:', error.message);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error.message, statusCode, req.originalUrl));
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
router.get('/:musicianId/purchases', async (req, res) => {
    try {
        const { musicianId } = req.params;
        let skip = parseInt(req.query.skip) || 0;
        let limit = parseInt(req.query.limit) || 20;
        if (skip < 0)
            skip = 0;
        if (limit < 1)
            limit = 1;
        if (limit > 100)
            limit = 100;
        const purchases = await tokenPurchaseService_1.tokenPurchaseService.getMusicianPurchases(musicianId, skip, limit);
        return res.status(200).json({
            musicianId,
            purchases,
            pagination: {
                skip,
                limit,
                count: purchases.length,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json((0, apiErrorFormatter_1.formatError)(error.message, 500, req.originalUrl));
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
router.get('/fan/:fanWalletAddress/history', async (req, res) => {
    try {
        const { fanWalletAddress } = req.params;
        let skip = parseInt(req.query.skip) || 0;
        let limit = parseInt(req.query.limit) || 20;
        if (skip < 0)
            skip = 0;
        if (limit < 1)
            limit = 1;
        if (limit > 100)
            limit = 100;
        const purchases = await tokenPurchaseService_1.tokenPurchaseService.getPurchaseHistory(fanWalletAddress, skip, limit);
        return res.status(200).json({
            fanWalletAddress,
            purchases,
            pagination: {
                skip,
                limit,
                count: purchases.length,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json((0, apiErrorFormatter_1.formatError)(error.message, 500, req.originalUrl));
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
router.get('/:musicianId/verify', async (req, res) => {
    try {
        const { musicianId } = req.params;
        const { fanWalletAddress } = req.query;
        // Validate required query parameter
        if (!fanWalletAddress || typeof fanWalletAddress !== 'string') {
            return res.status(400).json((0, apiErrorFormatter_1.formatValidationError)({ fanWalletAddress: 'Fan wallet address is required' }, 400, req.originalUrl));
        }
        // Check if fan has purchased tokens from this musician
        const purchases = await tokenPurchaseService_1.tokenPurchaseService.getMusicianPurchases(musicianId, 0, 1000);
        // Find all purchases by this fan for this musician
        const fanPurchases = purchases.filter((purchase) => purchase.fanWalletAddress?.toLowerCase() === fanWalletAddress.toLowerCase());
        const hasToken = fanPurchases.length > 0;
        const tokenAmount = fanPurchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
        return res.status(200).json({
            hasToken,
            tokenAmount: hasToken ? tokenAmount : undefined,
        });
    }
    catch (error) {
        return res
            .status(500)
            .json((0, apiErrorFormatter_1.formatError)(error.message, 500, req.originalUrl));
    }
});
/**
 * GET /api/tokens/:musicianId/withdrawal-stats
 * 아티스트의 출금 통계 조회
 * Response: { totalEarnings, withdrawnAmount, withdrawable }
 */
router.get('/:musicianId/withdrawal-stats', async (req, res) => {
    try {
        const { musicianId } = req.params;
        if (!musicianId || musicianId.trim().length === 0) {
            return res
                .status(400)
                .json((0, apiErrorFormatter_1.formatValidationError)({ musicianId: 'Musician ID is required' }, 400, req.originalUrl));
        }
        const stats = await withdrawalService.getWithdrawalStats(musicianId);
        return res.status(200).json(stats);
    }
    catch (error) {
        return res
            .status(500)
            .json((0, apiErrorFormatter_1.formatError)(error.message, 500, req.originalUrl));
    }
});
/**
 * POST /api/tokens/:musicianId/withdraw
 * 아티스트가 수익금 출금 요청
 * Request: { amount: "1000000000000000000" (wei), musicianWalletAddress: "0x..." }
 * Response: { withdrawalId, status, amount, createdAt }
 */
router.post('/:musicianId/withdraw', (0, validation_1.validateNonEmptyBodyMiddleware)(), async (req, res) => {
    try {
        const { musicianId } = req.params;
        const { amount, musicianWalletAddress } = req.body;
        const errors = {};
        if (!musicianId || musicianId.trim().length === 0) {
            errors.musicianId = 'Musician ID is required';
        }
        if (!amount) {
            errors.amount = 'Withdrawal amount is required';
        }
        else if (typeof amount !== 'string' || !/^\d+$/.test(amount)) {
            errors.amount = 'Amount must be a valid number in wei';
        }
        if (!musicianWalletAddress) {
            errors.musicianWalletAddress = 'Musician wallet address is required';
        }
        else if (!/^0x[a-fA-F0-9]{40}$/.test(musicianWalletAddress)) {
            errors.musicianWalletAddress = 'Invalid wallet address format';
        }
        if (Object.keys(errors).length > 0) {
            return res
                .status(400)
                .json((0, apiErrorFormatter_1.formatValidationError)(errors, 400, req.originalUrl));
        }
        // 뮤지션이 실제로 존재하는지 확인
        const musician = await musician_1.Musician.findById(musicianId);
        if (!musician) {
            return res
                .status(404)
                .json((0, apiErrorFormatter_1.formatError)('Musician not found', 404, req.originalUrl));
        }
        // 지갑 주소 일치 확인 (보안)
        if (musician.walletAddress.toLowerCase() !== musicianWalletAddress.toLowerCase()) {
            return res
                .status(403)
                .json((0, apiErrorFormatter_1.formatError)('Wallet address does not match musician account', 403, req.originalUrl));
        }
        // 출금 요청 생성
        const withdrawal = await withdrawalService.createWithdrawalRequest(musicianId, musicianWalletAddress, amount);
        return res.status(201).json({
            withdrawalId: withdrawal._id,
            status: withdrawal.status,
            amount: withdrawal.amount,
            createdAt: withdrawal.createdAt,
        });
    }
    catch (error) {
        return res
            .status(400)
            .json((0, apiErrorFormatter_1.formatError)(error.message, 400, req.originalUrl));
    }
});
/**
 * GET /api/tokens/:musicianId/withdrawals
 * 아티스트의 출금 이력 조회
 */
router.get('/:musicianId/withdrawals', async (req, res) => {
    try {
        const { musicianId } = req.params;
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        if (!musicianId || musicianId.trim().length === 0) {
            return res
                .status(400)
                .json((0, apiErrorFormatter_1.formatValidationError)({ musicianId: 'Musician ID is required' }, 400, req.originalUrl));
        }
        const result = await withdrawalService.getMusicianWithdrawals(musicianId, skip, limit);
        return res.status(200).json(result);
    }
    catch (error) {
        return res
            .status(500)
            .json((0, apiErrorFormatter_1.formatError)(error.message, 500, req.originalUrl));
    }
});
exports.default = router;
//# sourceMappingURL=tokens.js.map