import mongoose, { Document } from 'mongoose';
/**
 * Post Model
 * Stores musician updates and news posts
 */
export interface PostDocument extends Document {
    musicianId: mongoose.Types.ObjectId;
    title: string;
    content: string;
    image?: string;
    createdBy?: string;
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
export declare const Post: mongoose.Model<PostDocument, {}, {}, {}, mongoose.Document<unknown, {}, PostDocument, {}, mongoose.DefaultSchemaOptions> & PostDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, PostDocument>;
//# sourceMappingURL=post.d.ts.map