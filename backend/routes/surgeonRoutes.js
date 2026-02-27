// ============================================================================
// Surgeon Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 13
// Updated by: M2 (Chandeepa) - Day 13 (added GET /:id)
//
// Defines all surgeon-related API routes.
//
// ROUTES:
// - GET  /api/surgeons           - List all active surgeons (protected)
// - GET  /api/surgeons/:id       - Get a single surgeon by ID (protected)
// - POST /api/surgeons           - Create a new surgeon (coordinator/admin)
// ============================================================================

import express from 'express';
import { createSurgeon, getAllSurgeons, getSurgeonById } from '../controllers/surgeonController.js';
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
// ROUTE: GET /api/surgeons/:id
// ============================================================================
// Get a single surgeon by ID (active only).
// Protected – any authenticated user can view.
// Created by: M2 (Chandeepa) - Day 13
// ============================================================================
router.get('/:id', protect, getSurgeonById);

// ============================================================================
// ROUTE: POST /api/surgeons
// ============================================================================
// Create a new surgeon record.
// Protected + coordinator or admin only.
// Created by: M1 (Pasindu) - Day 13
// ============================================================================
router.post('/', protect, authorize('coordinator', 'admin'), validateSurgeon, createSurgeon);

export default router;

