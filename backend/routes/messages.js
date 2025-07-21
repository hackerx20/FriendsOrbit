import express from 'express';
import { body, validationResult } from 'express-validator';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Message.getUserConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation messages
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const messages = await Message.getConversation(req.user.id, otherUserId, limit, offset);
    
    // Mark messages as read
    await Message.markAsRead(otherUserId, req.user.id);
    
    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/send', authenticateToken, [
  body('receiverId').isInt(),
  body('content').notEmpty().isLength({ max: 2000 }),
  body('messageType').optional().isIn(['text', 'image', 'file'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const { receiverId, content, messageType = 'text' } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      content,
      messageType
    });

    // Emit socket event for real-time messaging
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${receiverId}`).emit('new_message', {
        ...message,
        sender: {
          id: req.user.id,
          username: req.user.username,
          full_name: req.user.full_name,
          profile_image: req.user.profile_image
        }
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark messages as read
router.put('/read/:userId', authenticateToken, async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);
    await Message.markAsRead(otherUserId, req.user.id);
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;