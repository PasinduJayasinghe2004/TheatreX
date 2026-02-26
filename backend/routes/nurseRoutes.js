// ============================================================================
// Nurse Routes
// ============================================================================
// Created by: M4 (Oneli) - Day 13
//
// ROUTES:
// - GET  /api/nurses         - List all active nurses (Protected)
// - GET  /api/nurses/:id     - Get nurse detail (Protected)
// - POST /api/nurses         - Create a new nurse (Coordinator/Admin)
// ============================================================================

import express from 'express';
import { getNurses, getNurseById, createNurse } from '../controllers/nurseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/nurses
// ============================================================================
// List all active nurses; supports ?specialization= and ?is_available= filters
// Protected - any authenticated user can view
// ============================================================================
router.get('/', protect, getNurses);

// ============================================================================
// ROUTE: POST /api/nurses
// ============================================================================
// Create a new nurse record
// Protected + coordinator or admin only
// ============================================================================
router.post('/', protect, authorize('coordinator', 'admin'), createNurse);

// ============================================================================
// ROUTE: GET /api/nurses/:id
// ============================================================================
// Get single nurse detail
// Protected - any authenticated user can view
// ============================================================================
router.get('/:id', protect, getNurseById);

export default router;
