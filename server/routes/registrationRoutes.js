const express = require('express');
const router = express.Router();
const { registerForEvent, getMyRegistrations, checkIn, getEventAttendees, verifyPayment } = require('../controllers/registrationController');
const { protect, college } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/', upload.single('paymentProof'), registerForEvent);
router.get('/my', getMyRegistrations);
router.post('/checkin', college, checkIn);
router.get('/event/:eventId', college, getEventAttendees);
router.put('/:id/verify-payment', college, verifyPayment);

module.exports = router;
