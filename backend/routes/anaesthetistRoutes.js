// ============================================================================
// Anaesthetist Routes
// ============================================================================
// Created by: M5 (Inthusha) - Day 13
// Updated by: M3 (Janani)   - Day 14 (added GET /:id, PUT /:id, DELETE /:id)
//
// ROUTES:
// - GET    /api/anaesthetists            - List all active anaesthetists
// - GET    /api/anaesthetists/available  - List available anaesthetists
// - GET    /api/anaesthetists/:id        - Get a single anaesthetist by ID
// - POST   /api/anaesthetists            - Create a new anaesthetist (admin)
// - PUT    /api/anaesthetists/:id        - Update an anaesthetist (coordinator/admin)
// - DELETE /api/anaesthetists/:id        - Soft-delete an anaesthetist (coordinator/admin)
// - PUT    /api/anaesthetists/:id/availability - Toggle availability
// ============================================================================

import express from 'express';
import {
    getAnaesthetists,
    getAvailableAnaesthetists,
    getAnaesthetistById,
    createAnaesthetist,
    updateAnaesthetist,
    deleteAnaesthetist,
    updateAvailability
} from '../controllers/anaesthetistController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateAnaesthetistUpdate } from '../middleware/anaesthetistValidation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all anaesthetists - Coordinator and Admin
router.get('/', authorize('coordinator', 'admin'), getAnaesthetists);

// Get available anaesthetists - Coordinator and Admin
router.get('/available', authorize('coordinator', 'admin'), getAvailableAnaesthetists);

// Get anaesthetist by ID - Coordinator and Admin
router.get('/:id', authorize('coordinator', 'admin'), getAnaesthetistById);

// Create new anaesthetist - Admin only
router.post('/', authorize('admin'), createAnaesthetist);

// Update anaesthetist - Coordinator and Admin
router.put('/:id', authorize('coordinator', 'admin'), validateAnaesthetistUpdate, updateAnaesthetist);

// Delete (soft-delete) anaesthetist - Coordinator and Admin
router.delete('/:id', authorize('coordinator', 'admin'), deleteAnaesthetist);

// Update availability - Coordinator and Admin
router.put('/:id/availability', authorize('coordinator', 'admin'), updateAvailability);

export default router;
