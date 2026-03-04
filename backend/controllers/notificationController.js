// ============================================================================
// Notification Controller
// ============================================================================
// Created by: M4 (Oneli) - Day 16
//
// Endpoints:
// - POST  /api/notifications           (Create notification)
// - GET   /api/notifications           (Get current user's notifications)
// - GET   /api/notifications/unread-count (Get unread count)
//
// Cron helper:
// - checkSurgeryReminders()  – creates reminder notifications 15 min before
// ============================================================================

import { pool } from '../config/database.js';

// ============================================================================
// POST /api/notifications - Create a notification
// ============================================================================
export const createNotification = async (req, res) => {
    try {
        const { user_id, surgery_id, type, title, message } = req.body;

        // Validate required fields
        if (!user_id) {
            return res.status(400).json({ success: false, message: 'user_id is required' });
        }
        if (!title) {
            return res.status(400).json({ success: false, message: 'title is required' });
        }
        if (!message) {
            return res.status(400).json({ success: false, message: 'message is required' });
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

        const { rows } = await pool.query(
            `INSERT INTO notifications (user_id, surgery_id, type, title, message)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [user_id, surgery_id || null, notifType, title, message]
        );

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error creating notification:', error.message);
        res.status(500).json({ success: false, message: 'Server error creating notification' });
    }
};

// ============================================================================
// GET /api/notifications - Get current user's notifications (latest 50)
// ============================================================================
export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const { rows } = await pool.query(
            `SELECT * FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 50`,
            [userId]
        );

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching notifications' });
    }
};

// ============================================================================
// GET /api/notifications/unread-count - Get unread notification count
// ============================================================================
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const { rows } = await pool.query(
            `SELECT COUNT(*)::int AS count
             FROM notifications
             WHERE user_id = $1 AND is_read = false`,
            [userId]
        );

        res.status(200).json({
            success: true,
            count: rows[0].count
        });
    } catch (error) {
        console.error('Error fetching unread count:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching unread count' });
    }
};

// ============================================================================
// CRON HELPER: checkSurgeryReminders
// ============================================================================
// Queries surgeries scheduled within the next 15 minutes that are still
// in 'scheduled' status.  Creates a 'reminder' notification for the assigned
// surgeon (surgeon_id -> users table lookup) ONLY if a reminder has not
// already been sent for that surgery.
// ============================================================================
export const checkSurgeryReminders = async () => {
    try {
        // Find surgeries starting within the next 15 minutes
        // scheduled_date = TODAY  AND  scheduled_time between NOW and NOW+15min
        const { rows: upcomingSurgeries } = await pool.query(
            `SELECT s.id, s.surgery_type, s.scheduled_date, s.scheduled_time,
                    s.surgeon_id, s.patient_name, s.duration_minutes
             FROM surgeries s
             WHERE s.status = 'scheduled'
               AND s.scheduled_date = CURRENT_DATE
               AND s.scheduled_time BETWEEN LOCALTIME AND (LOCALTIME + INTERVAL '15 minutes')
               AND NOT EXISTS (
                   SELECT 1 FROM notifications n
                   WHERE n.surgery_id = s.id AND n.type = 'reminder'
               )`
        );

        if (upcomingSurgeries.length === 0) return;

        console.log(`🔔 Found ${upcomingSurgeries.length} surgery/surgeries starting within 15 min`);

        for (const surgery of upcomingSurgeries) {
            // Notify the assigned surgeon (if any)
            if (surgery.surgeon_id) {
                // Look up the user_id linked to this surgeon
                const { rows: surgeonRows } = await pool.query(
                    `SELECT user_id FROM surgeons WHERE id = $1`,
                    [surgery.surgeon_id]
                );

                const targetUserId = surgeonRows.length > 0 && surgeonRows[0].user_id
                    ? surgeonRows[0].user_id
                    : null;

                if (targetUserId) {
                    await pool.query(
                        `INSERT INTO notifications (user_id, surgery_id, type, title, message)
                         VALUES ($1, $2, 'reminder', $3, $4)`,
                        [
                            targetUserId,
                            surgery.id,
                            `Surgery Reminder: ${surgery.surgery_type}`,
                            `Surgery "${surgery.surgery_type}" for patient ${surgery.patient_name || 'N/A'} starts at ${surgery.scheduled_time}. Please prepare.`
                        ]
                    );
                    console.log(`  ✅ Reminder sent to surgeon (user ${targetUserId}) for surgery #${surgery.id}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Error checking surgery reminders:', error.message);
    }
};
