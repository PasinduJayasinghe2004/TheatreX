import express from 'express';
import {
    createNotification,
    getNotifications,
    pollNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All notification routes are protected
router.use(protect);

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification
 * @access  Private (System/Admin)
 */
router.post('/', createNotification);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 */
router.get('/', getNotifications);

/**
 * @route   GET /api/notifications/poll
 * @desc    Poll for new notifications since a timestamp (lightweight delta endpoint)
 * @access  Private
 * Created by: M3 (Janani) - Day 17
 */
router.get('/poll', pollNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put('/:id/read', markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', markAllAsRead);

export default router;
