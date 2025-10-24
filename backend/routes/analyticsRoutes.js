const express = require('express');
const { getDashboardStats, getScanAnalytics, getQRCodeAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Routes
router.get('/dashboard', protect, getDashboardStats);
router.get('/scans', protect, getScanAnalytics);
router.get('/qr/:id', protect, getQRCodeAnalytics);

module.exports = router;