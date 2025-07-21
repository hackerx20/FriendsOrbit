import express from 'express';
import { body, validationResult } from 'express-validator';
import { Post } from '../models/Post.js';
import { authenticateToken } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Create post
router.post('/create', authenticateToken, [
  body('content').optional().isLength({ max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const { content, image } = req.body;
    
    if (!content && !image) {
      return res.status(400).json({ error: 'Post must have content or image' });
    }

    let imageUrl = null;
    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image);
      imageUrl = uploadResult.secure_url;
    }

    const post = await Post.create({
      userId: req.user.id,
      content,
      imageUrl
    });

    const fullPost = await Post.findById(post.id);
    res.status(201).json(fullPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all posts
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await Post.getAllPosts(limit, offset);
    
    // Add user interaction data
    const postsWithInteractions = await Promise.all(posts.map(async (post) => {
      const comments = await Post.getComments(post.id);
      return {
        ...post,
        comments,
        isLiked: false // TODO: Check if current user liked this post
      };
    }));

    res.json(postsWithInteractions);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get following posts
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await Post.getFollowingPosts(req.user.id, limit, offset);
    
    const postsWithInteractions = await Promise.all(posts.map(async (post) => {
      const comments = await Post.getComments(post.id);
      return {
        ...post,
        comments,
        isLiked: false
      };
    }));

    res.json(postsWithInteractions);
  } catch (error) {
    console.error('Get following posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user posts
router.get('/user/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // First get user ID from username
    const { User } = await import('../models/User.js');
    const user = await User.findByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = await Post.getUserPosts(user.id, limit, offset);
    
    const postsWithInteractions = await Promise.all(posts.map(async (post) => {
      const comments = await Post.getComments(post.id);
      return {
        ...post,
        comments,
        isLiked: false
      };
    }));

    res.json(postsWithInteractions);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/unlike post
router.post('/like/:id', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const result = await Post.toggleLike(postId, req.user.id);
    
    res.json(result);
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment
router.post('/comment/:id', authenticateToken, [
  body('content').notEmpty().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const postId = parseInt(req.params.id);
    const { content } = req.body;

    const comment = await Post.addComment(postId, req.user.id, content);
    res.json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const deletedPost = await Post.delete(postId, req.user.id);
    
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found or unauthorized' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;