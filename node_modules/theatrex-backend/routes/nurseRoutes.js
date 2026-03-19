// ============================================================================
// Nurse Routes
// ============================================================================
// Created by: M3 (Janani) - Day 13
// Updated by: M2 (Chandeepa) - Day 14 (added PUT /:id, DELETE /:id)
//
// Defines all nurse-related API routes.
//
// ROUTES:
// - GET    /api/nurses        - List all active nurses (protected)
// - GET    /api/nurses/:id    - Get a single nurse by ID (protected)
// - POST   /api/nurses        - Create a new nurse (coordinator/admin)
// - PUT    /api/nurses/:id    - Update a nurse (coordinator/admin)
// - DELETE /api/nurses/:id    - Soft-delete a nurse (coordinator/admin)
// ============================================================================

import express from 'express';
import { createNurse, getAllNurses, getNurseById, updateNurse, deleteNurse } from '../controllers/nurseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateNurse, validateNurseUpdate } from '../middleware/nurseValidation.js';
import { uploadProfilePicture } from '../middleware/uploadMiddleware.js';

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
router.post('/', protect, authorize('coordinator', 'admin'), uploadProfilePicture, validateNurse, createNurse);

// ============================================================================
// ROUTE: PUT /api/nurses/:id
// ============================================================================
// Update an existing nurse's details (partial update supported).
// Protected + coordinator or admin only.
// Created by: M2 (Chandeepa) - Day 14
// ============================================================================
router.put('/:id', protect, authorize('coordinator', 'admin'), uploadProfilePicture, validateNurseUpdate, updateNurse);

// ============================================================================
// ROUTE: DELETE /api/nurses/:id
// ============================================================================
// Soft-delete a nurse (sets is_active = FALSE, preserving history).
// Protected + coordinator or admin only.
// Created by: M2 (Chandeepa) - Day 14
// ============================================================================
router.delete('/:id', protect, authorize('coordinator', 'admin'), deleteNurse);



export default router;
