import mongoose from 'mongoose';
/**
 * Withdrawal Service
 * 아티스트의 토큰 판매 수익 출금 관리
 */
/**
 * 아티스트의 출금 가능 금액 계산
 * @param musicianId - 뮤지션 ID
 * @returns 출금 가능 금액 (wei)
 */
export declare function getWithdrawableAmount(musicianId: string): Promise<string>;
/**
 * 아티스트의 출금 통계 조회
 * @param musicianId - 뮤지션 ID
 * @returns 출금 통계 { totalEarnings, withdrawnAmount, withdrawable }
 */
export declare function getWithdrawalStats(musicianId: string): Promise<{
    totalEarnings: string;
    withdrawnAmount: string;
    withdrawable: string;
}>;
/**
 * 출금 요청 생성 (데이터베이스 기록)
 * @param musicianId - 뮤지션 ID
 * @param musicianWalletAddress - 뮤지션 지갑 주소
 * @param amount - 출금 금액 (wei)
 * @returns 생성된 Withdrawal 도큐먼트
 */
export declare function createWithdrawalRequest(musicianId: string, musicianWalletAddress: string, amount: string): Promise<mongoose.Document<unknown, {}, import("../models/withdrawal").IWithdrawalDocument, {}, mongoose.DefaultSchemaOptions> & import("../models/withdrawal").IWithdrawalDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
/**
 * 출금 완료 처리
 * @param withdrawalId - 출금 기록 ID
 * @param txHash - 트랜잭션 해시
 */
export declare function completeWithdrawal(withdrawalId: string, txHash: string): Promise<mongoose.Document<unknown, {}, import("../models/withdrawal").IWithdrawalDocument, {}, mongoose.DefaultSchemaOptions> & import("../models/withdrawal").IWithdrawalDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
/**
 * 출금 실패 처리
 * @param withdrawalId - 출금 기록 ID
 * @param errorMessage - 에러 메시지
 */
export declare function failWithdrawal(withdrawalId: string, errorMessage: string): Promise<mongoose.Document<unknown, {}, import("../models/withdrawal").IWithdrawalDocument, {}, mongoose.DefaultSchemaOptions> & import("../models/withdrawal").IWithdrawalDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
/**
 * 아티스트의 출금 이력 조회
 * @param musicianId - 뮤지션 ID
 * @param skip - 스킵할 레코드 수
 * @param limit - 조회할 레코드 수
 * @returns { withdrawals: [], total: number }
 */
export declare function getMusicianWithdrawals(musicianId: string, skip?: number, limit?: number): Promise<{
    withdrawals: (mongoose.Document<unknown, {}, import("../models/withdrawal").IWithdrawalDocument, {}, mongoose.DefaultSchemaOptions> & import("../models/withdrawal").IWithdrawalDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    pagination: {
        skip: number;
        limit: number;
        total: number;
        pages: number;
    };
}>;
declare const _default: {
    getWithdrawableAmount: typeof getWithdrawableAmount;
    getWithdrawalStats: typeof getWithdrawalStats;
    createWithdrawalRequest: typeof createWithdrawalRequest;
    completeWithdrawal: typeof completeWithdrawal;
    failWithdrawal: typeof failWithdrawal;
    getMusicianWithdrawals: typeof getMusicianWithdrawals;
};
export default _default;
//# sourceMappingURL=withdrawalService.d.ts.map