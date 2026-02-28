const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, required: true },
  avatar:      { type: String, default: null },
  bio:         { type: String, default: null },
  github_url:  { type: String, default: null },
  website_url: { type: String, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', userSchema);
