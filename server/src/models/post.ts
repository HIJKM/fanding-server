import mongoose, { Schema, Document } from 'mongoose';

/**
 * Post Model
 * Stores musician updates and news posts
 */

export interface PostDocument extends Document {
  musicianId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  image?: string;
  createdBy?: string; // 게시글 작성자의 지갑 주소
  likes: number;
  comments: Array<{
    userId: string;
    username: string;
    text: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostDocument>(
  {
    musicianId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    collection: 'posts',
  }
);

// Index for efficient queries
postSchema.index({ musicianId: 1, createdAt: -1 });

export const Post = mongoose.model<PostDocument>('Post', postSchema);
