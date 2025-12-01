import mongoose, { Schema, Document } from 'mongoose';

/**
 * TokenPurchase 스키마
 * 팬의 토큰 구매 기록 관리
 */
interface ITokenPurchaseDocument extends Document {
  musicianId: mongoose.Types.ObjectId;
  fanWalletAddress: string;
  amount: number;
  totalCost: string; // BigInt as string (wei)
  txHash: string;
  blockNumber: number;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  tokenAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const tokenPurchaseSchema = new Schema<ITokenPurchaseDocument>(
  {
    // 뮤지션 ID (외부키)
    musicianId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    collection: 'token_purchases',
    strict: true,
  }
);

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
export const TokenPurchase = mongoose.model<ITokenPurchaseDocument>(
  'TokenPurchase',
  tokenPurchaseSchema,
  'token_purchases'
);

export type { ITokenPurchaseDocument };
