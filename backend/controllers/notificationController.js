// ============================================================================
// Notification Controller
// ============================================================================
// Created by: M3 (Janani) - Day 16
//
// Handles notification-related HTTP requests including:
// - Listing notifications for the logged-in user (with filters)
// - Getting unread notification count
// - Creating a notification (for internal/system use)
//
// EXPORTS:
// - getUserNotifications:   GET  /api/notifications           - User's notifications
// - getUnreadCount:         GET  /api/notifications/unread-count - Unread count
// - createNotification:     POST /api/notifications           - Create notification
// ============================================================================

import { pool } from '../config/database.js';

// ============================================================================
// GET USER NOTIFICATIONS
// ============================================================================
// @desc    Get all notifications for the authenticated user
//          Supports filters:
//          - ?type=reminder|alert|info|warning|success
//          - ?is_read=true|false
//          - ?limit=20 (default 50)
//          - ?offset=0
// @route   GET /api/notifications
// @access  Protected
// ============================================================================
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, is_read, limit = 50, offset = 0 } = req.query;

        const conditions = ['n.user_id = $1'];
        const params = [userId];

        if (type) {
            params.push(type);
            conditions.push(`n.type = $${params.length}`);
        }

        if (is_read !== undefined) {
            const readBool = is_read === 'true';
            params.push(readBool);
            conditions.push(`n.is_read = $${params.length}`);
        }

        const whereClause = conditions.join(' AND ');

        // Parse limit & offset safely
        const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
        const safeOffset = Math.max(parseInt(offset) || 0, 0);

        params.push(safeLimit);
        const limitParam = params.length;
        params.push(safeOffset);
        const offsetParam = params.length;

        const { rows } = await pool.query(`
            SELECT
                n.id,
                n.user_id,
                n.surgery_id,
                n.type,
                n.title,
                n.message,
                n.is_read,
                n.read_at,
                n.created_at,
                s.surgery_name
            FROM notifications n
            LEFT JOIN surgeries s ON n.surgery_id = s.id
            WHERE ${whereClause}
            ORDER BY n.created_at DESC
            LIMIT $${limitParam} OFFSET $${offsetParam}
        `, params);

        // Also get total count for pagination
        const countParams = params.slice(0, -2); // Remove limit/offset
        const { rows: countRows } = await pool.query(`
            SELECT COUNT(*) AS total
            FROM notifications n
            WHERE ${whereClause}
        `, countParams);

        const total = parseInt(countRows[0].total);

        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total,
                limit: safeLimit,
                offset: safeOffset,
                hasMore: safeOffset + safeLimit < total
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

// ============================================================================
// GET UNREAD COUNT
// ============================================================================
// @desc    Get the count of unread notifications for the authenticated user
// @route   GET /api/notifications/unread-count
// @access  Protected
// ============================================================================
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const { rows } = await pool.query(`
            SELECT COUNT(*) AS unread_count
            FROM notifications
            WHERE user_id = $1 AND is_read = FALSE
        `, [userId]);

        res.status(200).json({
            success: true,
            data: {
                unread_count: parseInt(rows[0].unread_count)
            }
        });
    } catch (error) {
        console.error('Error fetching unread count:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
            error: error.message
        });
    }
};

// ============================================================================
// CREATE NOTIFICATION
// ============================================================================
// @desc    Create a new notification (admin/coordinator or system use)
// @route   POST /api/notifications
// @access  Protected - coordinator/admin only
// ============================================================================
export const createNotification = async (req, res) => {
    try {
        const { user_id, surgery_id, type, title, message } = req.body;

        // Validate required fields
        if (!user_id || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'user_id, title, and message are required'
            });
        }

        // Validate type if provided
        const validTypes = ['reminder', 'alert', 'info', 'warning', 'success'];
        const notifType = type || 'info';
        if (!validTypes.includes(notifType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        // Verify user exists
        const { rows: userRows } = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [user_id]
        );
        if (userRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
        }

        // Verify surgery exists if provided
        if (surgery_id) {
            const { rows: surgeryRows } = await pool.query(
                'SELECT id FROM surgeries WHERE id = $1',
                [surgery_id]
            );
            if (surgeryRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Surgery not found'
                });
            }
        }

        const { rows } = await pool.query(`
            INSERT INTO notifications (user_id, surgery_id, type, title, message)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [user_id, surgery_id || null, notifType, title, message]);

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error creating notification:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: error.message
        });
    }
};
