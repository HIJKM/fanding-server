import { Post } from '../models/post';

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

class PostService {
  /**
   * Create a new post
   */
  static async createPost(input: CreatePostInput) {
    try {
      const post = new Post({
        musicianId: input.musicianId,
        title: input.title,
        content: input.content,
        image: input.image,
        likes: 0,
        comments: [],
      });

      await post.save();
      return post;
    } catch (error: any) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  /**
   * Get post by ID
   */
  static async getPostById(postId: string) {
    try {
      const post = await Post.findById(postId).populate('musicianId', 'musicianName profileImage');
      if (!post) {
        throw new Error('Post not found');
      }
      return post;
    } catch (error: any) {
      throw new Error(`Failed to get post: ${error.message}`);
    }
  }

  /**
   * Get all posts for a musician
   */
  static async getPostsByMusicianId(musicianId: string, skip: number = 0, limit: number = 20) {
    try {
      const posts = await Post.find({ musicianId })
        .populate('musicianId', 'musicianName profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({ musicianId });

      return {
        posts,
        pagination: {
          skip,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get posts: ${error.message}`);
    }
  }

  /**
   * Update post
   */
  static async updatePost(postId: string, input: Partial<CreatePostInput>) {
    try {
      const post = await Post.findByIdAndUpdate(
        postId,
        { ...input, updatedAt: new Date() },
        { new: true }
      );

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    } catch (error: any) {
      throw new Error(`Failed to update post: ${error.message}`);
    }
  }

  /**
   * Delete post
   */
  static async deletePost(postId: string) {
    try {
      const post = await Post.findByIdAndDelete(postId);

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    } catch (error: any) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }

  /**
   * Like a post
   */
  static async likePost(postId: string) {
    try {
      const post = await Post.findByIdAndUpdate(
        postId,
        { $inc: { likes: 1 } },
        { new: true }
      );

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    } catch (error: any) {
      throw new Error(`Failed to like post: ${error.message}`);
    }
  }

  /**
   * Unlike a post
   */
  static async unlikePost(postId: string) {
    try {
      const post = await Post.findByIdAndUpdate(
        postId,
        { $inc: { likes: -1 } },
        { new: true }
      );

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    } catch (error: any) {
      throw new Error(`Failed to unlike post: ${error.message}`);
    }
  }

  /**
   * Add comment to post
   */
  static async addComment(postId: string, input: AddCommentInput) {
    try {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $push: {
            comments: {
              userId: input.userId,
              username: input.username,
              text: input.text,
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      );

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    } catch (error: any) {
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  /**
   * Remove comment from post
   */
  static async removeComment(postId: string, commentIndex: number) {
    try {
      const post = await Post.findById(postId);

      if (!post) {
        throw new Error('Post not found');
      }

      if (commentIndex < 0 || commentIndex >= post.comments.length) {
        throw new Error('Invalid comment index');
      }

      post.comments.splice(commentIndex, 1);
      await post.save();

      return post;
    } catch (error: any) {
      throw new Error(`Failed to remove comment: ${error.message}`);
    }
  }

  /**
   * Get all posts (for feed)
   */
  static async getAllPosts(skip: number = 0, limit: number = 20) {
    try {
      const posts = await Post.find()
        .populate('musicianId', 'musicianName profileImage genre')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments();

      return {
        posts,
        pagination: {
          skip,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get posts: ${error.message}`);
    }
  }
}

export { PostService, CreatePostInput, AddCommentInput };
