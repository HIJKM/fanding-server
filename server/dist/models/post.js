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
exports.Post = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const postSchema = new mongoose_1.Schema({
    musicianId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Musician',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        description: 'Post title',
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
        description: 'Post content',
    },
    image: {
        type: String,
        trim: true,
        description: 'URL to post image',
    },
    createdBy: {
        type: String,
        lowercase: true,
        match: /^0x[a-fA-F0-9]{40}$/,
        description: '게시글 작성자의 지갑 주소',
    },
    likes: {
        type: Number,
        default: 0,
        description: 'Number of likes',
    },
    comments: [
        {
            userId: {
                type: String,
                required: true,
            },
            username: {
                type: String,
                required: true,
                trim: true,
            },
            text: {
                type: String,
                required: true,
                trim: true,
                maxlength: 500,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true,
    collection: 'posts',
});
// Index for efficient queries
postSchema.index({ musicianId: 1, createdAt: -1 });
exports.Post = mongoose_1.default.model('Post', postSchema);
//# sourceMappingURL=post.js.map