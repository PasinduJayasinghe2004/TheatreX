// ============================================================================
// Theatre Routes
// ============================================================================
// Created by: M2 (Chandeepa) - Day 8
// Updated by: M1 (Pasindu) - Day 10 (Theatre detail, status toggle)
// Updated by: M1 (Pasindu) - Day 11 (Surgery progress endpoint)
// Updated by: M2 (Chandeepa) - Day 11 (Auto-progress calculation endpoint)
// Updated by: M3 (Janani)   - Day 11 (Live status polling endpoint)
// Updated by: M4 (Oneli)    - Day 11 (Theatre duration calculation endpoint)
//
// Defines all theatre-related API routes
//
// ROUTES:
// - GET  /api/theatres              - List all active theatres (Protected)
// - GET  /api/theatres/availability - Check theatre availability (Protected)
// - GET  /api/theatres/live-status  - Live status polling endpoint (Protected)
// - GET  /api/theatres/:id          - Get single theatre detail (Protected)
// - PUT  /api/theatres/:id/status   - Update theatre status (Coordinator/Admin)
// - GET  /api/theatres/:id/current-surgery - Get current surgery (Protected)
// - GET  /api/theatres/:id/auto-progress   - Auto-calculated progress (Protected)
// - PUT  /api/theatres/:id/progress - Update surgery progress (Coordinator/Admin)
// - GET  /api/theatres/:id/duration - Theatre duration calculation (Protected)
// ============================================================================

import express from 'express';
import {
    getTheatres,
    getTheatreById,
    updateTheatreStatus,
    checkTheatreAvailability,
    getCurrentSurgeryByTheatreId,
    updateSurgeryProgress,
    getAutoProgress,
    getLiveStatus,
    getTheatreDuration,
    getTheatreStats
} from '../controllers/theatreController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    validateTheatreStatus,
    validateTheatreFilters
} from '../middleware/theatreValidation.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/theatres/availability
// ============================================================================
// Check which theatres are available for a given date/time/duration
// Must be before the root '/' route to avoid path conflicts
// Protected - any authenticated user can view
// Created by: M2 (Chandeepa) - Day 8
// ============================================================================
router.get('/availability', protect, checkTheatreAvailability);

// ============================================================================
// ROUTE: GET /api/theatres/live-status
// ============================================================================
// Lightweight polling endpoint for real-time theatre status dashboard.
// Returns all active theatres with current surgery + auto-progress.
// Optimised for frequent (30s) polling — minimal payload.
// Must be before /:id to avoid path conflicts.
// Protected - any authenticated user can view
// Created by: M3 (Janani) - Day 11
// ============================================================================
router.get('/live-status', protect, getLiveStatus);

// ============================================================================
// ROUTE: GET /api/theatres/stats
// ============================================================================
// Get summary statistics for all theatres.
// Returns counts by status, type, and utilization stats.
// Protected - any authenticated user can view
// Created by: M5 (Inthusha) - Day 11
// ============================================================================
router.get('/stats', protect, getTheatreStats);

// ============================================================================
// ROUTE: GET /api/theatres
// ============================================================================
// Get all active theatres (supports ?status=&type= filters)
// Protected - any authenticated user can view
// Created by: M2 (Chandeepa) - Day 8
// Updated by: M1 (Pasindu) - Day 10 (Added filters & current surgery join)
// Updated by: M3 (Janani)  - Day 10 (Added validateTheatreFilters middleware)
// ============================================================================
router.get('/', protect, validateTheatreFilters, getTheatres);

// ============================================================================
// ROUTE: GET /api/theatres/:id
// ============================================================================
// Get single theatre detail with current surgery info
// Protected - any authenticated user can view
// Created by: M1 (Pasindu) - Day 10
// ============================================================================
router.get('/:id', protect, getTheatreById);

// ============================================================================
// ROUTE: PUT /api/theatres/:id/status
// ============================================================================
// Update a theatre's status (available, in_use, maintenance, cleaning)
// Protected + (coordinator or admin only)
// Created by: M1 (Pasindu) - Day 10
// Updated by: M3 (Janani)  - Day 10 (Added validateTheatreStatus middleware)
// ============================================================================
router.put('/:id/status', protect, authorize('coordinator', 'admin'), validateTheatreStatus, updateTheatreStatus);

// ============================================================================
// ROUTE: GET /api/theatres/:id/current-surgery
// ============================================================================
// Get the currently in-progress surgery for a specific theatre
// Protected - any authenticated user can view
// Created by: M5 (Inthusha) - Day 10
// ============================================================================
router.get('/:id/current-surgery', protect, getCurrentSurgeryByTheatreId);

// ============================================================================
// ROUTE: PUT /api/theatres/:id/progress
// ============================================================================
// Update the progress percentage of the current in-progress surgery
// Protected + (coordinator or admin only)
// Created by: M1 (Pasindu) - Day 11
// ============================================================================
router.put('/:id/progress', protect, authorize('coordinator', 'admin'), updateSurgeryProgress);

// ============================================================================
// ROUTE: GET /api/theatres/:id/auto-progress
// ============================================================================
// Get auto-calculated progress for the current in-progress surgery
// based on elapsed time vs. estimated duration
// Protected - any authenticated user can view
// Created by: M2 (Chandeepa) - Day 11
// ============================================================================
router.get('/:id/auto-progress', protect, getAutoProgress);

// ============================================================================
// ROUTE: GET /api/theatres/:id/duration
// ============================================================================
// Calculate elapsed, remaining, and total duration for the current surgery
// Returns both raw minutes and formatted human-readable strings
// Protected - any authenticated user can view
// Created by: M4 (Oneli) - Day 11
// ============================================================================
router.get('/:id/duration', protect, getTheatreDuration);

export default router;
