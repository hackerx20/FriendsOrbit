import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { v2 as cloudinary } from 'cloudinary';
import pool from '../database/connection.js';

const router = express.Router();

// Get user profile
router.get('/profile/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findByUsername(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user follows this user
    const followQuery = `
      SELECT id FROM followers 
      WHERE follower_id = $1 AND following_id = $2
    `;
    const followResult = await pool.query(followQuery, [req.user.id, user.id]);
    const isFollowing = followResult.rows.length > 0;

    res.json({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      bio: user.bio,
      profileImage: user.profile_image,
      coverImage: user.cover_image,
      websiteUrl: user.website_url,
      isVerified: user.is_verified,
      followersCount: user.followers_count,
      followingCount: user.following_count,
      isFollowing,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('fullName').optional().isLength({ min: 2, max: 100 }),
  body('bio').optional().isLength({ max: 500 }),
  body('websiteUrl').optional().isURL(),
  body('currentPassword').optional().isLength({ min: 8 }),
  body('newPassword').optional().isLength({ min: 8 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const { fullName, bio, websiteUrl, profileImage, coverImage, currentPassword, newPassword } = req.body;
    const updates = {};

    // Handle text updates
    if (fullName) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (websiteUrl !== undefined) updates.websiteUrl = websiteUrl;

    // Handle image uploads
    if (profileImage) {
      const uploadResult = await cloudinary.uploader.upload(profileImage);
      updates.profileImage = uploadResult.secure_url;
    }

    if (coverImage) {
      const uploadResult = await cloudinary.uploader.upload(coverImage);
      updates.coverImage = uploadResult.secure_url;
    }

    // Handle password update
    if (currentPassword && newPassword) {
      const user = await User.findById(req.user.id);
      const isValidPassword = await User.validatePassword(currentPassword, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const bcrypt = await import('bcryptjs');
      updates.password_hash = await bcrypt.hash(newPassword, 12);
    }

    const updatedUser = await User.updateProfile(req.user.id, updates);
    
    if (!updatedUser) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      fullName: updatedUser.full_name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profileImage: updatedUser.profile_image,
      coverImage: updatedUser.cover_image,
      websiteUrl: updatedUser.website_url,
      isVerified: updatedUser.is_verified
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Follow/unfollow user
router.post('/follow/:id', authenticateToken, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if already following
      const existingFollow = await client.query(
        'SELECT id FROM followers WHERE follower_id = $1 AND following_id = $2',
        [currentUserId, targetUserId]
      );

      if (existingFollow.rows.length > 0) {
        // Unfollow
        await client.query(
          'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
          [currentUserId, targetUserId]
        );
        
        await client.query('COMMIT');
        res.json({ message: 'User unfollowed successfully', following: false });
      } else {
        // Follow
        await client.query(
          'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
          [currentUserId, targetUserId]
        );

        // Create notification
        await client.query(
          `INSERT INTO notifications (user_id, from_user_id, type, content)
           VALUES ($1, $2, 'follow', 'started following you')`,
          [targetUserId, currentUserId]
        );
        
        await client.query('COMMIT');
        res.json({ message: 'User followed successfully', following: true });
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get suggested users
router.get('/suggested', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const suggestedUsers = await User.getSuggestedUsers(req.user.id, limit);
    res.json(suggestedUsers);
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const query = `
      SELECT id, username, full_name, profile_image, is_verified
      FROM users
      WHERE (username ILIKE $1 OR full_name ILIKE $1) AND is_active = true
      ORDER BY 
        CASE WHEN username ILIKE $2 THEN 1 ELSE 2 END,
        full_name
      LIMIT 20
    `;
    
    const searchTerm = `%${q}%`;
    const exactTerm = `${q}%`;
    
    const result = await pool.query(query, [searchTerm, exactTerm]);
    res.json(result.rows);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;