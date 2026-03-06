// ============================================================================
// Notification Routes
// ============================================================================
// Created by: M4 (Oneli) - Day 16
// Updated by: M1 (Pasindu) - Day 17 (mark read, mark all read)
//
// Routes:
// - POST  /api/notifications              (coordinator/admin only)
// - GET   /api/notifications              (any authenticated user)
// - GET   /api/notifications/unread-count  (any authenticated user)
// - PUT   /api/notifications/read-all      (any authenticated user)
// - PUT   /api/notifications/:id/read      (any authenticated user)
// ============================================================================

import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    createNotification,
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController.js';

const router = Router();

// GET must come before any /:id style routes
router.get('/unread-count', protect, getUnreadCount);
router.get('/', protect, getMyNotifications);

// Mark read (PUT routes – static path first)
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

// Only coordinators/admins can manually create notifications
router.post('/', protect, authorize('coordinator', 'admin'), createNotification);

export default router;
