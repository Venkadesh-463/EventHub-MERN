const express = require('express');
const router = express.Router();
const { generateCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

// Any authenticated user can request - controller enforces ownership
router.get('/:registrationId', protect, generateCertificate);

module.exports = router;
