// ============================================================================
// Technician Routes
// ============================================================================
// Created by: M4 (Oneli) - Day 14
//
// ROUTES:
// - GET    /api/technicians         - List all active technicians (Protected)
// - GET    /api/technicians/:id     - Get technician detail (Protected)
// - POST   /api/technicians         - Create a new technician (Coordinator/Admin)
// - PUT    /api/technicians/:id     - Update a technician (Coordinator/Admin)
// - DELETE /api/technicians/:id     - Soft-delete a technician (Coordinator/Admin)
// ============================================================================

import express from 'express';
import {
    getTechnicians,
    getTechnicianById,
    createTechnician,
    updateTechnician,
    deleteTechnician
} from '../controllers/technicianController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateTechnician, validateTechnicianUpdate } from '../middleware/technicianValidation.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/technicians
// ============================================================================
// List all active technicians; supports ?specialization= and ?is_available= filters
// Protected - any authenticated user can view
// ============================================================================
router.get('/', protect, getTechnicians);

// ============================================================================
// ROUTE: POST /api/technicians
// ============================================================================
// Create a new technician record
// Protected + coordinator or admin only
// ============================================================================
router.post('/', protect, authorize('coordinator', 'admin'), validateTechnician, createTechnician);

// ============================================================================
// ROUTE: GET /api/technicians/:id
// ============================================================================
// Get single technician detail
// Protected - any authenticated user can view
// ============================================================================
router.get('/:id', protect, getTechnicianById);

// ============================================================================
// ROUTE: PUT /api/technicians/:id
// ============================================================================
// Update a technician record
// Protected + coordinator or admin only
// ============================================================================
router.put('/:id', protect, authorize('coordinator', 'admin'), validateTechnicianUpdate, updateTechnician);

// ============================================================================
// ROUTE: DELETE /api/technicians/:id
// ============================================================================
// Soft-delete a technician (set is_active = FALSE)
// Protected + coordinator or admin only
// ============================================================================
router.delete('/:id', protect, authorize('coordinator', 'admin'), deleteTechnician);

export default router;
