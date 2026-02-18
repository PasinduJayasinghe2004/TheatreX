// ============================================================================
// Theatre Routes
// ============================================================================
// Created by: M2 (Chandeepa) - Day 8
//
// Defines all theatre-related API routes
//
// ROUTES:
// - GET /api/theatres              - List all active theatres (Protected)
// - GET /api/theatres/availability - Check theatre availability (Protected)
// ============================================================================

import express from 'express';
import {
    getTheatres,
    checkTheatreAvailability
} from '../controllers/theatreController.js';
import { protect } from '../middleware/authMiddleware.js';

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
// Get all active theatres for dropdown selection
// Protected - any authenticated user can view
// Created by: M2 (Chandeepa) - Day 8
// ============================================================================
router.get('/', protect, getTheatres);

export default router;
