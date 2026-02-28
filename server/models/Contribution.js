const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name:       { type: String, required: true, trim: true },
  skill:      { type: String, default: null },
  message:    { type: String, required: true },
  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Contribution', contributionSchema);
