const QRCode = require('qrcode');
const { validationResult } = require('express-validator');
const QrCodeModel = require('../models/QrCode');
const User = require('../models/User');
const Scan = require('../models/Scan');
const geoip = require('geoip-lite');

const generateQR = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, type, content, customization, isDynamic } = req.body;
    const userId = req.user.id;

    // Generate QR code image
    const qrOptions = {
      color: {
        dark: customization?.foregroundColor || '#000000',
        light: customization?.backgroundColor || '#ffffff'
      },
      width: customization?.size || 200,
      margin: customization?.margin || 4
    };

    let qrContent;
    if (type === 'url') {
      qrContent = content.url || content;
    } else if (type === 'text') {
      qrContent = content.text || content;
    } else if (type === 'wifi') {
      qrContent = `WIFI:T:${content.security || 'WPA'};S:${content.ssid};P:${content.password};H:${content.hidden || false};;`;
    } else if (type === 'vcard') {
      qrContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${content.name}\nORG:${content.organization || ''}\nTEL:${content.phone || ''}\nEMAIL:${content.email || ''}\nURL:${content.website || ''}\nEND:VCARD`;
    } else {
      qrContent = typeof content === 'string' ? content : JSON.stringify(content);
    }

    const qrImage = await QRCode.toDataURL(qrContent, qrOptions);

    // Save to database
    const qrCode = await QrCodeModel.create({
      user: userId,
      title,
      type,
      content,
      qrImage,
      customization: customization || {},
      isDynamic: isDynamic || false
    });

    // Update user's QR count
    await User.findByIdAndUpdate(userId, { $inc: { qrCodesGenerated: 1 } });

    res.status(201).json({
      success: true,
      qrCode: await qrCode.populate('user', 'name email')
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
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    if (qrCode.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateQRCode = async (req, res) => {
  try {
    const { title, content, customization } = req.body;
    
    const qrCode = await QrCodeModel.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    if (qrCode.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Regenerate QR if content changed
    if (content && JSON.stringify(content) !== JSON.stringify(qrCode.content)) {
      const qrOptions = {
        color: {
          dark: customization?.foregroundColor || qrCode.customization.foregroundColor,
          light: customization?.backgroundColor || qrCode.customization.backgroundColor
        },
        width: customization?.size || qrCode.customization.size,
        margin: customization?.margin || qrCode.customization.margin
      };

      qrCode.qrImage = await QRCode.toDataURL(content, qrOptions);
      qrCode.content = content;
    }

    if (title) qrCode.title = title;
    if (customization) qrCode.customization = { ...qrCode.customization, ...customization };

    await qrCode.save();

    res.json({ success: true, qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteQRCode = async (req, res) => {
  try {
    const qrCode = await QrCodeModel.findById(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    if (qrCode.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await QrCodeModel.findByIdAndDelete(req.params.id);
    await Scan.deleteMany({ qrCode: req.params.id });

    res.json({ success: true, message: 'QR Code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const previewQR = async (req, res) => {
  try {
    const { type, content, customization } = req.body;

    const qrOptions = {
      color: {
        dark: customization?.foregroundColor || '#000000',
        light: customization?.backgroundColor || '#ffffff'
      },
      width: customization?.size || 200,
      margin: customization?.margin || 4
    };

    let qrContent;
    if (type === 'url') {
      qrContent = content.url;
    } else if (type === 'text') {
      qrContent = content.text;
    } else if (type === 'wifi') {
      qrContent = `WIFI:T:${content.security || 'WPA'};S:${content.ssid};P:${content.password};;`;
    } else if (type === 'vcard') {
      qrContent = `BEGIN:VCARD\nVERSION:3.0\nFN:${content.name}\nORG:${content.organization || ''}\nTEL:${content.phone || ''}\nEMAIL:${content.email || ''}\nURL:${content.website || ''}\nEND:VCARD`;
    }

    const qrImage = await QRCode.toDataURL(qrContent, qrOptions);

    res.json({ success: true, qrImage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const trackScan = async (req, res) => {
  try {
    const qrCode = await QrCodeModel.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const geo = geoip.lookup(ip);

    // Determine device type
    let device = 'desktop';
    if (/mobile/i.test(userAgent)) device = 'mobile';
    else if (/tablet/i.test(userAgent)) device = 'tablet';

    // Extract browser and OS
    const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/i)?.[0] || 'Unknown';
    const os = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/i)?.[0] || 'Unknown';

    // Save scan data
    await Scan.create({
      qrCode: qrCode._id,
      ipAddress: ip,
      userAgent,
      location: geo ? {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        timezone: geo.timezone
      } : {},
      device,
      browser,
      os
    });

    // Increment scan count
    await QrCodeModel.findByIdAndUpdate(req.params.id, { $inc: { scanCount: 1 } });

    res.json({ success: true, message: 'Scan tracked' });
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
  trackScan
};