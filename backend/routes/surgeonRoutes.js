// ============================================================================
// Surgeon Routes
// ============================================================================
// Created by: M1 (Pasindu) - Day 13
// Updated by: M2 (Chandeepa) - Day 13 (added GET /:id)
// Updated by: M1 (Pasindu)   - Day 14 (added PUT /:id, DELETE /:id)
//
// Defines all surgeon-related API routes.
//
// ROUTES:
// - GET    /api/surgeons        - List all active surgeons (protected)
// - GET    /api/surgeons/:id    - Get a single surgeon by ID (protected)
// - POST   /api/surgeons        - Create a new surgeon (coordinator/admin)
// - PUT    /api/surgeons/:id    - Update a surgeon (coordinator/admin)
// - DELETE /api/surgeons/:id    - Soft-delete a surgeon (coordinator/admin)
// ============================================================================

import express from 'express';
import { createSurgeon, getAllSurgeons, getSurgeonById, updateSurgeon, deleteSurgeon } from '../controllers/surgeonController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateSurgeon, validateSurgeonUpdate } from '../middleware/surgeonValidation.js';

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

// ============================================================================
// ROUTE: PUT /api/surgeons/:id
// ============================================================================
// Update an existing surgeon's details (partial update supported).
// Protected + coordinator or admin only.
// Created by: M1 (Pasindu) - Day 14
// ============================================================================
router.put('/:id', protect, authorize('coordinator', 'admin'), validateSurgeonUpdate, updateSurgeon);

// ============================================================================
// ROUTE: DELETE /api/surgeons/:id
// ============================================================================
// Soft-delete a surgeon (sets is_active = FALSE, preserving history).
// Protected + coordinator or admin only.
// Created by: M1 (Pasindu) - Day 14
// ============================================================================
router.delete('/:id', protect, authorize('coordinator', 'admin'), deleteSurgeon);

export default router;


