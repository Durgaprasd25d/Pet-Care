const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Public routes so anyone can chat with AI (as requested)
router.post('/chat', aiController.chatWithAI);
router.post('/chat/stream', aiController.chatWithAIStream);

module.exports = router;
