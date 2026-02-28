const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  user_id:                { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:                  { type: String, required: true, trim: true },
  description:            { type: String, default: null },
  category:               { type: String, default: "Web" },
  tags:                   { type: String, default: null },
  cover_image:            { type: String, default: null },
  live_url:               { type: String, default: null },
  github_url:             { type: String, default: null },
  tech_stack:             { type: String, default: null },
  status:                 { type: String, enum: ["published", "draft"], default: "published" },
  views:                  { type: Number, default: 0 },
  open_for_collaboration: { type: Boolean, default: false },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

// Text index for search
projectSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Project", projectSchema);

