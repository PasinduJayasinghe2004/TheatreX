// ============================================================================
// Patient Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 15
// Updated by: M2 (Chandeepa) - Day 15
//
// ROUTES:
// - GET    /api/patients         - List all active patients (Protected)
// - GET    /api/patients/:id     - Get patient detail (Protected)
// - POST   /api/patients         - Create a new patient (Coordinator/Admin)
// - PUT    /api/patients/:id     - Update a patient (Coordinator/Admin)
// - DELETE /api/patients/:id     - Soft-delete a patient (Coordinator/Admin)
// ============================================================================

import express from 'express';
import {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
} from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/patients
// ============================================================================
// List all active patients; supports ?gender= , ?blood_type= , ?search= filters
// Protected - any authenticated user can view
// ============================================================================
router.get('/', protect, getPatients);

// ============================================================================
// ROUTE: POST /api/patients
// ============================================================================
// Create a new patient record
// Protected + coordinator or admin only
// ============================================================================
router.post('/', protect, authorize('coordinator', 'admin'), createPatient);

// ============================================================================
// ROUTE: PUT /api/patients/:id
// ============================================================================
// Update an existing patient record (partial update)
// Protected + coordinator or admin only
// ============================================================================
router.put('/:id', protect, authorize('coordinator', 'admin'), updatePatient);

// ============================================================================
// ROUTE: DELETE /api/patients/:id
// ============================================================================
// Soft delete a patient record
// Protected + coordinator or admin only
// ============================================================================
router.delete('/:id', protect, authorize('coordinator', 'admin'), deletePatient);

// ============================================================================
// ROUTE: GET /api/patients/:id
// ============================================================================
// Get single patient detail
// Protected - any authenticated user can view
// ============================================================================
router.get('/:id', protect, getPatientById);

// ============================================================================
// ROUTE: PUT /api/patients/:id
// ============================================================================
// Update an existing patient record
// Protected + coordinator or admin only
// ============================================================================
router.put('/:id', protect, authorize('coordinator', 'admin'), updatePatient);

// ============================================================================
// ROUTE: DELETE /api/patients/:id
// ============================================================================
// Soft-delete a patient (set is_active = false)
// Protected + coordinator or admin only
// ============================================================================
router.delete('/:id', protect, authorize('coordinator', 'admin'), deletePatient);

export default router;
