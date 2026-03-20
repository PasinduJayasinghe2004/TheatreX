// ============================================================================
// Dashboard Routes
// ============================================================================
// Created by: M4 (Oneli) - Day 7
// 
// Defines routes for dashboard-related endpoints.
// All routes are protected and require authentication.
// ============================================================================

import express from 'express';
import { getDashboardStats, getDashboardSummary } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// Dashboard Statistics Route
// ============================================================================
// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Protected (all authenticated users)
// ============================================================================
router.get('/stats', protect, getDashboardStats);

// ============================================================================
// Dashboard Summary Route
// ============================================================================
// @route   GET /api/dashboard/summary
// @desc    Get high-level dashboard summary
// @access  Protected (coordinator, admin)
// ============================================================================
router.get('/summary', protect, authorize('coordinator', 'admin'), getDashboardSummary);

export default router;
