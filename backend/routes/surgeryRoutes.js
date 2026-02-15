// ============================================================================
// Surgery Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 5
// Updated by: M1 (Pasindu) - Day 6 (Added PUT endpoint)
// 
// Defines all surgery-related API routes
//
// ROUTES:
// - POST   /api/surgeries         - Create new surgery (Coordinator, Admin)
// - GET    /api/surgeries         - Get all surgeries (Protected)
// - GET    /api/surgeries/:id     - Get surgery by ID (Protected)
// - PUT    /api/surgeries/:id     - Update surgery (Coordinator, Admin)
// - GET    /api/surgeries/surgeons - Get surgeons for dropdown (Protected)
// ============================================================================

import express from 'express';
import {
    createSurgery,
    getAllSurgeries,
    getSurgeryById,
    getSurgeonsDropdown,
    updateSurgery
} from '../controllers/surgeryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateSurgery } from '../middleware/surgeryValidation.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/surgeries/surgeons
// ============================================================================
// Get list of surgeons for dropdown selection
// Must be before /:id route to avoid conflict
// Protected - any authenticated user can view
// ============================================================================
router.get('/surgeons', protect, getSurgeonsDropdown);

// ============================================================================
// ROUTE: POST /api/surgeries
// ============================================================================
// Create a new surgery
// Protected - only coordinators and admins can create surgeries
// Validates surgery data before processing
// ============================================================================
router.post('/', protect, authorize('coordinator', 'admin'), validateSurgery, createSurgery);

// ============================================================================
// ROUTE: GET /api/surgeries
// ============================================================================
// Get all surgeries
// Protected - any authenticated user can view
// ============================================================================
router.get('/', protect, getAllSurgeries);

// ============================================================================
// ROUTE: GET /api/surgeries/:id
// ============================================================================
// Get a single surgery by ID
// Protected - any authenticated user can view
// ============================================================================
router.get('/:id', protect, getSurgeryById);

// ============================================================================
// ROUTE: PUT /api/surgeries/:id
// ============================================================================
// Update a surgery
// Protected - only coordinators and admins can update surgeries
// Created by: M1 (Pasindu) - Day 6
// ============================================================================
router.put('/:id', protect, authorize('coordinator', 'admin'), updateSurgery);

export default router;
