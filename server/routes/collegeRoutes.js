const express = require('express');
const router = express.Router();
const { protect, college } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getAllColleges, getCollegeById, getCollegeStats, uploadCollegeLogo } = require('../controllers/collegeController');

// Public routes
router.get('/', getAllColleges);
router.get('/:id', getCollegeById);

// Private route - college admin stats
router.get('/stats', protect, college, getCollegeStats);

// Private route - upload logo
router.put('/:id/logo', protect, upload.single('logo'), uploadCollegeLogo);

module.exports = router;
