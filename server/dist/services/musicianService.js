"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicianService = void 0;
const musician_1 = require("../models/musician");
const walletValidator_1 = require("../utils/walletValidator");
const demoMusicians_1 = require("../data/demoMusicians");
class MusicianService {
    /**
     * Create a new musician profile
     */
    static async createMusician(input) {
        try {
            // Validate wallet address
            const normalized = walletValidator_1.WalletValidator.validateAndNormalize(input.walletAddress);
            // Create new musician (allow multiple musicians per wallet)
            const musician = new musician_1.Musician({
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
        }
        catch (error) {
            throw new Error(`Failed to create musician: ${error.message}`);
        }
    }
    /**
     * Get musician by ID
     */
    static async getMusicianById(musicianId) {
        try {
            const musician = await musician_1.Musician.findById(musicianId);
            if (!musician) {
                throw new Error('Musician not found');
            }
            return musician;
        }
        catch (error) {
            throw new Error(`Failed to get musician: ${error.message}`);
        }
    }
    /**
     * Get all musicians by wallet address
     */
    static async getMusicianByWallet(walletAddress) {
        try {
            const normalized = walletValidator_1.WalletValidator.validateAndNormalize(walletAddress);
            const musicians = await musician_1.Musician.find({ walletAddress: normalized }).sort({ createdAt: -1 });
            if (!musicians || musicians.length === 0) {
                throw new Error('Musicians not found for this wallet address');
            }
            return musicians;
        }
        catch (error) {
            throw new Error(`Failed to get musicians by wallet: ${error.message}`);
        }
    }
    /**
     * Get musician by user ID
     */
    static async getMusicianByUserId(userId) {
        try {
            const musician = await musician_1.Musician.findOne({ userId });
            if (!musician) {
                throw new Error('Musician not found for this user');
            }
            return musician;
        }
        catch (error) {
            throw new Error(`Failed to get musician by user ID: ${error.message}`);
        }
    }
    /**
     * Update musician profile
     */
    static async updateMusician(musicianId, input) {
        try {
            // Validate wallet if provided
            if (input.walletAddress) {
                input.walletAddress = walletValidator_1.WalletValidator.validateAndNormalize(input.walletAddress);
            }
            const musician = await musician_1.Musician.findByIdAndUpdate(musicianId, { ...input, updatedAt: new Date() }, { new: true });
            if (!musician) {
                throw new Error('Musician not found');
            }
            return musician;
        }
        catch (error) {
            throw new Error(`Failed to update musician: ${error.message}`);
        }
    }
    /**
     * Update musician token information after deployment
     */
    static async updateTokenInfo(musicianId, tokenAddress, deploymentTxHash) {
        try {
            // Validate token address
            walletValidator_1.WalletValidator.validateApiAddress(tokenAddress);
            const musician = await musician_1.Musician.findByIdAndUpdate(musicianId, {
                tokenAddress,
                deploymentTxHash,
                isTokenDeployed: true,
                tokenDeploymentStatus: 'confirmed',
                updatedAt: new Date(),
            }, { new: true });
            if (!musician) {
                throw new Error('Musician not found');
            }
            return musician;
        }
        catch (error) {
            throw new Error(`Failed to update token info: ${error.message}`);
        }
    }
    /**
     * Check if musician already has a deployed token
     */
    static async hasDeployedToken(musicianId) {
        try {
            const musician = await musician_1.Musician.findById(musicianId);
            return musician?.isTokenDeployed || false;
        }
        catch (error) {
            throw new Error(`Failed to check deployment status: ${error.message}`);
        }
    }
    /**
     * List all musicians (with pagination) - includes demo musicians
     */
    static async listMusicians(skip = 0, limit = 20) {
        try {
            // Get real musicians from database
            const realMusicians = await musician_1.Musician.find()
                .sort({ createdAt: -1 });
            // Combine demo and real musicians, sort by date
            const allMusicians = [...demoMusicians_1.DEMO_MUSICIANS, ...realMusicians].sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Newest first
            });
            // Apply pagination
            const paginatedMusicians = allMusicians.slice(skip, skip + limit);
            const total = allMusicians.length;
            return {
                musicians: paginatedMusicians,
                pagination: {
                    skip,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new Error(`Failed to list musicians: ${error.message}`);
        }
    }
    /**
     * Search musicians by name - includes demo musicians
     */
    static async searchByName(name, skip = 0, limit = 20) {
        try {
            const regex = new RegExp(name, 'i'); // Case-insensitive search
            // Get real musicians from database
            const realMusicians = await musician_1.Musician.find({ musicianName: regex });
            // Search demo musicians
            const demoMusicians = demoMusicians_1.DEMO_MUSICIANS.filter((m) => regex.test(m.musicianName));
            // Combine and sort
            const allMusicians = [...demoMusicians, ...realMusicians].sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Newest first
            });
            // Apply pagination
            const paginatedMusicians = allMusicians.slice(skip, skip + limit);
            const total = allMusicians.length;
            return {
                musicians: paginatedMusicians,
                pagination: {
                    skip,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new Error(`Failed to search musicians: ${error.message}`);
        }
    }
}
exports.MusicianService = MusicianService;
//# sourceMappingURL=musicianService.js.map