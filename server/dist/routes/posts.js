"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postService_1 = require("../services/postService");
const musicianService_1 = require("../services/musicianService");
const apiErrorFormatter_1 = require("../utils/apiErrorFormatter");
const validation_1 = require("../middleware/validation");
/**
 * Posts API Routes
 * Handles musician posts and updates
 */
const router = express_1.default.Router();
// Apply global middleware to post routes
router.use((0, validation_1.sanitizeRequestMiddleware)());
/**
 * POST /api/posts
 * Create a new post for a musician
 *
 * Request body:
 * {
 *   "musicianId": "musician_id",
 *   "title": "Post title",
 *   "content": "Post content",
 *   "image": "https://..." (optional)
 * }
 */
router.post('/', (0, validation_1.validateNonEmptyBodyMiddleware)(), async (req, res) => {
    try {
        const { musicianId, title, content, image } = req.body;
        // Validate required fields
        const errors = {};
        if (!musicianId || typeof musicianId !== 'string') {
            errors.musicianId = 'Musician ID is required';
        }
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            errors.title = 'Post title is required and must be non-empty';
        }
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            errors.content = 'Post content is required and must be non-empty';
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json((0, apiErrorFormatter_1.formatValidationError)(errors, 400, req.originalUrl));
        }
        // Verify musician exists
        try {
            await musicianService_1.MusicianService.getMusicianById(musicianId);
        }
        catch {
            return res.status(404).json((0, apiErrorFormatter_1.formatError)('Musician not found', 404, req.originalUrl));
        }
        // Create post
        const post = await postService_1.PostService.createPost({
            musicianId,
            title: title.trim(),
            content: content.trim(),
            image,
        });
        return res.status(201).json({
            postId: post._id,
            musicianId: post.musicianId,
            title: post.title,
            content: post.content,
            image: post.image,
            likes: post.likes,
            comments: post.comments,
            createdAt: post.createdAt,
        });
    }
    catch (error) {
        return res
            .status(500)
            .json((0, apiErrorFormatter_1.formatError)(error, 500, req.originalUrl));
    }
});
/**
 * GET /api/posts/:musicianId
 * Get all posts for a specific musician
 *
 * Query parameters:
 * - skip: number (default: 0)
 * - limit: number (default: 20, max: 100)
 */
router.get('/:musicianId', async (req, res) => {
    try {
        const { musicianId } = req.params;
        let skip = parseInt(req.query.skip) || 0;
        let limit = parseInt(req.query.limit) || 20;
        // Validate pagination parameters
        if (skip < 0)
            skip = 0;
        if (limit < 1)
            limit = 1;
        if (limit > 100)
            limit = 100;
        // Verify musician exists
        try {
            await musicianService_1.MusicianService.getMusicianById(musicianId);
        }
        catch {
            return res.status(404).json((0, apiErrorFormatter_1.formatError)('Musician not found', 404, req.originalUrl));
        }
        const result = await postService_1.PostService.getPostsByMusicianId(musicianId, skip, limit);
        return res.status(200).json(result);
    }
    catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * GET /api/posts/feed/all
 * Get all posts from all musicians (feed)
 *
 * Query parameters:
 * - skip: number (default: 0)
 * - limit: number (default: 20, max: 100)
 */
router.get('/feed/all', async (req, res) => {
    try {
        let skip = parseInt(req.query.skip) || 0;
        let limit = parseInt(req.query.limit) || 20;
        // Validate pagination parameters
        if (skip < 0)
            skip = 0;
        if (limit < 1)
            limit = 1;
        if (limit > 100)
            limit = 100;
        const result = await postService_1.PostService.getAllPosts(skip, limit);
        return res.status(200).json(result);
    }
    catch (error) {
        return res
            .status(500)
            .json((0, apiErrorFormatter_1.formatError)(error, 500, req.originalUrl));
    }
});
/**
 * GET /api/posts/:postId/details
 * Get a specific post by ID
 */
router.get('/:postId/details', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await postService_1.PostService.getPostById(postId);
        return res.status(200).json({
            postId: post._id,
            musician: post.musicianId,
            title: post.title,
            content: post.content,
            image: post.image,
            likes: post.likes,
            comments: post.comments,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        });
    }
    catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * PUT /api/posts/:postId
 * Update a post
 *
 * Request body:
 * {
 *   "title": "Updated title" (optional),
 *   "content": "Updated content" (optional),
 *   "image": "https://..." (optional)
 * }
 */
router.put('/:postId', (0, validation_1.validateNonEmptyBodyMiddleware)(), async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content, image } = req.body;
        // Validate at least one field is provided
        if (!title && !content && !image) {
            return res.status(400).json((0, apiErrorFormatter_1.formatError)('At least one field (title, content, or image) must be provided', 400, req.originalUrl));
        }
        const updateData = {};
        if (title)
            updateData.title = title.trim();
        if (content)
            updateData.content = content.trim();
        if (image)
            updateData.image = image;
        const post = await postService_1.PostService.updatePost(postId, updateData);
        return res.status(200).json({
            postId: post._id,
            title: post.title,
            content: post.content,
            image: post.image,
            updatedAt: post.updatedAt,
        });
    }
    catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * DELETE /api/posts/:postId
 * Delete a post
 */
router.delete('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await postService_1.PostService.deletePost(postId);
        return res.status(200).json({
            message: 'Post deleted successfully',
            postId: post._id,
        });
    }
    catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * POST /api/posts/:postId/like
 * Like a post
 */
router.post('/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await postService_1.PostService.likePost(postId);
        return res.status(200).json({
            postId: post._id,
            likes: post.likes,
        });
    }
    catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * POST /api/posts/:postId/unlike
 * Unlike a post
 */
router.post('/:postId/unlike', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await postService_1.PostService.unlikePost(postId);
        return res.status(200).json({
            postId: post._id,
            likes: post.likes,
        });
    }
    catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * POST /api/posts/:postId/comments
 * Add a comment to a post
 *
 * Request body:
 * {
 *   "userId": "user_id",
 *   "username": "username",
 *   "text": "Comment text"
 * }
 */
router.post('/:postId/comments', (0, validation_1.validateNonEmptyBodyMiddleware)(), async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, username, text } = req.body;
        // Validate required fields
        const errors = {};
        if (!userId || typeof userId !== 'string') {
            errors.userId = 'User ID is required';
        }
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            errors.username = 'Username is required and must be non-empty';
        }
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            errors.text = 'Comment text is required and must be non-empty';
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json((0, apiErrorFormatter_1.formatValidationError)(errors, 400, req.originalUrl));
        }
        const post = await postService_1.PostService.addComment(postId, {
            userId,
            username: username.trim(),
            text: text.trim(),
        });
        return res.status(201).json({
            postId: post._id,
            comments: post.comments,
            commentCount: post.comments.length,
        });
    }
    catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
/**
 * DELETE /api/posts/:postId/comments/:commentIndex
 * Remove a comment from a post
 */
router.delete('/:postId/comments/:commentIndex', async (req, res) => {
    try {
        const { postId, commentIndex } = req.params;
        const index = parseInt(commentIndex);
        const post = await postService_1.PostService.removeComment(postId, index);
        return res.status(200).json({
            postId: post._id,
            comments: post.comments,
            commentCount: post.comments.length,
        });
    }
    catch (error) {
        const statusCode = error.message.includes('not found') || error.message.includes('Invalid') ? 404 : 500;
        return res
            .status(statusCode)
            .json((0, apiErrorFormatter_1.formatError)(error, statusCode, req.originalUrl));
    }
});
exports.default = router;
//# sourceMappingURL=posts.js.map