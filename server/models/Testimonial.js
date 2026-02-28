const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  author:     { type: String, required: true, trim: true },
  role:       { type: String, default: null },
  content:    { type: String, required: true },
  rating:     { type: Number, default: 5, min: 1, max: 5 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Testimonial', testimonialSchema);
