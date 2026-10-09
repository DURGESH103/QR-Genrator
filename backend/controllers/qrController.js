const QRCode = require('qrcode');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const QrCodeModel = require('../models/QrCode');
const Upload = require('../models/Upload');
const User = require('../models/User');
const Scan = require('../models/Scan');
const geoip = require('geoip-lite');

// QR types whose code points at a hosted viewer page (/view/:id) instead of raw data
const VIEWER_TYPES = ['emoji', 'image'];
// Same length as a real ObjectId so previews have the same density as the saved code
const PLACEHOLDER_ID = '000000000000000000000000';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const EMOJI_PATTERN = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;
const LOGO_DATA_URL = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;
const PNG_DATA_URL = /^data:image\/png;base64,[A-Za-z0-9+/]+=*$/;
const MAX_LOGO_LENGTH = 400 * 1024;
const MAX_QR_IMAGE_LENGTH = 3 * 1024 * 1024;

// Identify image type from magic bytes rather than trusting the client mimetype
const detectImageType = (buffer) => {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
};

const getViewerBaseUrl = (req) => {
  const base = (process.env.FRONTEND_URL || req.get('origin') || '').split(',')[0].trim().replace(/\/+$/, '');
  return /^https?:\/\/\S+$/i.test(base) ? base : '';
};

const buildViewerUrl = (req, id) => {
  const base = getViewerBaseUrl(req);
  return base ? `${base}/view/${id}` : '';
};

// Build QR payload string from type + content
const buildQRContent = (type, content, viewerUrl = '') => {
  if (typeof content === 'string' && !VIEWER_TYPES.includes(type)) return content;
  const c = content && typeof content === 'object' ? content : {};
  let value;
  switch (type) {
    case 'url':
      value = c.url;
      break;
    case 'text':
      value = c.text;
      break;
    case 'wifi':
      value = `WIFI:T:${c.security || 'WPA'};S:${c.ssid};P:${c.password};H:${c.hidden || false};;`;
      break;
    case 'vcard':
      value = `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nORG:${c.organization || ''}\nTEL:${c.phone || ''}\nEMAIL:${c.email || ''}\nURL:${c.website || ''}\nEND:VCARD`;
      break;
    case 'file':
      value = c.url || c.file;
      break;
    case 'email':
      value = `mailto:${c.email}?subject=${encodeURIComponent(c.subject || '')}&body=${encodeURIComponent(c.body || '')}`;
      break;
    case 'phone':
      value = `tel:${c.phone}`;
      break;
    case 'sms':
      value = `sms:${c.phone}${c.message ? `?body=${encodeURIComponent(c.message)}` : ''}`;
      break;
    case 'whatsapp':
      value = `https://wa.me/${String(c.phone || '').replace(/\D/g, '')}${c.message ? `?text=${encodeURIComponent(c.message)}` : ''}`;
      break;
    case 'location':
      value = `geo:${c.latitude},${c.longitude}${c.query ? `?q=${encodeURIComponent(c.query)}` : ''}`;
      break;
    case 'social':
      value = c.url || c.profileUrl;
      break;
    case 'event':
      value = `BEGIN:VEVENT\nSUMMARY:${c.title || ''}\nDTSTART:${(c.startDate || '').replace(/[-:]/g, '')}\nDTEND:${(c.endDate || '').replace(/[-:]/g, '')}\nLOCATION:${c.location || ''}\nDESCRIPTION:${c.description || ''}\nEND:VEVENT`;
      break;
    case 'emoji':
    case 'image':
      value = viewerUrl;
      break;
    case 'logo':
      value = c.url || c.text;
      break;
    default:
      value = JSON.stringify(content);
  }
  return typeof value === 'string' ? value : '';
};

// Validate and sanitize type-specific content. Returns { content } or { error }.
const normalizeContent = async (type, content, userId) => {
  const c = content && typeof content === 'object' ? content : {};

  if (type === 'emoji') {
    const emojis = Array.isArray(c.emojis) ? c.emojis.map(e => String(e).trim()).filter(Boolean) : [];
    if (emojis.length < 1 || emojis.length > 20) return { error: 'Select between 1 and 20 emojis' };
    if (emojis.some(e => e.length > 16 || !EMOJI_PATTERN.test(e))) return { error: 'Invalid emoji selection' };
    const title = String(c.title || '').trim();
    const message = String(c.message || '').trim();
    if (title.length > 100) return { error: 'Emoji title must be 100 characters or less' };
    if (message.length > 500) return { error: 'Emoji message must be 500 characters or less' };
    const style = c.style && typeof c.style === 'object' ? c.style : {};
    return {
      content: {
        emojis,
        title,
        message,
        style: {
          background: HEX_COLOR.test(style.background) ? style.background : '#ffffff',
          size: ['sm', 'md', 'lg'].includes(style.size) ? style.size : 'md'
        }
      }
    };
  }

  if (type === 'image') {
    const imageId = String(c.imageId || '');
    if (!mongoose.Types.ObjectId.isValid(imageId)) return { error: 'Upload an image first' };
    const exists = await Upload.exists({ _id: imageId, user: userId });
    if (!exists) return { error: 'Uploaded image not found' };
    const caption = String(c.caption || '').trim();
    if (caption.length > 200) return { error: 'Caption must be 200 characters or less' };
    return { content: { imageId, caption } };
  }

  return { content };
};

// Whitelist customization fields. Returns { value } or { error }.
const sanitizeCustomization = (customization) => {
  const c = customization && typeof customization === 'object' ? customization : {};
  const value = {
    foregroundColor: HEX_COLOR.test(c.foregroundColor) ? c.foregroundColor : '#000000',
    backgroundColor: HEX_COLOR.test(c.backgroundColor) ? c.backgroundColor : '#ffffff',
    size: Math.min(Math.max(parseInt(c.size, 10) || 200, 100), 1000),
    margin: Math.min(Math.max(Number.isInteger(c.margin) ? c.margin : 4, 0), 10),
    errorCorrectionLevel: ['L', 'M', 'Q', 'H'].includes(c.errorCorrectionLevel) ? c.errorCorrectionLevel : 'H',
    logo: '',
    logoSize: Math.min(Math.max(Number(c.logoSize) || 0.22, 0.1), 0.25),
    logoBackground: c.logoBackground !== false
  };
  if (c.logo) {
    if (typeof c.logo !== 'string' || !LOGO_DATA_URL.test(c.logo)) return { error: 'Logo must be a PNG, JPG or WebP image' };
    if (c.logo.length > MAX_LOGO_LENGTH) return { error: 'Logo image is too large' };
    value.logo = c.logo;
    // A centered logo hides modules; highest error correction keeps the code scannable
    value.errorCorrectionLevel = 'H';
  }
  return { value };
};

const toQrOptions = (custom) => ({
  color: { dark: custom.foregroundColor, light: custom.backgroundColor },
  width: custom.size,
  margin: custom.margin,
  errorCorrectionLevel: custom.errorCorrectionLevel
});

// Delete an uploaded image once no QR code references it
const removeUnusedUpload = async (imageId, userId, excludeQrId) => {
  if (!imageId || !mongoose.Types.ObjectId.isValid(imageId)) return;
  const inUse = await QrCodeModel.exists({ 'content.imageId': String(imageId), _id: { $ne: excludeQrId } });
  if (!inUse) await Upload.deleteOne({ _id: imageId, user: userId });
};

const generateQR = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, type, content, customization, isDynamic } = req.body;
    const userId = req.user.id;

    const custom = sanitizeCustomization(customization);
    if (custom.error) return res.status(400).json({ message: custom.error });

    const normalized = await normalizeContent(type, content, userId);
    if (normalized.error) return res.status(400).json({ message: normalized.error });

    // Pre-allocate the id so viewer-type QR codes can encode their own share URL
    const _id = new mongoose.Types.ObjectId();
    let viewerUrl = '';
    if (VIEWER_TYPES.includes(type)) {
      viewerUrl = buildViewerUrl(req, _id);
      if (!viewerUrl) {
        return res.status(500).json({ message: 'FRONTEND_URL is not configured on the server' });
      }
    }

    const qrContent = buildQRContent(type, normalized.content, viewerUrl);
    if (!qrContent) {
      return res.status(400).json({ message: 'Could not build QR content from provided data' });
    }

    const qrImage = await QRCode.toDataURL(qrContent, toQrOptions(custom.value));

    const qrCode = await QrCodeModel.create({
      _id,
      user: userId,
      title,
      type,
      content: normalized.content,
      qrImage,
      customization: custom.value,
      isDynamic: isDynamic || false
    });

    await User.findByIdAndUpdate(userId, { $inc: { qrCodesGenerated: 1 } });

    res.status(201).json({
      success: true,
      qrCode: await qrCode.populate('user', 'name email'),
      viewerUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserQRCodes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = { user: req.user.id };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (typeof req.query.type === 'string' && req.query.type) {
      query.type = req.query.type;
    }

    const qrCodes = await QrCodeModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await QrCodeModel.countDocuments(query);

    res.json({
      success: true,
      qrCodes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getQRCode = async (req, res) => {
  try {
    const qrCode = await QrCodeModel.findById(req.params.id).populate('user', 'name email');
    if (!qrCode) return res.status(404).json({ message: 'QR Code not found' });
    if (qrCode.user._id.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
    res.json({ success: true, qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateQRCode = async (req, res) => {
  try {
    const { title, content, customization, qrImage } = req.body;
    const qrCode = await QrCodeModel.findById(req.params.id);
    if (!qrCode) return res.status(404).json({ message: 'QR Code not found' });
    if (qrCode.user.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    const contentChanged = content && JSON.stringify(content) !== JSON.stringify(qrCode.content);
    const previousImageId = qrCode.type === 'image' ? qrCode.content?.imageId : null;

    if (customization) {
      const custom = sanitizeCustomization({ ...qrCode.customization.toObject(), ...customization });
      if (custom.error) return res.status(400).json({ message: custom.error });
      qrCode.set('customization', custom.value);
    }

    if (contentChanged) {
      const normalized = await normalizeContent(qrCode.type, content, req.user.id);
      if (normalized.error) return res.status(400).json({ message: normalized.error });
      qrCode.content = normalized.content;
    }

    if (contentChanged || customization) {
      const viewerUrl = VIEWER_TYPES.includes(qrCode.type) ? buildViewerUrl(req, qrCode._id) : '';
      const qrContent = buildQRContent(qrCode.type, qrCode.content, viewerUrl);
      if (!qrContent) return res.status(400).json({ message: 'Could not build QR content from provided data' });
      qrCode.qrImage = await QRCode.toDataURL(qrContent, toQrOptions(qrCode.customization));
    }

    // Client-side composited version (QR + centered logo) of the stored code
    if (qrImage) {
      if (!qrCode.customization.logo) return res.status(400).json({ message: 'QR code has no logo' });
      if (typeof qrImage !== 'string' || !PNG_DATA_URL.test(qrImage) || qrImage.length > MAX_QR_IMAGE_LENGTH) {
        return res.status(400).json({ message: 'Invalid QR image' });
      }
      qrCode.qrImage = qrImage;
    }

    if (title) qrCode.title = title;
    await qrCode.save();

    if (previousImageId && previousImageId !== qrCode.content?.imageId) {
      await removeUnusedUpload(previousImageId, req.user.id, qrCode._id);
    }

    res.json({ success: true, qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QrCodeModel.findById(req.params.id);
    if (!qrCode) return res.status(404).json({ message: 'QR Code not found' });
    if (qrCode.user.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    await QrCodeModel.findByIdAndDelete(req.params.id);
    await Scan.deleteMany({ qrCode: req.params.id });
    if (qrCode.type === 'image') {
      await removeUnusedUpload(qrCode.content?.imageId, req.user.id, qrCode._id);
    }

    res.json({ success: true, message: 'QR Code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const previewQR = async (req, res) => {
  try {
    const { type, content, customization } = req.body;

    const custom = sanitizeCustomization(customization);
    if (custom.error) return res.status(400).json({ message: custom.error });

    let viewerUrl = '';
    if (VIEWER_TYPES.includes(type)) {
      viewerUrl = buildViewerUrl(req, PLACEHOLDER_ID);
      if (!viewerUrl) return res.status(500).json({ message: 'FRONTEND_URL is not configured on the server' });
    }

    const qrContent = buildQRContent(type, content, viewerUrl);
    if (!qrContent) return res.status(400).json({ message: 'Insufficient content to generate QR' });

    const qrImage = await QRCode.toDataURL(qrContent, toQrOptions(custom.value));
    res.json({ success: true, qrImage, isPlaceholder: VIEWER_TYPES.includes(type) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const trackScan = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'QR Code not found' });
    const qrCode = await QrCodeModel.findById(req.params.id);
    if (!qrCode) return res.status(404).json({ message: 'QR Code not found' });

    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const geo = geoip.lookup(ip);

    let device = 'desktop';
    if (/mobile/i.test(userAgent)) device = 'mobile';
    else if (/tablet/i.test(userAgent)) device = 'tablet';

    const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/i)?.[0] || 'Unknown';
    const os = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/i)?.[0] || 'Unknown';

    await Scan.create({
      qrCode: qrCode._id,
      ipAddress: ip,
      userAgent,
      location: geo ? { country: geo.country, region: geo.region, city: geo.city, timezone: geo.timezone } : {},
      device,
      browser,
      os
    });

    await QrCodeModel.findByIdAndUpdate(req.params.id, { $inc: { scanCount: 1 } });
    res.json({ success: true, message: 'Scan tracked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Store an uploaded image in MongoDB; respond only after the write succeeds
const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    const contentType = detectImageType(req.file.buffer);
    if (!contentType) {
      return res.status(400).json({ message: 'File is not a valid JPG, PNG or WebP image' });
    }

    const upload = await Upload.create({
      user: req.user.id,
      originalName: (req.file.originalname || '').slice(0, 200),
      contentType,
      size: req.file.size,
      data: req.file.buffer
    });

    res.status(201).json({
      success: true,
      imageId: upload._id,
      contentType,
      size: upload.size
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Public: content needed to render the viewer page of an emoji/image QR code
const getPublicQR = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'QR Code not found' });
    const qrCode = await QrCodeModel.findOne({ _id: req.params.id, isActive: true, type: { $in: VIEWER_TYPES } });
    if (!qrCode) return res.status(404).json({ message: 'QR Code not found' });

    const content = qrCode.type === 'image'
      ? { caption: qrCode.content?.caption || '', imageUrl: `/api/public/images/${qrCode.content?.imageId}` }
      : {
          emojis: qrCode.content?.emojis || [],
          title: qrCode.content?.title || '',
          message: qrCode.content?.message || '',
          style: qrCode.content?.style || {}
        };

    res.json({ success: true, qrCode: { id: qrCode._id, type: qrCode.type, title: qrCode.title, content, createdAt: qrCode.createdAt } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Public: raw image bytes, only for images attached to an active image QR code
const getPublicImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ message: 'Image not found' });
    const linked = await QrCodeModel.exists({ type: 'image', 'content.imageId': id, isActive: true });
    if (!linked) return res.status(404).json({ message: 'Image not found' });
    const upload = await Upload.findById(id).select('data contentType');
    if (!upload) return res.status(404).json({ message: 'Image not found' });

    res.set({
      'Content-Type': upload.contentType,
      'Cache-Control': 'public, max-age=86400',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    res.send(upload.data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  generateQR,
  getUserQRCodes,
  getQRCode,
  updateQRCode,
  deleteQRCode,
  previewQR,
  trackScan,
  uploadImage,
  getPublicQR,
  getPublicImage,
  // exported for tests
  buildQRContent,
  normalizeContent,
  sanitizeCustomization,
  detectImageType
};
