import express, { Request, Response, Router } from 'express';
import { PostService } from '../services/postService';
import { MusicianService } from '../services/musicianService';
import { formatError, formatValidationError } from '../utils/apiErrorFormatter';
import { validateNonEmptyBodyMiddleware, sanitizeRequestMiddleware } from '../middleware/validation';

/**
 * Posts API Routes
 * Handles musician posts and updates
 */

const router: Router = express.Router();

// Apply global middleware to post routes
router.use(sanitizeRequestMiddleware());

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
router.post('/', validateNonEmptyBodyMiddleware(), async (req: Request, res: Response) => {
  try {
    const { musicianId, title, content, image } = req.body;

    // Validate required fields
    const errors: { [key: string]: string } = {};

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
      return res.status(400).json(
        formatValidationError(errors, 400, req.originalUrl)
      );
    }

    // Verify musician exists
    try {
      await MusicianService.getMusicianById(musicianId);
    } catch {
      return res.status(404).json(
        formatError('Musician not found', 404, req.originalUrl)
      );
    }

    // Create post
    const post = await PostService.createPost({
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
  } catch (error: any) {
    return res
      .status(500)
      .json(formatError(error, 500, req.originalUrl));
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
router.get('/:musicianId', async (req: Request, res: Response) => {
  try {
    const { musicianId } = req.params;
    let skip = parseInt(req.query.skip as string) || 0;
    let limit = parseInt(req.query.limit as string) || 20;

    // Validate pagination parameters
    if (skip < 0) skip = 0;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    // Verify musician exists
    try {
      await MusicianService.getMusicianById(musicianId);
    } catch {
      return res.status(404).json(
        formatError('Musician not found', 404, req.originalUrl)
      );
    }

    const result = await PostService.getPostsByMusicianId(musicianId, skip, limit);

    return res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error, statusCode, req.originalUrl));
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
router.get('/feed/all', async (req: Request, res: Response) => {
  try {
    let skip = parseInt(req.query.skip as string) || 0;
    let limit = parseInt(req.query.limit as string) || 20;

    // Validate pagination parameters
    if (skip < 0) skip = 0;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    const result = await PostService.getAllPosts(skip, limit);

    return res.status(200).json(result);
  } catch (error: any) {
    return res
      .status(500)
      .json(formatError(error, 500, req.originalUrl));
  }
});

/**
 * GET /api/posts/:postId/details
 * Get a specific post by ID
 */
router.get('/:postId/details', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await PostService.getPostById(postId);

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
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error, statusCode, req.originalUrl));
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
router.put('/:postId', validateNonEmptyBodyMiddleware(), async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { title, content, image } = req.body;

    // Validate at least one field is provided
    if (!title && !content && !image) {
      return res.status(400).json(
        formatError('At least one field (title, content, or image) must be provided', 400, req.originalUrl)
      );
    }

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (content) updateData.content = content.trim();
    if (image) updateData.image = image;

    const post = await PostService.updatePost(postId, updateData);

    return res.status(200).json({
      postId: post._id,
      title: post.title,
      content: post.content,
      image: post.image,
      updatedAt: post.updatedAt,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error, statusCode, req.originalUrl));
  }
});

/**
 * DELETE /api/posts/:postId
 * Delete a post
 */
router.delete('/:postId', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await PostService.deletePost(postId);

    return res.status(200).json({
      message: 'Post deleted successfully',
      postId: post._id,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error, statusCode, req.originalUrl));
  }
});

/**
 * POST /api/posts/:postId/like
 * Like a post
 */
router.post('/:postId/like', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await PostService.likePost(postId);

    return res.status(200).json({
      postId: post._id,
      likes: post.likes,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error, statusCode, req.originalUrl));
  }
});

/**
 * POST /api/posts/:postId/unlike
 * Unlike a post
 */
router.post('/:postId/unlike', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await PostService.unlikePost(postId);

    return res.status(200).json({
      postId: post._id,
      likes: post.likes,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error, statusCode, req.originalUrl));
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
router.post('/:postId/comments', validateNonEmptyBodyMiddleware(), async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId, username, text } = req.body;

    // Validate required fields
    const errors: { [key: string]: string } = {};

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
      return res.status(400).json(
        formatValidationError(errors, 400, req.originalUrl)
      );
    }

    const post = await PostService.addComment(postId, {
      userId,
      username: username.trim(),
      text: text.trim(),
    });

    return res.status(201).json({
      postId: post._id,
      comments: post.comments,
      commentCount: post.comments.length,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error, statusCode, req.originalUrl));
  }
});

/**
 * DELETE /api/posts/:postId/comments/:commentIndex
 * Remove a comment from a post
 */
router.delete('/:postId/comments/:commentIndex', async (req: Request, res: Response) => {
  try {
    const { postId, commentIndex } = req.params;
    const index = parseInt(commentIndex);

    const post = await PostService.removeComment(postId, index);

    return res.status(200).json({
      postId: post._id,
      comments: post.comments,
      commentCount: post.comments.length,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') || error.message.includes('Invalid') ? 404 : 500;
    return res
      .status(statusCode)
      .json(formatError(error, statusCode, req.originalUrl));
  }
});

export default router;
