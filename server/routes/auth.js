const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { signToken, authMiddleware } = require('../auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = signToken({ id: user._id, email: user.email, name: user.name });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, created_at: user.created_at } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken({ id: user._id, email: user.email, name: user.name });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, created_at: user.created_at } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ...user.toObject(), id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, bio, github_url, website_url } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, bio, github_url, website_url }, { new: true }).select('-password');
    res.json({ ...user.toObject(), id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
