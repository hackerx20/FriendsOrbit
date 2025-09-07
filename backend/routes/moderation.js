import express from 'express';
import { ContentModeration } from '../models/ContentModeration.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Moderate content
router.post('/moderate', authenticateToken, async (req, res) => {
  try {
    const { postId, content } = req.body;
    const result = await ContentModeration.moderatePost(postId, content);
    res.json(result);
  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get moderation history (admin only)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    // In a real app, you'd check if user is admin
    const limit = parseInt(req.query.limit) || 50;
    const history = await ContentModeration.getModerationHistory(limit);
    res.json(history);
  } catch (error) {
    console.error('Get moderation history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;