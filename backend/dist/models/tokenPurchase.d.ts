import mongoose, { Document } from 'mongoose';
/**
 * TokenPurchase 스키마
 * 팬의 토큰 구매 기록 관리
 */
interface ITokenPurchaseDocument extends Document {
    musicianId: mongoose.Types.ObjectId;
    fanWalletAddress: string;
    amount: number;
    totalCost: string;
    txHash: string;
    blockNumber: number;
    status: 'pending' | 'completed' | 'failed';
    errorMessage?: string;
    tokenAddress: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TokenPurchase: mongoose.Model<ITokenPurchaseDocument, {}, {}, {}, mongoose.Document<unknown, {}, ITokenPurchaseDocument, {}, mongoose.DefaultSchemaOptions> & ITokenPurchaseDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, ITokenPurchaseDocument>;
export type { ITokenPurchaseDocument };
//# sourceMappingURL=tokenPurchase.d.ts.map