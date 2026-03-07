import { pool } from '../config/database.js';
import { Notification } from '../models/notificationModel.js';

/**
 * Scheduler Utility
 * Handles periodic tasks like surgery reminders
 * Created by: M5 - Day 16
 */

/**
 * Check for surgeries starting in 15 minutes and send reminders to staff
 * This function is designed to be called by a cron job every minute
 */
export const checkSurgeryReminders = async () => {
    try {
        // Query surgeries starting exactly 15 minutes from now
        // We look for 'scheduled' surgeries where the gap is between 14.5 and 15.5 minutes
        // to ensure we catch them even if the cron job runs slightly off-time.
        const query = `
            SELECT 
                s.id as surgery_id,
                s.surgery_type,
                s.scheduled_date,
                s.scheduled_time,
                s.surgeon_id,
                s.anaesthetist_id,
                u_sur.id as surgeon_user_id,
                u_ana.id as anaesthetist_user_id,
                p.name as patient_name,
                s.patient_name as manual_patient_name
            FROM surgeries s
            LEFT JOIN surgeons sur ON s.surgeon_id = sur.id
            LEFT JOIN users u_sur ON sur.email = u_sur.email
            LEFT JOIN anaesthetists ana ON s.anaesthetist_id = ana.id
            LEFT JOIN users u_ana ON ana.email = u_ana.email
            LEFT JOIN patients p ON s.patient_id = p.id
            WHERE s.status = 'scheduled'
            AND (s.scheduled_date + s.scheduled_time) BETWEEN 
                ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo') + INTERVAL '14 minutes') AND 
                ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo') + INTERVAL '16 minutes')
        `;

        const { rows: surgeries } = await pool.query(query);

        if (surgeries.length === 0) return;

        console.log(`⏰ Found ${surgeries.length} surgeries starting in ~15 minutes. Sending reminders...`);

        for (const surgery of surgeries) {
            const patientDisplay = surgery.patient_name || surgery.manual_patient_name || 'Unknown Patient';
            const reminderTitle = 'Surgery Reminder';
            const reminderMessage = `Reminder: ${surgery.surgery_type} for ${patientDisplay} is scheduled to start in 15 minutes at ${surgery.scheduled_time}.`;

            // List of user IDs to notify
            const userIdsToNotify = new Set();
            if (surgery.surgeon_user_id) userIdsToNotify.add(surgery.surgeon_user_id);
            if (surgery.anaesthetist_user_id) userIdsToNotify.add(surgery.anaesthetist_user_id);

            // Fetch nurses too
            const nurseQuery = `
                SELECT u.id as user_id 
                FROM surgery_nurses sn
                JOIN nurses n ON sn.nurse_id = n.id
                JOIN users u ON n.email = u.email
                WHERE sn.surgery_id = $1
            `;
            const { rows: nurses } = await pool.query(nurseQuery, [surgery.surgery_id]);
            nurses.forEach(n => { if (n.user_id) userIdsToNotify.add(n.user_id); });

            // Create notification for each staff member
            for (const userId of userIdsToNotify) {
                // Check if reminder already sent for this surgery and user to prevent duplicates
                const checkQuery = `
                    SELECT id FROM notifications 
                    WHERE user_id = $1 AND surgery_id = $2 AND type = 'reminder'
                `;
                const { rows: existing } = await pool.query(checkQuery, [userId, surgery.surgery_id]);

                if (existing.length === 0) {
                    await Notification.create({
                        user_id: userId,
                        type: 'reminder',
                        title: reminderTitle,
                        message: reminderMessage,
                        surgery_id: surgery.surgery_id
                    });
                }
            }
        }
    } catch (error) {
        console.error('❌ Error in checkSurgeryReminders scheduler:', error.message);
    }
};

/**
 * Clear notifications that are read and older than 30 days
 * This helps keep the database clean
 */
export const clearOldNotifications = async () => {
    try {
        const query = `
            DELETE FROM notifications 
            WHERE is_read = TRUE 
            AND created_at < (CURRENT_TIMESTAMP - INTERVAL '30 days')
        `;
        const { rowCount } = await pool.query(query);
        if (rowCount > 0) {
            console.log(`🧹 Cleaned up ${rowCount} old notifications`);
        }
    } catch (error) {
        console.error('❌ Error in clearOldNotifications scheduler:', error.message);
    }
};
