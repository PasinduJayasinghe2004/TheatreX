// ============================================================================
// Dashboard Routes
// ============================================================================
// Created by: M4 (Oneli) - Day 7
// 
// Defines routes for dashboard-related endpoints.
// All routes are protected and require authentication.
// ============================================================================

import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// Dashboard Statistics Route
// ============================================================================
// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Protected (all authenticated users)
// ============================================================================
router.get('/stats', protect, getDashboardStats);

export default router;
