const express = require('express');
const Project = require('../models/Project');
const Testimonial = require('../models/Testimonial');
const User = require('../models/User');
const { authMiddleware } = require('../auth');

const router = express.Router();

// Helper to format project for response (keeps same shape as SQLite version)
const fmt = (p, author, testimonials = []) => ({
  id: p._id,
  user_id: p.user_id,
  title: p.title,
  description: p.description,
  category: p.category,
  tags: p.tags,
  cover_image: p.cover_image,
  live_url: p.live_url,
  github_url: p.github_url,
  tech_stack: p.tech_stack,
  status: p.status,
  views: p.views,
  open_for_collaboration: p.open_for_collaboration || false,
  created_at: p.created_at,
  updated_at: p.updated_at,
  author_name: author?.name || null,
  author_bio: author?.bio || null,
  author_github: author?.github_url || null,
  author_website: author?.website_url || null,
  testimonials,
});

// GET /api/projects — public list with search & filter
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 30, offset = 0 } = req.query;
    const filter = { status: 'published' };
    if (req.query.open_for_collaboration) filter.open_for_collaboration = req.query.open_for_collaboration === 'true';
    if (category && category !== 'All') filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];

    const [projects, total] = await Promise.all([
      Project.find(filter).sort({ created_at: -1 }).skip(Number(offset)).limit(Number(limit)),
      Project.countDocuments(filter),
    ]);

    const userIds = [...new Set(projects.map(p => p.user_id.toString()))];
    const users = await User.find({ _id: { $in: userIds } });
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    res.json({ projects: projects.map(p => fmt(p, userMap[p.user_id.toString()])), total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/mine — authenticated user's projects
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(projects.map(p => fmt(p)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id — single project with testimonials
router.get('/:id', async (req, res) => {
  try {
    const p = await Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!p) return res.status(404).json({ error: 'Project not found' });

    const [author, testimonials] = await Promise.all([
      User.findById(p.user_id),
      Testimonial.find({ project_id: p._id }).sort({ created_at: -1 }),
    ]);

    const tFmt = testimonials.map(t => ({ id: t._id, author: t.author, role: t.role, content: t.content, rating: t.rating, created_at: t.created_at }));
    res.json(fmt(p, author, tFmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects — create
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, tags, cover_image, live_url, github_url, tech_stack, status, open_for_collaboration } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const p = await Project.create({ user_id: req.user.id, title, description, category: category, open_for_collaboration: open_for_collaboration || false });
    res.status(201).json(fmt(p));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id — update
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const p = await Project.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!p) return res.status(404).json({ error: 'Project not found or unauthorized' });

    const { title, description, category, tags, cover_image, live_url, github_url, tech_stack, status, open_for_collaboration } = req.body;
    const updated = await Project.findByIdAndUpdate(req.params.id, {
      title: title || p.title,
      description: description ?? p.description,
      category: category || p.category,
      tags: tags ?? p.tags,
      cover_image: cover_image || p.cover_image,
      live_url: live_url ?? p.live_url,
      github_url: github_url ?? p.github_url,
      tech_stack: tech_stack ?? p.tech_stack,
      status: status || p.status,
      open_for_collaboration: open_for_collaboration ?? p.open_for_collaboration,
    }, { new: true });

    res.json(fmt(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const p = await Project.findOne({ _id: req.params.id, user_id: req.user.id });
    if (!p) return res.status(404).json({ error: 'Project not found or unauthorized' });

    await Promise.all([
      Project.findByIdAndDelete(req.params.id),
      Testimonial.deleteMany({ project_id: req.params.id }),
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/testimonials
router.post('/:id/testimonials', async (req, res) => {
  try {
    const { author, role, content, rating } = req.body;
    if (!author || !content) return res.status(400).json({ error: 'Author and content are required' });

    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });

    const t = await Testimonial.create({ project_id: p._id, author, role, content, rating: Number(rating) || 5 });
    res.status(201).json({ id: t._id, author: t.author, role: t.role, content: t.content, rating: t.rating, created_at: t.created_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

