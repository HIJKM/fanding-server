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
declare class TokenPurchaseService {
    /**
     * Purchase musician token
     */
    purchaseToken(request: PurchaseRequest): Promise<PurchaseResult>;
    /**
     * Get purchase history for a fan
     */
    getPurchaseHistory(fanWalletAddress: string, skip?: number, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("../models/tokenPurchase").ITokenPurchaseDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/tokenPurchase").ITokenPurchaseDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    /**
     * Get purchases for a musician
     */
    getMusicianPurchases(musicianId: string, skip?: number, limit?: number): Promise<(import("mongoose").Document<unknown, {}, import("../models/tokenPurchase").ITokenPurchaseDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/tokenPurchase").ITokenPurchaseDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    /**
     * Validate purchase request
     */
    private validateRequest;
}
export declare const tokenPurchaseService: TokenPurchaseService;
export type { PurchaseRequest, PurchaseResult };
//# sourceMappingURL=tokenPurchaseService.d.ts.map