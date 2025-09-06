import express from 'express';
import { body, validationResult } from 'express-validator';
import { AIChat } from '../models/AIChat.js';
import { authenticateToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Mock AI response function (replace with actual AI service)
const generateAIResponse = async (prompt) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple mock responses based on keywords
  const responses = {
    'react': 'React is a powerful JavaScript library for building user interfaces. Here are some best practices:\n\n1. Use functional components with hooks\n2. Implement proper state management\n3. Optimize with React.memo and useMemo\n4. Follow component composition patterns\n\nWhat specific React topic would you like to explore?',
    'javascript': 'JavaScript is a versatile programming language. Here are some key concepts:\n\n1. Understand closures and scope\n2. Master async/await and promises\n3. Learn ES6+ features\n4. Practice functional programming\n\nWhat JavaScript concept would you like to learn more about?',
    'design': 'Great design principles include:\n\n1. Keep it simple and intuitive\n2. Maintain consistency\n3. Use proper hierarchy\n4. Consider accessibility\n5. Test with real users\n\nWhat design challenge are you working on?',
    'default': 'I\'m here to help! I can assist with:\n\n• Programming and development\n• Design and UX\n• Technology questions\n• General advice\n\nWhat would you like to know more about?'
  };
  
  const lowerPrompt = prompt.toLowerCase();
  for (const [keyword, response] of Object.entries(responses)) {
    if (lowerPrompt.includes(keyword)) {
      return response;
    }
  }
  
  return responses.default;
};

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
    
    // Generate AI response using mock function
    const aiResponse = await generateAIResponse(content);

    // Save AI response
    const aiMessage = await AIChat.addMessage(sessionId, 'assistant', aiResponse);

    res.json({
      userMessage,
      aiMessage
    });
  } catch (error) {
    console.error('AI chat error:', error);
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