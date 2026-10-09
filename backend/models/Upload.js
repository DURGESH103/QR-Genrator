const mongoose = require('mongoose');

// Uploaded images are stored in MongoDB so they survive redeploys on
// hosts with ephemeral (Render) or read-only (Vercel) filesystems.
const uploadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    default: ''
  },
  contentType: {
    type: String,
    enum: ['image/jpeg', 'image/png', 'image/webp'],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  data: {
    type: Buffer,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Upload', uploadSchema);
