// ============================================================================
// Theatre Routes
// ============================================================================
// Created by: M2 (Chandeepa) - Day 8
// Updated by: M1 (Pasindu) - Day 10 (Theatre detail, status toggle)
//
// Defines all theatre-related API routes
//
// ROUTES:
// - GET  /api/theatres              - List all active theatres (Protected)
// - GET  /api/theatres/availability - Check theatre availability (Protected)
// - GET  /api/theatres/:id          - Get single theatre detail (Protected)
// - PUT  /api/theatres/:id/status   - Update theatre status (Coordinator/Admin)
// ============================================================================

import express from 'express';
import {
    getTheatres,
    getTheatreById,
    updateTheatreStatus,
    checkTheatreAvailability
} from '../controllers/theatreController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

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
// ROUTE: GET /api/theatres
// ============================================================================
// Get all active theatres (supports ?status=&type= filters)
// Protected - any authenticated user can view
// Created by: M2 (Chandeepa) - Day 8
// Updated by: M1 (Pasindu) - Day 10 (Added filters & current surgery join)
// ============================================================================
router.get('/', protect, getTheatres);

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
// ============================================================================
router.put('/:id/status', protect, authorize('coordinator', 'admin'), updateTheatreStatus);

export default router;
