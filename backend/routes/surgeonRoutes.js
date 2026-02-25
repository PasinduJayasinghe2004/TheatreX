// ============================================================================
// Surgeon Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 13
//
// Defines all surgeon-related API routes.
//
// ROUTES:
// - POST /api/surgeons           - Create a new surgeon (coordinator/admin)
// - GET  /api/surgeons           - List all active surgeons (protected)
// ============================================================================

import express from 'express';
import { createSurgeon, getAllSurgeons } from '../controllers/surgeonController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateSurgeon } from '../middleware/surgeonValidation.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/surgeons
// ============================================================================
// List all active surgeons.
// Supports ?search= (name / specialization / email) and ?available= (true/false)
// Protected – any authenticated user can view.
// Created by: M1 (Pasindu) - Day 13
// ============================================================================
router.get('/', protect, getAllSurgeons);

// ============================================================================
// ROUTE: POST /api/surgeons
// ============================================================================
// Create a new surgeon record.
// Protected + coordinator or admin only.
// Created by: M1 (Pasindu) - Day 13
// ============================================================================
router.post('/', protect, authorize('coordinator', 'admin'), validateSurgeon, createSurgeon);

export default router;
