const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const { generateQR, getUserQRCodes, getQRCode, updateQRCode, deleteQRCode, previewQR, trackScan, uploadImage } = require('../controllers/qrController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Keep uploads in memory; the controller validates the bytes and persists them to MongoDB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WebP images allowed'));
  }
});

const handleImageUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : err.message;
    res.status(400).json({ message });
  });
};

// Validation rules
const qrValidation = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('type').isIn(['url', 'text', 'wifi', 'vcard', 'file', 'email', 'phone', 'sms', 'whatsapp', 'location', 'social', 'event', 'image', 'emoji', 'logo']).withMessage('Invalid QR type'),
  body('content').notEmpty().withMessage('Content is required')
];

// Routes
router.post('/upload-image', protect, handleImageUpload, uploadImage);
router.post('/generate', protect, qrValidation, generateQR);
router.post('/preview', protect, previewQR);
router.get('/', protect, getUserQRCodes);
router.get('/:id', protect, getQRCode);
router.put('/:id', protect, updateQRCode);
router.delete('/:id', protect, deleteQRCode);
router.post('/:id/scan', trackScan);

module.exports = router;
