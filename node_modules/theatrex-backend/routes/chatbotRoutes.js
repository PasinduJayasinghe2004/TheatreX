// ============================================================================
// Chatbot Routes
// ============================================================================
// AI-powered chatbot endpoints with Gemini Flash integration
// All routes are protected — require authentication
// ============================================================================

import express from 'express';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/chatbot/message
// @desc    Send a message and get AI response
// @access  Protected
router.post('/message', protect, sendChatMessage);

// @route   GET /api/chatbot/history
// @desc    Get conversation history for the authenticated user
// @access  Protected
router.get('/history', protect, getChatHistory);

// @route   DELETE /api/chatbot/history
// @desc    Clear conversation history
// @access  Protected
router.delete('/history', protect, clearChatHistory);

export default router;
