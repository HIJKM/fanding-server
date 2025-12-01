import mongoose, { Document } from 'mongoose';
/**
 * Musician 스키마
 * 뮤지션 정보 및 토큰 배포 현황 관리
 */
interface IMusicianDocument extends Document {
    userId: string;
    walletAddress: string;
    tokenAddress?: string;
    musicianName: string;
    genre?: string;
    bio?: string;
    profileImage?: string;
    socialLinks?: {
        instagram?: string;
        youtube?: string;
        twitter?: string;
    };
    isTokenDeployed: boolean;
    tokenDeploymentTx?: string;
    totalEarnings: string;
    withdrawnAmount: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Musician: mongoose.Model<IMusicianDocument, {}, {}, {}, mongoose.Document<unknown, {}, IMusicianDocument, {}, mongoose.DefaultSchemaOptions> & IMusicianDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IMusicianDocument>;
export type { IMusicianDocument };
//# sourceMappingURL=musician.d.ts.map