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
import { validatePatient, validatePatientUpdate } from '../middleware/patientValidation.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/patients
// ============================================================================
router.get('/', protect, getPatients);

// ============================================================================
// ROUTE: POST /api/patients
// ============================================================================
router.post('/', protect, authorize('coordinator', 'admin'), validatePatient, createPatient);

// ============================================================================
// ROUTE: GET /api/patients/:id
// ============================================================================
router.get('/:id', protect, getPatientById);

// ============================================================================
// ROUTE: PUT /api/patients/:id
// ============================================================================
router.put('/:id', protect, authorize('coordinator', 'admin'), validatePatientUpdate, updatePatient);

// ============================================================================
// ROUTE: DELETE /api/patients/:id
// ============================================================================
router.delete('/:id', protect, authorize('coordinator', 'admin'), deletePatient);

export default router;
