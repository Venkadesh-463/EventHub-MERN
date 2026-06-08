const express = require('express');
const router = express.Router();
const { getCollegeAnalytics, getAdminAnalytics, getStudentAnalytics, getCollegeReportData } = require('../controllers/analyticsController');
const { protect, college, admin } = require('../middleware/authMiddleware');

router.get('/college', protect, college, getCollegeAnalytics);
router.get('/college/report', protect, college, getCollegeReportData);
router.get('/admin', protect, admin, getAdminAnalytics);
router.get('/student', protect, getStudentAnalytics);

module.exports = router;
