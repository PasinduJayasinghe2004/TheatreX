import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// User Management Routes - Protected with RBAC
// ============================================================================
// Updated by: M4 (Oneli) - Day 4
// All routes require authentication (protect middleware)
// User CRUD operations restricted to admin and coordinator roles
// ============================================================================

// Get all users - Admin and Coordinator only
router.get('/', protect, authorize('admin', 'coordinator'), getAllUsers);

// Get user by ID - Admin and Coordinator only
router.get('/:id', protect, authorize('admin', 'coordinator'), getUserById);

// Create new user - Admin only
router.post('/', protect, authorize('admin'), createUser);

// Update user - Admin only
router.put('/:id', protect, authorize('admin'), updateUser);

// Delete user - Admin only
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;

