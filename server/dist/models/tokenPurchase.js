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
exports.TokenPurchase = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const tokenPurchaseSchema = new mongoose_1.Schema({
    // 뮤지션 ID (외부키)
    musicianId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Musician',
        index: true,
        description: 'Reference to Musician document',
    },
    // 팬 지갑 주소
    fanWalletAddress: {
        type: String,
        required: true,
        lowercase: true,
        match: /^0x[a-fA-F0-9]{40}$/,
        index: true,
        description: 'Fan wallet address',
    },
    // 구매 토큰 수량
    amount: {
        type: Number,
        required: true,
        min: 1,
        description: 'Number of tokens purchased',
    },
    // 총 비용 (wei)
    totalCost: {
        type: String,
        required: true,
        description: 'Total cost in wei (stored as string to preserve precision)',
    },
    // 트랜잭션 해시
    txHash: {
        type: String,
        required: true,
        lowercase: true,
        match: /^0x[a-fA-F0-9]{64}$/,
        unique: true,
        index: true,
        description: 'Blockchain transaction hash',
    },
    // 블록 번호
    blockNumber: {
        type: Number,
        required: true,
        index: true,
        description: 'Block number when transaction was confirmed',
    },
    // 구매 상태
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
        index: true,
        description: 'Transaction status',
    },
    // 에러 메시지
    errorMessage: {
        type: String,
        description: 'Error message if transaction failed',
    },
    // 토큰 컨트랙트 주소
    tokenAddress: {
        type: String,
        required: true,
        lowercase: true,
        match: /^0x[a-fA-F0-9]{40}$/,
        index: true,
        description: 'MusicianToken contract address',
    },
}, {
    timestamps: true,
    collection: 'token_purchases',
    strict: true,
});
// 인덱스 정의
// 1. 뮤지션별 구매 이력 조회
tokenPurchaseSchema.index({ musicianId: 1, createdAt: -1 });
// 2. 팬별 구매 이력 조회
tokenPurchaseSchema.index({ fanWalletAddress: 1, createdAt: -1 });
// 3. 상태별 조회 (pending 트랜잭션 확인)
tokenPurchaseSchema.index({ status: 1, createdAt: -1 });
// 4. 토큰별 구매량 집계
tokenPurchaseSchema.index({ tokenAddress: 1, status: 1 });
// 모델 생성
exports.TokenPurchase = mongoose_1.default.model('TokenPurchase', tokenPurchaseSchema, 'token_purchases');
//# sourceMappingURL=tokenPurchase.js.map