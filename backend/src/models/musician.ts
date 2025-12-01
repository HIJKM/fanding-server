import mongoose, { Schema, Document } from 'mongoose';

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
  totalEarnings: string; // wei 단위 (문자열로 정확도 보존)
  withdrawnAmount: string; // wei 단위 (문자열로 정확도 보존)
  createdAt: Date;
  updatedAt: Date;
}

const musicianSchema = new Schema<IMusicianDocument>(
  {
    // 사용자 ID (User 컬렉션 외부키)
    userId: {
      type: String,
      required: true,
      description: 'Unique user identifier',
    },

    // 지갑 주소 (여러 뮤지션이 같은 지갑을 사용할 수 있음)
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      description: 'Ethereum wallet address in checksummed format',
    },

    // 토큰 컨트랙트 주소
    tokenAddress: {
      type: String,
      sparse: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      description: 'Deployed MusicianToken contract address',
    },

    // 뮤지션 이름
    musicianName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
      description: 'Display name of the musician',
    },

    // 장르
    genre: {
      type: String,
      trim: true,
      maxlength: 50,
      description: 'Primary music genre',
    },

    // 자기소개
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      description: 'Short biography of the musician',
    },

    // 프로필 이미지 URL
    profileImage: {
      type: String,
      trim: true,
      description: 'URL to profile image',
    },

    // 소셜 링크
    socialLinks: {
      type: {
        instagram: { type: String, optional: true },
        youtube: { type: String, optional: true },
        twitter: { type: String, optional: true },
      },
      default: {},
      description: 'Social media profile links',
    },

    // 토큰 배포 여부
    isTokenDeployed: {
      type: Boolean,
      default: false,
      description: 'Whether the musician token has been deployed',
    },

    // 토큰 배포 트랜잭션 해시
    tokenDeploymentTx: {
      type: String,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{64}$/,
      description: 'Transaction hash of token deployment',
    },

    // 총 수익 (wei)
    totalEarnings: {
      type: String,
      default: '0',
      description: 'Total earnings from token sales in wei',
    },

    // 출금된 금액 (wei)
    withdrawnAmount: {
      type: String,
      default: '0',
      description: 'Total amount withdrawn in wei',
    },
  },
  {
    timestamps: true,
    collection: 'musicians',
    strict: true,
  }
);

// 모델 생성
export const Musician = mongoose.model<IMusicianDocument>(
  'Musician',
  musicianSchema,
  'musicians'
);

export type { IMusicianDocument };
