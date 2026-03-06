import { Notification } from '../models/notificationModel.js';

/**
 * Create a new notification
 * @route POST /api/notifications
 * @access Private/Admin (depending on requirement, usually system or admin)
 */
export const createNotification = async (req, res) => {
    try {
        const { user_id, type, title, message, surgery_id } = req.body;

        if (!user_id || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'User ID, title, and message are required.'
            });
        }

        const notification = await Notification.create({
            user_id,
            type,
            title,
            message,
            surgery_id
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

/**
 * Get all notifications for the current user
 * @route GET /api/notifications
 * @access Private
 */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const notifications = await Notification.getAllForUser(userId, limit, offset);
        const unreadCount = await Notification.getUnreadCount(userId);

        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

/**
 * Mark a notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const notification = await Notification.markAsRead(notificationId, userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/read-all
 * @access Private
 */
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.markAllAsRead(userId);

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read.',
            count: notifications.length
        });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

/**
 * Get unread count
 * @route GET /api/notifications/unread-count
 * @access Private
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Notification.getUnreadCount(userId);

        res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};
