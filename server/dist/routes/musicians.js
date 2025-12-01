"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const musicianService_1 = require("../services/musicianService");
const tokenDeploymentService_1 = require("../services/tokenDeploymentService");
const apiErrorFormatter_1 = require("../utils/apiErrorFormatter");
const validation_1 = require("../middleware/validation");
/**
 * T033-T037: Musician API Routes
 * Handles musician signup, token deployment, and profile management
 */
const router = express_1.default.Router();
// Apply global middleware to musician routes
router.use((0, validation_1.sanitizeRequestMiddleware)());
/**
 * T034: POST /api/musicians/signup
 * Create a new musician profile
 *
 * Request body:
 * {
 *   "userId": "user123",
 *   "musicianName": "민수",
 *   "genre": "발라드",
 *   "bio": "싱어송라이터입니다",
 *   "profileImage": "https://...",
 *   "walletAddress": "0x123...",
 *   "socialLinks": {
 *     "instagram": "https://instagram.com/...",
 *     "youtube": "https://youtube.com/...",
 *     "twitter": "https://twitter.com/..."
 *   }
 * }
 */
router.post('/signup', (0, validation_1.validateNonEmptyBodyMiddleware)(), async (req, res) => {
    try {
        const { userId, musicianName, genre, bio, profileImage, walletAddress, socialLinks } = req.body;
        // Validate required fields
        const errors = {};
        if (!userId || typeof userId !== 'string') {
            errors.userId = 'User ID is required';
        }
        if (!musicianName || typeof musicianName !== 'string' || musicianName.trim().length === 0) {
            errors.musicianName = 'Musician name is required and must be non-empty';
        }
        if (!genre || typeof genre !== 'string' || genre.trim().length === 0) {
            errors.genre = 'Genre is required and must be non-empty';
        }
        if (!walletAddress || typeof walletAddress !== 'string') {
            errors.walletAddress = 'Wallet address is required';
        }
        // Check for validation errors
        if (Object.keys(errors).length > 0) {
            return res.status(400).json((0, apiErrorFormatter_1.formatValidationError)(errors, 400, req.originalUrl));
        }
        // Create musician
        const musician = await musicianService_1.MusicianService.createMusician({
            userId,
            musicianName: musicianName.trim(),
            genre: genre?.trim(),
            bio: bio?.trim(),
            profileImage,
            walletAddress,
            socialLinks,
        });
        return res.status(201).json({
            musicianId: musician._id,
            musicianName: musician.musicianName,
            walletAddress: musician.walletAddress,
            createdAt: musician.createdAt,
            isTokenDeployed: musician.isTokenDeployed,
        });
    }
    catch (error) {
        const statusCode = error.message.includes('already exists') ? 409 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * T035: POST /api/musicians/:id/deploy-token
 * Deploy a new ERC-20 token for the musician
 *
 * Request body:
 * {
 *   "walletAddress": "0x123..."  // Optional: verify it matches musician
 * }
 */
router.post('/:id/deploy-token', async (req, res) => {
    try {
        const { id } = req.params;
        const { walletAddress } = req.body;
        console.log('🎵 [Deploy Token] 배포 시작');
        console.log('   📋 Musician ID:', id);
        console.log('   🔐 Wallet Address:', walletAddress);
        // Get musician
        const musician = await musicianService_1.MusicianService.getMusicianById(id);
        console.log('   ✅ Musician found:', musician.musicianName);
        // Check if musician already has a token
        if (musician.isTokenDeployed) {
            console.log('   ⚠️  Token already deployed for this musician');
            return res.status(409).json((0, apiErrorFormatter_1.formatError)('Musician already has a deployed token', 409, req.originalUrl));
        }
        // Verify wallet address if provided
        if (walletAddress && walletAddress !== musician.walletAddress) {
            console.log('   ❌ Wallet address mismatch');
            console.log('   Expected:', musician.walletAddress);
            console.log('   Received:', walletAddress);
            return res.status(400).json((0, apiErrorFormatter_1.formatError)('Wallet address does not match musician profile', 400, req.originalUrl));
        }
        // Check network availability
        console.log('   🌐 네트워크 가용성 확인 중...');
        const networkAvailable = await tokenDeploymentService_1.TokenDeploymentService.isNetworkAvailable();
        if (!networkAvailable) {
            console.log('   ❌ Network unavailable');
            return res.status(503).json((0, apiErrorFormatter_1.formatError)('Blockchain network is currently unavailable', 503, req.originalUrl));
        }
        console.log('   ✅ Network available');
        // Deploy token
        console.log('   🚀 토큰 배포 시작...');
        const result = await tokenDeploymentService_1.TokenDeploymentService.deployToken({
            musicianName: musician.musicianName,
            musicianAddress: musician.walletAddress,
            musicianWalletAddress: musician.walletAddress,
        });
        if (result.status === 'failed') {
            console.log('   ❌ Deployment failed:', result.errorMessage);
            return res.status(500).json((0, apiErrorFormatter_1.formatError)(`Token deployment failed: ${result.errorMessage}`, 500, req.originalUrl));
        }
        console.log('   ✅ Token deployed successfully');
        console.log('   📍 Token Address:', result.tokenAddress);
        console.log('   🔗 TX Hash:', result.deploymentTxHash);
        // Update musician with token information
        const updated = await musicianService_1.MusicianService.updateTokenInfo(id, result.tokenAddress, result.deploymentTxHash);
        console.log('   ✅ 배포 완료! 토큰이 생성되었습니다.');
        return res.status(201).json({
            musicianId: updated._id,
            tokenAddress: result.tokenAddress,
            tokenName: result.tokenName,
            symbol: result.symbol,
            deploymentTxHash: result.deploymentTxHash,
            deploymentStatus: 'confirmed',
            createdAt: updated.updatedAt,
        });
    }
    catch (error) {
        console.error('   ❌ 배포 중 에러 발생:');
        console.error('   에러 메시지:', error.message);
        console.error('   에러 스택:', error.stack);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * T036: GET /api/musicians/:id/token
 * Retrieve token information for a musician
 *
 * Response:
 * {
 *   "tokenAddress": "0x123...",
 *   "tokenName": "민수 Token",
 *   "symbol": "MS87",
 *   "decimals": 18,
 *   "totalSupply": 10000,
 *   "initialAllocation": 2000,
 *   "deploymentTxHash": "0xabc...",
 *   "isDeployed": true
 * }
 */
router.get('/:id/token', async (req, res) => {
    try {
        const { id } = req.params;
        // Get musician
        const musician = await musicianService_1.MusicianService.getMusicianById(id);
        if (!musician.isTokenDeployed || !musician.tokenAddress) {
            return res.status(404).json((0, apiErrorFormatter_1.formatError)('Musician has not deployed a token yet', 404, req.originalUrl));
        }
        return res.status(200).json({
            musicianId: musician._id,
            musicianName: musician.musicianName,
            walletAddress: musician.walletAddress,
            tokenAddress: musician.tokenAddress,
            deploymentTxHash: musician.tokenDeploymentTx,
            isDeployed: musician.isTokenDeployed,
            tokenInfo: {
                name: `${musician.musicianName} Token`,
                decimals: 18,
                totalSupply: 10000,
                initialAllocation: 2000,
            },
            deploymentDate: musician.updatedAt,
        });
    }
    catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * T037: GET /api/musicians/:id/dashboard
 * Get musician dashboard information
 *
 * Response includes:
 * - Musician profile
 * - Token deployment status
 * - Wallet information
 * - Profile completion status
 */
router.get('/:id/dashboard', async (req, res) => {
    try {
        const { id } = req.params;
        // Get musician
        const musician = await musicianService_1.MusicianService.getMusicianById(id);
        // Calculate profile completion
        const profileFields = [musician.musicianName, musician.genre, musician.bio, musician.profileImage];
        const completedFields = profileFields.filter(field => field && String(field).trim().length > 0).length;
        const profileCompletion = Math.round((completedFields / profileFields.length) * 100);
        return res.status(200).json({
            musicianId: musician._id,
            profile: {
                name: musician.musicianName,
                genre: musician.genre,
                bio: musician.bio,
                profileImage: musician.profileImage,
                socialLinks: musician.socialLinks,
                walletAddress: musician.walletAddress,
                completionPercentage: profileCompletion,
            },
            token: musician.isTokenDeployed
                ? {
                    address: musician.tokenAddress,
                    deployed: true,
                    deploymentDate: musician.updatedAt,
                    txHash: musician.tokenDeploymentTx,
                    explorerUrl: `https://amoy.polygonscan.com/address/${musician.tokenAddress}`,
                }
                : {
                    address: null,
                    deployed: false,
                    deploymentDate: null,
                    txHash: null,
                    explorerUrl: null,
                },
            stats: {
                createdAt: musician.createdAt,
                updatedAt: musician.updatedAt,
            },
        });
    }
    catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * GET /api/musicians
 * List all musicians (with pagination)
 *
 * Query parameters:
 * - skip: number (default: 0)
 * - limit: number (default: 20, max: 100)
 */
router.get('/', async (req, res) => {
    try {
        let skip = parseInt(req.query.skip) || 0;
        let limit = parseInt(req.query.limit) || 20;
        // Validate pagination parameters
        if (skip < 0)
            skip = 0;
        if (limit < 1)
            limit = 1;
        if (limit > 100)
            limit = 100;
        const result = await musicianService_1.MusicianService.listMusicians(skip, limit);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json((0, apiErrorFormatter_1.formatError)(error, 500, req.originalUrl));
    }
});
/**
 * GET /api/musicians/search
 * Search musicians by name
 *
 * Query parameters:
 * - q: string (search query)
 * - skip: number (default: 0)
 * - limit: number (default: 20, max: 100)
 */
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.trim().length === 0) {
            return res.status(400).json((0, apiErrorFormatter_1.formatError)('Search query is required', 400, req.originalUrl));
        }
        let skip = parseInt(req.query.skip) || 0;
        let limit = parseInt(req.query.limit) || 20;
        if (skip < 0)
            skip = 0;
        if (limit < 1)
            limit = 1;
        if (limit > 100)
            limit = 100;
        const result = await musicianService_1.MusicianService.searchByName(query, skip, limit);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json((0, apiErrorFormatter_1.formatError)(error, 500, req.originalUrl));
    }
});
exports.default = router;
//# sourceMappingURL=musicians.js.map