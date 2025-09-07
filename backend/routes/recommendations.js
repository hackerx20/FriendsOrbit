import express from 'express';
import { Recommendations } from '../models/Recommendations.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get personalized post recommendations
router.get('/posts', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const posts = await Recommendations.getPersonalizedPosts(req.user.id, limit);
    res.json(posts);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get trending posts
router.get('/trending', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const posts = await Recommendations.getTrendingPosts(limit);
    res.json(posts);
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get suggested users to follow
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const users = await Recommendations.getSuggestedUsers(req.user.id, limit);
    res.json(users);
  } catch (error) {
    console.error('Get suggested users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Log user interaction
router.post('/interaction', authenticateToken, async (req, res) => {
  try {
    const { targetType, targetId, interactionType } = req.body;
    await Recommendations.logInteraction(req.user.id, targetType, targetId, interactionType);
    res.json({ message: 'Interaction logged successfully' });
  } catch (error) {
    console.error('Log interaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;