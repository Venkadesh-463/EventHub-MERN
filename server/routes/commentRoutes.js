const express = require('express');
const router = express.Router();
const { getComments, postComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:eventId', getComments);
router.post('/', protect, postComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
