const express = require('express');
const Contribution = require('../models/Contribution');
const Project = require('../models/Project');
const { authMiddleware } = require('../auth');
const router = express.Router();

router.post('/:id/contributions', async (req, res) => {
  try {
    const { name, skill, message } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'Name and message required' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const c = await Contribution.create({ project_id: project._id, name, skill: skill||null, message });
    res.status(201).json({ id: c._id, project_id: c.project_id, name: c.name, skill: c.skill, message: c.message, status: c.status, created_at: c.created_at });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/contributions', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.user_id.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    const list = await Contribution.find({ project_id: req.params.id }).sort({ created_at: -1 });
    res.json(list.map(c => ({ id: c._id, project_id: c.project_id, name: c.name, skill: c.skill, message: c.message, status: c.status, created_at: c.created_at })));
  } catch(err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/contributions/:cid', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved','rejected'].includes(status)) return res.status(400).json({ error: 'Status must be approved or rejected' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.user_id.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    await Contribution.findByIdAndUpdate(req.params.cid, { status });
    res.json({ success: true, status });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
