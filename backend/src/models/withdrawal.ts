import mongoose, { Schema, Document } from 'mongoose';

/**
 * Withdrawal 스키마
 * 아티스트의 출금 기록 관리
 */
interface IWithdrawalDocument extends Document {
  musicianId: mongoose.Types.ObjectId;
  musicianWalletAddress: string;
  amount: string; // wei 단위 (문자열로 정확도 보존)
  txHash?: string; // 출금 트랜잭션 해시
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawalDocument>(
  {
    // 뮤지션 ID (외부키)
    musicianId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    collection: 'withdrawals',
    strict: true,
  }
);

// 인덱스 정의
// 1. 뮤지션별 출금 이력 조회
withdrawalSchema.index({ musicianId: 1, createdAt: -1 });

// 2. 상태별 조회 (pending 트랜잭션 확인)
withdrawalSchema.index({ status: 1, createdAt: -1 });

// 3. 지갑별 출금 이력
withdrawalSchema.index({ musicianWalletAddress: 1, createdAt: -1 });

// 모델 생성
export const Withdrawal = mongoose.model<IWithdrawalDocument>(
  'Withdrawal',
  withdrawalSchema,
  'withdrawals'
);

export type { IWithdrawalDocument };
