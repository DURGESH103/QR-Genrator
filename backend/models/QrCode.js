const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['url', 'text', 'wifi', 'vcard', 'file'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  qrImage: {
    type: String,
    required: true
  },
  customization: {
    foregroundColor: { type: String, default: '#000000' },
    backgroundColor: { type: String, default: '#ffffff' },
    logo: { type: String, default: '' },
    size: { type: Number, default: 200 },
    margin: { type: Number, default: 4 }
  },
  isDynamic: {
    type: Boolean,
    default: false
  },
  shortUrl: {
    type: String,
    unique: true,
    sparse: true
  },
  scanCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QrCode', qrCodeSchema);