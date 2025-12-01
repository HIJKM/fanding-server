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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Withdrawal = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const withdrawalSchema = new mongoose_1.Schema({
    // 뮤지션 ID (외부키)
    musicianId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Musician',
        index: true,
        description: 'Reference to Musician document',
    },
    // 뮤지션 지갑 주소
    musicianWalletAddress: {
        type: String,
        required: true,
        lowercase: true,
        match: /^0x[a-fA-F0-9]{40}$/,
        description: 'Musician wallet address receiving the withdrawal',
    },
    // 출금 금액 (wei)
    amount: {
        type: String,
        required: true,
        description: 'Withdrawal amount in wei (stored as string to preserve precision)',
    },
    // 출금 트랜잭션 해시
    txHash: {
        type: String,
        lowercase: true,
        match: /^0x[a-fA-F0-9]{64}$/,
        description: 'Blockchain transaction hash of withdrawal',
    },
    // 출금 상태
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
        index: true,
        description: 'Withdrawal status',
    },
    // 에러 메시지
    errorMessage: {
        type: String,
        description: 'Error message if withdrawal failed',
    },
}, {
    timestamps: true,
    collection: 'withdrawals',
    strict: true,
});
// 인덱스 정의
// 1. 뮤지션별 출금 이력 조회
withdrawalSchema.index({ musicianId: 1, createdAt: -1 });
// 2. 상태별 조회 (pending 트랜잭션 확인)
withdrawalSchema.index({ status: 1, createdAt: -1 });
// 3. 지갑별 출금 이력
withdrawalSchema.index({ musicianWalletAddress: 1, createdAt: -1 });
// 모델 생성
exports.Withdrawal = mongoose_1.default.model('Withdrawal', withdrawalSchema, 'withdrawals');
//# sourceMappingURL=withdrawal.js.map