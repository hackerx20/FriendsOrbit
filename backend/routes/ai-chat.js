import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import { AIChat } from '../models/AIChat.js';
import { authenticateToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Rate limiting for AI chat
const aiChatLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { error: 'Too many AI chat requests, please try again later.' }
});

// Get user chat sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await AIChat.getUserSessions(req.user.id);
    res.json(sessions);
  } catch (error) {
    console.error('Get AI sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new chat session
router.post('/sessions', authenticateToken, [
  body('sessionName').optional().isLength({ max: 100 })
], async (req, res) => {
  try {
    const { sessionName } = req.body;
    const session = await AIChat.createSession(req.user.id, sessionName);
    res.status(201).json(session);
  } catch (error) {
    console.error('Create AI session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get session messages
router.get('/sessions/:sessionId/messages', authenticateToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const messages = await AIChat.getSessionMessages(sessionId, limit, offset);
    res.json(messages);
  } catch (error) {
    console.error('Get AI messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message to AI
router.post('/sessions/:sessionId/messages', authenticateToken, aiChatLimit, [
  body('content').notEmpty().isLength({ max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const sessionId = parseInt(req.params.sessionId);
    const { content } = req.body;

    // Save user message
    const userMessage = await AIChat.addMessage(sessionId, 'user', content);

    // Get conversation history for context
    const recentMessages = await AIChat.getSessionMessages(sessionId, 10);
    
    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are FriendsOrbit AI, a helpful and friendly AI assistant integrated into a social media platform. You can help users with various tasks, answer questions, provide advice, and engage in casual conversation. Be conversational, helpful, and maintain a positive tone. Keep responses concise but informative.`
      },
      ...recentMessages.slice(-9).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    // Save AI response
    const aiMessage = await AIChat.addMessage(sessionId, 'assistant', aiResponse);

    res.json({
      userMessage,
      aiMessage
    });
  } catch (error) {
    console.error('AI chat error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ error: 'AI service temporarily unavailable. Please try again later.' });
    }
    
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// Update session name
router.put('/sessions/:sessionId', authenticateToken, [
  body('sessionName').notEmpty().isLength({ max: 100 })
], async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const { sessionName } = req.body;

    const session = await AIChat.updateSessionName(sessionId, req.user.id, sessionName);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Update AI session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete session
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const session = await AIChat.deleteSession(sessionId, req.user.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete AI session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;