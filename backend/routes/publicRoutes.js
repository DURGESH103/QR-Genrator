const express = require('express');
const { getPublicQR, getPublicImage } = require('../controllers/qrController');

const router = express.Router();

// Unauthenticated, read-only endpoints used by the /view/:id share page
router.get('/qr/:id', getPublicQR);
router.get('/images/:id', getPublicImage);

module.exports = router;
