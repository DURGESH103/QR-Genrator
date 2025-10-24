const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  qrCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QrCode',
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  device: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop'],
    required: true
  },
  browser: {
    type: String,
    required: true
  },
  os: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Scan', scanSchema);