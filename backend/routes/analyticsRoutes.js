// ============================================================================
// Analytics Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 18
//
// Defines routes for analytics-related endpoints.
// All routes are protected and require authentication.
// ============================================================================

import express from 'express';
import {
    getSurgeriesPerDay,
    getSurgeryStatusCounts,
    getPatientDemographics,
    getStaffCountsByRole,
    getTheatreUtilization,
    getSurgeryDurationStats
} from '../controllers/analyticsController.js';
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

// ============================================================================
// Patient Demographics Route
// ============================================================================
// @route   GET /api/analytics/patient-demographics
// @desc    Get patient demographic breakdown (gender, blood type, age groups)
// @access  Protected (all authenticated users)
// Created by: M3 (Janani) - Day 18
// ============================================================================
router.get('/patient-demographics', protect, getPatientDemographics);

// ============================================================================
// Staff Counts Route
// ============================================================================
// @route   GET /api/analytics/staff-counts
// @desc    Get count of staff members grouped by role
// @access  Protected (all authenticated users)
// Created by: M4 (Oneli) - Day 18
// ============================================================================
router.get('/staff-counts', protect, getStaffCountsByRole);

// ============================================================================
// Theatre Utilization Route
// ============================================================================
// @route   GET /api/analytics/theatre-utilization
// @desc    Get theatre utilization percentage for the last 7 days
// @access  Protected (all authenticated users)
// Created by: M5 (Inthusha) - Day 18
// ============================================================================
router.get('/theatre-utilization', protect, getTheatreUtilization);

// ============================================================================
// Surgery Duration Stats Route
// ============================================================================
// @route   GET /api/analytics/surgery-duration-stats
// @desc    Get surgery duration distribution (histogram buckets) + summary stats
// @access  Protected (all authenticated users)
// Created by: M4 (Oneli) - Day 19
// ============================================================================
router.get('/surgery-duration-stats', protect, getSurgeryDurationStats);

export default router;
