// ============================================================================
// Nurse Routes
// ============================================================================
// Created by: M3 (Janani) - Day 13
//
// Defines all nurse-related API routes.
//
// ROUTES:
// - GET  /api/nurses           - List all active nurses (protected)
// - GET  /api/nurses/:id       - Get a single nurse by ID (protected)
// - POST /api/nurses           - Create a new nurse (coordinator/admin)
// ============================================================================

import express from 'express';
import { createNurse, getAllNurses, getNurseById } from '../controllers/nurseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateNurse } from '../middleware/nurseValidation.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/nurses
// ============================================================================
// List all active nurses.
// Supports ?search= (name / specialization / email), ?available= (true/false),
// and ?shift= (morning/afternoon/night/flexible)
// Protected – any authenticated user can view.
// Created by: M3 (Janani) - Day 13
// ============================================================================
router.get('/', protect, getAllNurses);

// ============================================================================
// ROUTE: GET /api/nurses/:id
// ============================================================================
// Get a single nurse by ID (active only).
// Protected – any authenticated user can view.
// Created by: M3 (Janani) - Day 13
// ============================================================================
router.get('/:id', protect, getNurseById);

// ============================================================================
// ROUTE: POST /api/nurses
// ============================================================================
// Create a new nurse record.
// Protected + coordinator or admin only.
// Created by: M3 (Janani) - Day 13
// ============================================================================
router.post('/', protect, authorize('coordinator', 'admin'), validateNurse, createNurse);

export default router;
