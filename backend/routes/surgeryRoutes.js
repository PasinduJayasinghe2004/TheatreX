// ============================================================================
// Surgery Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 5
// Updated by: M2 (Chandeepa) - Day 6 (Added DELETE route)
// Updated by: M1 (Pasindu) - Day 6 (Added PUT route)
// Updated by: M3 (Janani) - Day 6 (Added PATCH status route)
// Updated by: M1 (Pasindu) - Day 8 (Added conflict detection route)
// 
// Defines all surgery-related API routes
//
// ROUTES:
// - POST   /api/surgeries                  - Create new surgery (Coordinator, Admin)
// - POST   /api/surgeries/check-conflicts  - Check scheduling conflicts (Protected) - M1 Day 8
// - GET    /api/surgeries                  - Get all surgeries (Protected)
// - GET    /api/surgeries/:id              - Get surgery by ID (Protected)
// - PUT    /api/surgeries/:id              - Update surgery (Coordinator, Admin)
// - PATCH  /api/surgeries/:id/status       - Update surgery status (Coordinator, Admin)
// - GET    /api/surgeries/surgeons         - Get surgeons for dropdown (Protected)
// - GET    /api/surgeries/events           - Get calendar events (Protected) - M2 Day 7
// - DELETE /api/surgeries/:id              - Delete surgery (Coordinator, Admin)
// ============================================================================

import express from 'express';
import {
    createSurgery,
    getAllSurgeries,
    getSurgeryById,
    getSurgeonsDropdown,
    updateSurgery,
    updateSurgeryStatus,
    deleteSurgery,
    getCalendarEvents,
    checkConflicts
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
// ROUTE: GET /api/surgeries/events
// ============================================================================
// Get surgeries formatted as FullCalendar-compatible events
// Supports date range + status filters via query params
// Protected - any authenticated user can view
// Created by: M2 (Chandeepa) - Day 7
// ============================================================================
router.get('/events', protect, getCalendarEvents);

// ============================================================================
// ROUTE: POST /api/surgeries/check-conflicts
// ============================================================================
// Check for scheduling conflicts before booking a surgery
// Checks: theatre, surgeon, anaesthetist, nurses
// Protected - any authenticated user can check
// Created by: M1 (Pasindu) - Day 8
// ============================================================================
router.post('/check-conflicts', protect, checkConflicts);

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
// Update a surgery's details
// Protected - only coordinators and admins can update surgeries
// Created by: M1 (Pasindu) - Day 6
// ============================================================================
router.put('/:id', protect, authorize('coordinator', 'admin'), updateSurgery);

// ============================================================================
// ROUTE: PATCH /api/surgeries/:id/status
// ============================================================================
// Update only the status of a surgery (with transition validation)
// Protected - only coordinators and admins can change status
// Created by: M3 (Janani) - Day 6
// ============================================================================
router.patch('/:id/status', protect, authorize('coordinator', 'admin'), updateSurgeryStatus);

// ============================================================================
// ROUTE: DELETE /api/surgeries/:id
// ============================================================================
// Delete a surgery by ID
// Protected - only coordinators and admins can delete surgeries
// Created by: M2 (Chandeepa) - Day 6
// ============================================================================
router.delete('/:id', protect, authorize('coordinator', 'admin'), deleteSurgery);

export default router;
