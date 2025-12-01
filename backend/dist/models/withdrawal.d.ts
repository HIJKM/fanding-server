import mongoose, { Document } from 'mongoose';
/**
 * Withdrawal 스키마
 * 아티스트의 출금 기록 관리
 */
interface IWithdrawalDocument extends Document {
    musicianId: mongoose.Types.ObjectId;
    musicianWalletAddress: string;
    amount: string;
    txHash?: string;
    status: 'pending' | 'completed' | 'failed';
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Withdrawal: mongoose.Model<IWithdrawalDocument, {}, {}, {}, mongoose.Document<unknown, {}, IWithdrawalDocument, {}, mongoose.DefaultSchemaOptions> & IWithdrawalDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IWithdrawalDocument>;
export type { IWithdrawalDocument };
//# sourceMappingURL=withdrawal.d.ts.map