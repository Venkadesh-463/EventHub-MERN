const express = require('express');
const router = express.Router();
const { handleAiChat } = require('../controllers/aiController');

router.post('/chat', handleAiChat);

module.exports = router;
