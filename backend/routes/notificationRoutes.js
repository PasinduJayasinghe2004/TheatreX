// ============================================================================
// Notification Routes
// ============================================================================
// Created by: M3 (Janani) - Day 16
//
// ROUTES:
// - GET  /api/notifications              - Get user's notifications (Protected)
// - GET  /api/notifications/unread-count  - Get unread count (Protected)
// - POST /api/notifications              - Create notification (Coordinator/Admin)
// ============================================================================

import express from 'express';
import {
    getUserNotifications,
    getUnreadCount,
    createNotification
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// ROUTE: GET /api/notifications/unread-count
// ============================================================================
// Get unread notification count for the logged-in user
// Protected - any authenticated user
// NOTE: Must come before /:id routes to avoid param matching
// ============================================================================
router.get('/unread-count', protect, getUnreadCount);

// ============================================================================
// ROUTE: GET /api/notifications
// ============================================================================
// List notifications for the logged-in user
// Supports ?type=, ?is_read=, ?limit=, ?offset= filters
// Protected - any authenticated user
// ============================================================================
router.get('/', protect, getUserNotifications);

// ============================================================================
// ROUTE: POST /api/notifications
// ============================================================================
// Create a new notification
// Protected + coordinator or admin only
// ============================================================================
router.post('/', protect, authorize('coordinator', 'admin'), createNotification);

export default router;
