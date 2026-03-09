// ============================================================================
// Analytics Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 18
//
// Defines routes for analytics-related endpoints.
// All routes are protected and require authentication.
// ============================================================================

import express from 'express';
import { getSurgeriesPerDay } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// Surgeries Per Day Route
// ============================================================================
// @route   GET /api/analytics/surgeries-per-day
// @desc    Get surgery count per day for the last 7 days
// @access  Protected (all authenticated users)
// ============================================================================
router.get('/surgeries-per-day', protect, getSurgeriesPerDay);

export default router;
