"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWithdrawableAmount = getWithdrawableAmount;
exports.getWithdrawalStats = getWithdrawalStats;
exports.createWithdrawalRequest = createWithdrawalRequest;
exports.completeWithdrawal = completeWithdrawal;
exports.failWithdrawal = failWithdrawal;
exports.getMusicianWithdrawals = getMusicianWithdrawals;
const musician_1 = require("../models/musician");
const withdrawal_1 = require("../models/withdrawal");
const tokenPurchase_1 = require("../models/tokenPurchase");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Withdrawal Service
 * 아티스트의 토큰 판매 수익 출금 관리
 */
/**
 * 아티스트의 출금 가능 금액 계산
 * @param musicianId - 뮤지션 ID
 * @returns 출금 가능 금액 (wei)
 */
async function getWithdrawableAmount(musicianId) {
    const musicianObjectId = new mongoose_1.default.Types.ObjectId(musicianId);
    // 뮤지션의 총 판매액 합계
    const salesAggregate = await tokenPurchase_1.TokenPurchase.aggregate([
        {
            $match: {
                musicianId: musicianObjectId,
                status: 'completed',
            },
        },
        {
            $group: {
                _id: null,
                totalSales: {
                    $sum: {
                        $toDecimal: '$totalCost',
                    },
                },
            },
        },
    ]);
    const totalSales = salesAggregate.length > 0 ? salesAggregate[0].totalSales : 0;
    // 뮤지션의 이미 출금한 금액
    const musician = await musician_1.Musician.findById(musicianObjectId);
    const withdrawnAmount = musician ? BigInt(musician.withdrawnAmount || '0') : BigInt(0);
    // 출금 가능액 = 총 판매액 - 출금액
    const withdrawable = BigInt(totalSales.toString()) - withdrawnAmount;
    return Math.max(0, Number(withdrawable)).toString();
}
/**
 * 아티스트의 출금 통계 조회
 * @param musicianId - 뮤지션 ID
 * @returns 출금 통계 { totalEarnings, withdrawnAmount, withdrawable }
 */
async function getWithdrawalStats(musicianId) {
    const musicianObjectId = new mongoose_1.default.Types.ObjectId(musicianId);
    // 뮤지션의 총 판매액
    const salesAggregate = await tokenPurchase_1.TokenPurchase.aggregate([
        {
            $match: {
                musicianId: musicianObjectId,
                status: 'completed',
            },
        },
        {
            $group: {
                _id: null,
                totalSales: {
                    $sum: {
                        $toDecimal: '$totalCost',
                    },
                },
            },
        },
    ]);
    const totalEarnings = salesAggregate.length > 0
        ? BigInt(Math.floor(Number(salesAggregate[0].totalSales))).toString()
        : '0';
    // 뮤지션 정보 조회
    const musician = await musician_1.Musician.findById(musicianObjectId);
    if (!musician) {
        throw new Error('Musician not found');
    }
    const withdrawnAmount = musician.withdrawnAmount || '0';
    const withdrawable = (BigInt(totalEarnings) - BigInt(withdrawnAmount)).toString();
    return {
        totalEarnings,
        withdrawnAmount,
        withdrawable,
    };
}
/**
 * 출금 요청 생성 (데이터베이스 기록)
 * @param musicianId - 뮤지션 ID
 * @param musicianWalletAddress - 뮤지션 지갑 주소
 * @param amount - 출금 금액 (wei)
 * @returns 생성된 Withdrawal 도큐먼트
 */
async function createWithdrawalRequest(musicianId, musicianWalletAddress, amount) {
    const musicianObjectId = new mongoose_1.default.Types.ObjectId(musicianId);
    // 출금 가능 금액 확인
    const withdrawable = await getWithdrawableAmount(musicianId);
    if (BigInt(amount) > BigInt(withdrawable)) {
        throw new Error(`Insufficient withdrawable amount. Available: ${withdrawable} wei, Requested: ${amount} wei`);
    }
    // 출금 기록 생성
    const withdrawal = new withdrawal_1.Withdrawal({
        musicianId: musicianObjectId,
        musicianWalletAddress: musicianWalletAddress.toLowerCase(),
        amount,
        status: 'pending',
    });
    await withdrawal.save();
    return withdrawal;
}
/**
 * 출금 완료 처리
 * @param withdrawalId - 출금 기록 ID
 * @param txHash - 트랜잭션 해시
 */
async function completeWithdrawal(withdrawalId, txHash) {
    const withdrawal = await withdrawal_1.Withdrawal.findByIdAndUpdate(withdrawalId, {
        status: 'completed',
        txHash: txHash.toLowerCase(),
    }, { new: true });
    if (!withdrawal) {
        throw new Error('Withdrawal not found');
    }
    // 뮤지션의 출금액 업데이트
    await musician_1.Musician.findByIdAndUpdate(withdrawal.musicianId, {
        $inc: {
            withdrawnAmount: withdrawal.amount,
        },
    }, { new: true });
    return withdrawal;
}
/**
 * 출금 실패 처리
 * @param withdrawalId - 출금 기록 ID
 * @param errorMessage - 에러 메시지
 */
async function failWithdrawal(withdrawalId, errorMessage) {
    const withdrawal = await withdrawal_1.Withdrawal.findByIdAndUpdate(withdrawalId, {
        status: 'failed',
        errorMessage,
    }, { new: true });
    if (!withdrawal) {
        throw new Error('Withdrawal not found');
    }
    return withdrawal;
}
/**
 * 아티스트의 출금 이력 조회
 * @param musicianId - 뮤지션 ID
 * @param skip - 스킵할 레코드 수
 * @param limit - 조회할 레코드 수
 * @returns { withdrawals: [], total: number }
 */
async function getMusicianWithdrawals(musicianId, skip = 0, limit = 10) {
    const musicianObjectId = new mongoose_1.default.Types.ObjectId(musicianId);
    const withdrawals = await withdrawal_1.Withdrawal.find({
        musicianId: musicianObjectId,
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await withdrawal_1.Withdrawal.countDocuments({
        musicianId: musicianObjectId,
    });
    return {
        withdrawals,
        total,
        pagination: {
            skip,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
exports.default = {
    getWithdrawableAmount,
    getWithdrawalStats,
    createWithdrawalRequest,
    completeWithdrawal,
    failWithdrawal,
    getMusicianWithdrawals,
};
//# sourceMappingURL=withdrawalService.js.map