// ============================================================================
// Patient Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 15
//
// ROUTES:
// - GET  /api/patients         - List all active patients (Protected)
// - GET  /api/patients/:id     - Get patient detail (Protected)
// - POST /api/patients         - Create a new patient (Coordinator/Admin)
// ============================================================================

import express from 'express';
import { getPatients, getPatientById, createPatient } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/patients
// ============================================================================
// List all active patients; supports ?gender= and ?blood_type= filters
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
// ROUTE: GET /api/patients/:id
// ============================================================================
// Get single patient detail
// Protected - any authenticated user can view
// ============================================================================
router.get('/:id', protect, getPatientById);

export default router;
