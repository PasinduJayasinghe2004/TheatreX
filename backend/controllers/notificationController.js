import { Notification } from '../models/notificationModel.js';
import { pool } from '../config/database.js';

// Valid notification types (must stay in sync with DB CHECK constraint)
const VALID_TYPES = ['reminder', 'alert', 'info', 'warning', 'success'];

// Roles allowed to create notifications on behalf of users
const ADMIN_ROLES = ['admin', 'coordinator'];

/**
 * Create a new notification
 * @route POST /api/notifications
 * @access Private/Admin/Coordinator
 */
export const createNotification = async (req, res) => {
    try {
        // Only admins/coordinators may push notifications
        if (!ADMIN_ROLES.includes(req.user?.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only admins and coordinators can create notifications.'
            });
        }

        const { user_id, type, title, message, surgery_id } = req.body;

        // Required field validation
        if (!user_id || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'User ID, title, and message are required.'
            });
        }

        // Type validation
        if (type && !VALID_TYPES.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid notification type. Must be one of: ${VALID_TYPES.join(', ')}.`
            });
        }

        // Verify target user exists
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Target user not found.'
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
 * Get all notifications for the current user (with optional filters + pagination)
 * @route GET /api/notifications
 * @access Private
 * Supports: ?type=reminder|alert|info|warning|success
 *           ?is_read=true|false
 *           ?limit=20&offset=0
 */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = parseInt(req.query.offset) || 0;
        const type = req.query.type;
        const isRead = req.query.is_read; // 'true' | 'false' | undefined

        // Build dynamic WHERE clause
        const conditions = ['user_id = $1'];
        const values = [userId];
        let paramIdx = 2;

        if (type) {
            if (!VALID_TYPES.includes(type)) {
                return res.status(400).json({ success: false, message: `Invalid type filter.` });
            }
            conditions.push(`type = $${paramIdx++}`);
            values.push(type);
        }

        if (isRead !== undefined) {
            const boolVal = isRead === 'true' || isRead === '1';
            conditions.push(`is_read = $${paramIdx++}`);
            values.push(boolVal);
        }

        const whereClause = conditions.join(' AND ');

        // Count total (for pagination meta)
        const countRes = await pool.query(
            `SELECT COUNT(*) FROM notifications WHERE ${whereClause}`,
            values
        );
        const total = parseInt(countRes.rows[0].count);

        // Fetch paginated rows with surgery name join
        const query = `
            SELECT n.*, s.surgery_type AS surgery_name
            FROM notifications n
            LEFT JOIN surgeries s ON n.surgery_id = s.id
            WHERE ${whereClause}
            ORDER BY n.created_at DESC
            LIMIT $${paramIdx++} OFFSET $${paramIdx++}
        `;
        const { rows } = await pool.query(query, [...values, limit, offset]);

        res.status(200).json({
            success: true,
            data: rows,
            count: rows.length,    // M4 notificationController.test.js compatibility
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + limit < total
            }
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
 * Get unread count for current user
 * @route GET /api/notifications/unread-count
 * @access Private
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Notification.getUnreadCount(userId);

        res.status(200).json({
            success: true,
            // Dual response format to satisfy both M3 (data.unread_count) and M4 (count) tests
            data: {
                unread_count: count
            },
            count,           // M4 notificationController.test.js compatibility
            unreadCount: count // Dropdown component compatibility
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};
