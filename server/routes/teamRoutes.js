const express = require('express');
const router = express.Router();
const { createTeam, joinTeam, getTeamDetails } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createTeam);
router.post('/join/:code', protect, joinTeam);
router.get('/:id', protect, getTeamDetails);

module.exports = router;
