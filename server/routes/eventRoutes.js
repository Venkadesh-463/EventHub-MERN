const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, college } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/my', protect, college, async (req, res) => {
  const Event = require('../models/Event');
  const events = await Event.find({ organizer: req.user._id });
  res.json(events);
});

router.route('/').get(getEvents).post(protect, college, upload.single('poster'), createEvent);
router
  .route('/:id')
  .get(getEventById)
  .put(protect, college, updateEvent)
  .delete(protect, college, deleteEvent);

module.exports = router;
