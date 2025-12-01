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
exports.Musician = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const musicianSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    collection: 'musicians',
    strict: true,
});
// 모델 생성
exports.Musician = mongoose_1.default.model('Musician', musicianSchema, 'musicians');
//# sourceMappingURL=musician.js.map