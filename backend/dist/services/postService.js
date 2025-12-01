"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const post_1 = require("../models/post");
class PostService {
    /**
     * Create a new post
     */
    static async createPost(input) {
        try {
            const post = new post_1.Post({
                musicianId: input.musicianId,
                title: input.title,
                content: input.content,
                image: input.image,
                likes: 0,
                comments: [],
            });
            await post.save();
            return post;
        }
        catch (error) {
            throw new Error(`Failed to create post: ${error.message}`);
        }
    }
    /**
     * Get post by ID
     */
    static async getPostById(postId) {
        try {
            const post = await post_1.Post.findById(postId).populate('musicianId', 'musicianName profileImage');
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        }
        catch (error) {
            throw new Error(`Failed to get post: ${error.message}`);
        }
    }
    /**
     * Get all posts for a musician
     */
    static async getPostsByMusicianId(musicianId, skip = 0, limit = 20) {
        try {
            const posts = await post_1.Post.find({ musicianId })
                .populate('musicianId', 'musicianName profileImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = await post_1.Post.countDocuments({ musicianId });
            return {
                posts,
                pagination: {
                    skip,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new Error(`Failed to get posts: ${error.message}`);
        }
    }
    /**
     * Update post
     */
    static async updatePost(postId, input) {
        try {
            const post = await post_1.Post.findByIdAndUpdate(postId, { ...input, updatedAt: new Date() }, { new: true });
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        }
        catch (error) {
            throw new Error(`Failed to update post: ${error.message}`);
        }
    }
    /**
     * Delete post
     */
    static async deletePost(postId) {
        try {
            const post = await post_1.Post.findByIdAndDelete(postId);
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        }
        catch (error) {
            throw new Error(`Failed to delete post: ${error.message}`);
        }
    }
    /**
     * Like a post
     */
    static async likePost(postId) {
        try {
            const post = await post_1.Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true });
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        }
        catch (error) {
            throw new Error(`Failed to like post: ${error.message}`);
        }
    }
    /**
     * Unlike a post
     */
    static async unlikePost(postId) {
        try {
            const post = await post_1.Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } }, { new: true });
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        }
        catch (error) {
            throw new Error(`Failed to unlike post: ${error.message}`);
        }
    }
    /**
     * Add comment to post
     */
    static async addComment(postId, input) {
        try {
            const post = await post_1.Post.findByIdAndUpdate(postId, {
                $push: {
                    comments: {
                        userId: input.userId,
                        username: input.username,
                        text: input.text,
                        timestamp: new Date(),
                    },
                },
            }, { new: true });
            if (!post) {
                throw new Error('Post not found');
            }
            return post;
        }
        catch (error) {
            throw new Error(`Failed to add comment: ${error.message}`);
        }
    }
    /**
     * Remove comment from post
     */
    static async removeComment(postId, commentIndex) {
        try {
            const post = await post_1.Post.findById(postId);
            if (!post) {
                throw new Error('Post not found');
            }
            if (commentIndex < 0 || commentIndex >= post.comments.length) {
                throw new Error('Invalid comment index');
            }
            post.comments.splice(commentIndex, 1);
            await post.save();
            return post;
        }
        catch (error) {
            throw new Error(`Failed to remove comment: ${error.message}`);
        }
    }
    /**
     * Get all posts (for feed)
     */
    static async getAllPosts(skip = 0, limit = 20) {
        try {
            const posts = await post_1.Post.find()
                .populate('musicianId', 'musicianName profileImage genre')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = await post_1.Post.countDocuments();
            return {
                posts,
                pagination: {
                    skip,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            throw new Error(`Failed to get posts: ${error.message}`);
        }
    }
}
exports.PostService = PostService;
//# sourceMappingURL=postService.js.map