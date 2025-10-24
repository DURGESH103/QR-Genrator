const express = require('express');
const { body } = require('express-validator');
const { generateQR, getUserQRCodes, getQRCode, updateQRCode, deleteQRCode, previewQR, trackScan } = require('../controllers/qrController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const qrValidation = [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('type').isIn(['url', 'text', 'wifi', 'vcard', 'file']).withMessage('Invalid QR type'),
  body('content').notEmpty().withMessage('Content is required')
];

// Routes
router.post('/generate', protect, qrValidation, generateQR);
router.post('/preview', protect, previewQR);
router.get('/', protect, getUserQRCodes);
router.get('/:id', protect, getQRCode);
router.put('/:id', protect, updateQRCode);
router.delete('/:id', protect, deleteQRCode);
router.post('/:id/scan', trackScan);

module.exports = router;