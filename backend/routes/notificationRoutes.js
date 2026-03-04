// ============================================================================
// Notification Routes
// ============================================================================
// Created by: M4 (Oneli) - Day 16
//
// Routes:
// - POST  /api/notifications           (coordinator/admin only)
// - GET   /api/notifications           (any authenticated user)
// - GET   /api/notifications/unread-count (any authenticated user)
// ============================================================================

import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    createNotification,
    getMyNotifications,
    getUnreadCount
} from '../controllers/notificationController.js';

const router = Router();

// GET must come before any /:id style routes
router.get('/unread-count', protect, getUnreadCount);
router.get('/', protect, getMyNotifications);

// Only coordinators/admins can manually create notifications
router.post('/', protect, authorize('coordinator', 'admin'), createNotification);

export default router;
