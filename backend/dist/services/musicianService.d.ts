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
declare class MusicianService {
    /**
     * Create a new musician profile
     */
    static createMusician(input: CreateMusicianInput): Promise<import("mongoose").Document<unknown, {}, import("../models/musician").IMusicianDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/musician").IMusicianDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Get musician by ID
     */
    static getMusicianById(musicianId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/musician").IMusicianDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/musician").IMusicianDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Get all musicians by wallet address
     */
    static getMusicianByWallet(walletAddress: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/musician").IMusicianDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/musician").IMusicianDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    /**
     * Get musician by user ID
     */
    static getMusicianByUserId(userId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/musician").IMusicianDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/musician").IMusicianDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Update musician profile
     */
    static updateMusician(musicianId: string, input: UpdateMusicianInput): Promise<import("mongoose").Document<unknown, {}, import("../models/musician").IMusicianDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/musician").IMusicianDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Update musician token information after deployment
     */
    static updateTokenInfo(musicianId: string, tokenAddress: string, deploymentTxHash: string): Promise<import("mongoose").Document<unknown, {}, import("../models/musician").IMusicianDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/musician").IMusicianDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Check if musician already has a deployed token
     */
    static hasDeployedToken(musicianId: string): Promise<boolean>;
    /**
     * List all musicians (with pagination) - includes demo musicians
     */
    static listMusicians(skip?: number, limit?: number): Promise<{
        musicians: ((import("mongoose").Document<unknown, {}, import("../models/musician").IMusicianDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/musician").IMusicianDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | {
            _id: string;
            userId: string;
            musicianName: string;
            genre: string;
            walletAddress: string;
            isTokenDeployed: boolean;
            tokenAddress: string;
            createdAt: Date;
        })[];
        pagination: {
            skip: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    /**
     * Search musicians by name - includes demo musicians
     */
    static searchByName(name: string, skip?: number, limit?: number): Promise<{
        musicians: ((import("mongoose").Document<unknown, {}, import("../models/musician").IMusicianDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/musician").IMusicianDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | {
            _id: string;
            userId: string;
            musicianName: string;
            genre: string;
            walletAddress: string;
            isTokenDeployed: boolean;
            tokenAddress: string;
            createdAt: Date;
        })[];
        pagination: {
            skip: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
}
export { MusicianService, CreateMusicianInput, UpdateMusicianInput };
//# sourceMappingURL=musicianService.d.ts.map