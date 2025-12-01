/**
 * Post Service
 * Handles all post-related database operations
 */
interface CreatePostInput {
    musicianId: string;
    title: string;
    content: string;
    image?: string;
}
interface AddCommentInput {
    userId: string;
    username: string;
    text: string;
}
declare class PostService {
    /**
     * Create a new post
     */
    static createPost(input: CreatePostInput): Promise<import("mongoose").Document<unknown, {}, import("../models/post").PostDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/post").PostDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Get post by ID
     */
    static getPostById(postId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/post").PostDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/post").PostDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Get all posts for a musician
     */
    static getPostsByMusicianId(musicianId: string, skip?: number, limit?: number): Promise<{
        posts: (import("mongoose").Document<unknown, {}, import("../models/post").PostDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/post").PostDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            skip: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    /**
     * Update post
     */
    static updatePost(postId: string, input: Partial<CreatePostInput>): Promise<import("mongoose").Document<unknown, {}, import("../models/post").PostDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/post").PostDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Delete post
     */
    static deletePost(postId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/post").PostDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/post").PostDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Like a post
     */
    static likePost(postId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/post").PostDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/post").PostDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Unlike a post
     */
    static unlikePost(postId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/post").PostDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/post").PostDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Add comment to post
     */
    static addComment(postId: string, input: AddCommentInput): Promise<import("mongoose").Document<unknown, {}, import("../models/post").PostDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/post").PostDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Remove comment from post
     */
    static removeComment(postId: string, commentIndex: number): Promise<import("mongoose").Document<unknown, {}, import("../models/post").PostDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/post").PostDocument & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Get all posts (for feed)
     */
    static getAllPosts(skip?: number, limit?: number): Promise<{
        posts: (import("mongoose").Document<unknown, {}, import("../models/post").PostDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../models/post").PostDocument & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            skip: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
}
export { PostService, CreatePostInput, AddCommentInput };
//# sourceMappingURL=postService.d.ts.map