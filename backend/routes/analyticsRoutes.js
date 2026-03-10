// ============================================================================
// Analytics Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 18
//
// Defines routes for analytics-related endpoints.
// All routes are protected and require authentication.
// ============================================================================

import express from 'express';
import { getSurgeriesPerDay, getSurgeryStatusCounts } from '../controllers/analyticsController.js';
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

// ============================================================================
// Surgery Status Counts Route
// ============================================================================
// @route   GET /api/analytics/surgery-status-counts
// @desc    Get count of surgeries grouped by status
// @access  Protected (all authenticated users)
// Created by: M2 (Chandeepa) - Day 18
// ============================================================================
router.get('/surgery-status-counts', protect, getSurgeryStatusCounts);

export default router;
