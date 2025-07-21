import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { authenticateToken, generateToken, setTokenCookie } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('fullName').isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
];

const validateLogin = [
  body('username').notEmpty(),
  body('password').notEmpty()
];

// Sign up
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const { username, fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create user
    const user = await User.create({ username, fullName, email, password });
    
    // Generate token and set cookie
    const token = generateToken(user.id);
    setTokenCookie(res, token);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        profileImage: user.profile_image,
        coverImage: user.cover_image,
        bio: user.bio,
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const { username, password } = req.body;

    // Find user
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token and set cookie
    const token = generateToken(user.id);
    setTokenCookie(res, token);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        profileImage: user.profile_image,
        coverImage: user.cover_image,
        bio: user.bio,
        isVerified: user.is_verified,
        followersCount: user.followers_count,
        followingCount: user.following_count
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      profileImage: user.profile_image,
      coverImage: user.cover_image,
      bio: user.bio,
      websiteUrl: user.website_url,
      isVerified: user.is_verified,
      followersCount: user.followers_count,
      followingCount: user.following_count
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.cookie('jwt', '', { maxAge: 0 });
  res.json({ message: 'Logged out successfully' });
});

export default router;