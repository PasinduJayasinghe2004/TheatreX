// ============================================================================
// Surgery Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 5
// Updated by: M2 (Chandeepa) - Day 6 (Added DELETE route)
// Updated by: M1 (Pasindu) - Day 6 (Added PUT route)
// Updated by: M3 (Janani) - Day 6 (Added PATCH status route)
// Updated by: M1 (Pasindu) - Day 8 (Added conflict detection route)
// Updated by: M1 (Pasindu) - Day 9 (Added available surgeons route)
// Updated by: M2 (Chandeepa) - Day 9 (Added available nurses route)
// Updated by: M3 (Janani) - Day 9 (Added available anaesthetists route)
// Updated by: M4 (Oneli) - Day 9 (Added staff conflict check route)
// Updated by: M3 (Janani) - Day 12 (Added assign-theatre and unassigned surgeries routes)
// 
// Defines all surgery-related API routes
//
// ROUTES:
// - POST   /api/surgeries                           - Create new surgery (Coordinator, Admin)
// - POST   /api/surgeries/check-conflicts            - Check scheduling conflicts (Protected) - M1 Day 8
// - POST   /api/surgeries/check-staff-conflicts      - Check staff conflicts (Protected) - M4 Day 9
// - GET    /api/surgeries                           - Get all surgeries (Protected)
// - GET    /api/surgeries/unassigned                 - Get surgeries without theatre (Protected) - M3 Day 12
// - GET    /api/surgeries/history                    - Get completed surgery history (Protected) - M1 Day 20
// - GET    /api/surgeries/history/export/csv         - Export filtered history as CSV (Protected) - Day 21
// - GET    /api/surgeries/:id                       - Get surgery by ID (Protected)
// - GET    /api/surgeries/:id/export/csv            - Export surgery detail as CSV (Protected) - Day 21
// - PUT    /api/surgeries/:id                       - Update surgery (Coordinator, Admin)
// - PATCH  /api/surgeries/:id/status                - Update surgery status (Coordinator, Admin)
// - PATCH  /api/surgeries/:id/assign-theatre        - Assign surgery to theatre (Coordinator, Admin) - M3 Day 12
// - GET    /api/surgeries/surgeons                  - Get surgeons for dropdown (Protected)
// - GET    /api/surgeries/surgeons/available         - Get available surgeons (Protected) - M1 Day 9
// - GET    /api/surgeries/nurses/available           - Get available nurses (Protected) - M2 Day 9
// - GET    /api/surgeries/anaesthetists/available    - Get available anaesthetists (Protected) - M3 Day 9
// - GET    /api/surgeries/events                    - Get calendar events (Protected) - M2 Day 7
// - DELETE /api/surgeries/:id                       - Delete surgery (Coordinator, Admin)
// ============================================================================

import express from 'express';
import {
    createSurgery,
    getAllSurgeries,
    getSurgeryById,
    getSurgeonsDropdown,
    getAvailableSurgeons,
    getAvailableNurses,
    getAvailableAnaesthetists,
    updateSurgery,
    updateSurgeryStatus,
    deleteSurgery,
    getCalendarEvents,
    checkConflicts,
    checkStaffConflicts,
    assignStaff,
    assignSurgeryToTheatre,
    getUnassignedSurgeries,
    getSurgeryHistory,
    exportSurgeryHistoryCsv,
    exportSurgeryDetailCsv
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
// ROUTE: GET /api/surgeries/surgeons/available
// ============================================================================
// Get surgeons with availability status for a given date/time slot
// Query params: date, time, duration, exclude_surgery_id (optional)
// Protected - any authenticated user can view
// Created by: M1 (Pasindu) - Day 9
// ============================================================================
router.get('/surgeons/available', protect, getAvailableSurgeons);

// ============================================================================
// ROUTE: GET /api/surgeries/nurses/available
// ============================================================================
// Get nurses with availability status for a given date/time slot
// Query params: date, time, duration, exclude_surgery_id (optional)
// Protected - any authenticated user can view
// Created by: M2 (Chandeepa) - Day 9
// ============================================================================
router.get('/nurses/available', protect, getAvailableNurses);

// ============================================================================
// ROUTE: GET /api/surgeries/anaesthetists/available
// ============================================================================
// Get anaesthetists with availability status for a given date/time slot
// Query params: date, time, duration, exclude_surgery_id (optional)
// Protected - any authenticated user can view
// Created by: M3 (Janani) - Day 9
// ============================================================================
router.get('/anaesthetists/available', protect, getAvailableAnaesthetists);

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
// ROUTE: POST /api/surgeries/check-staff-conflicts
// ============================================================================
// Check for staff-specific scheduling conflicts with detailed warnings
// Returns warning UI data for surgeon, anaesthetist, and nurse conflicts
// Protected - any authenticated user can check
// Created by: M4 (Oneli) - Day 9
// ============================================================================
router.post('/check-staff-conflicts', protect, checkStaffConflicts);

// ============================================================================
// ROUTE: GET /api/surgeries/unassigned
// ============================================================================
// Get surgeries that do not have a theatre assigned yet.
// Supports optional date range + status filters via query params.
// Protected - any authenticated user can view
// Created by: M3 (Janani) - Day 12
// ============================================================================
router.get('/unassigned', protect, getUnassignedSurgeries);

// ============================================================================
// ROUTE: GET /api/surgeries/history
// ============================================================================
// Get completed surgeries for history view
// Query params: startDate, endDate, surgeonId, theatreId, page, limit (optional)
// Protected - any authenticated user can view
// Created by: M1 (Pasindu) - Day 20
// ============================================================================
router.get('/history', protect, getSurgeryHistory);

// ============================================================================
// ROUTE: GET /api/surgeries/history/export/csv
// ============================================================================
// Export completed surgery history in CSV format
// Query params: startDate, endDate, surgeonId, theatreId (optional)
// Protected - any authenticated user can export
// Created by: M1/M2 - Day 21
// ============================================================================
router.get('/history/export/csv', protect, exportSurgeryHistoryCsv);

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
// ROUTE: GET /api/surgeries/:id/export/csv
// ============================================================================
// Export a single surgery detail in CSV format
// Protected - any authenticated user can export
// Created by: M3 - Day 21
// ============================================================================
router.get('/:id/export/csv', protect, exportSurgeryDetailCsv);

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
// ROUTE: PATCH /api/surgeries/:id/assign-theatre
// ============================================================================
// Assign (or reassign) a surgery to a specific theatre.
// Validates theatre exists, is active, not in maintenance, and checks
// for time-slot conflicts in the target theatre.
// Protected + (coordinator or admin only)
// Created by: M3 (Janani) - Day 12
// ============================================================================
router.patch('/:id/assign-theatre', protect, authorize('coordinator', 'admin'), assignSurgeryToTheatre);

// ============================================================================
// ROUTE: PATCH /api/surgeries/:id/staff
// ============================================================================
// Unified staff assignment (surgeon, anaesthetist, and nurses)
// Protected - only coordinators and admins can assign staff
// Created by: M5 (User) - Day 9
// ============================================================================
router.patch('/:id/staff', protect, authorize('coordinator', 'admin'), assignStaff);

// ============================================================================
// ROUTE: DELETE /api/surgeries/:id
// ============================================================================
// Delete a surgery by ID
// Protected - only coordinators and admins can delete surgeries
// Created by: M2 (Chandeepa) - Day 6
// ============================================================================
router.delete('/:id', protect, authorize('coordinator', 'admin'), deleteSurgery);

export default router;
