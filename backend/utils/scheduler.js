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
        // Multi-stage reminders: 60 minutes and 15 minutes before surgery
        const intervals = [
            { minutes: 60, label: '1 hour' },
            { minutes: 15, label: '15 minutes' }
        ];

        for (const interval of intervals) {
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
                    ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo') + INTERVAL '${interval.minutes - 1} minutes') AND 
                    ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo') + INTERVAL '${interval.minutes + 1} minutes')
            `;

            const { rows: surgeries } = await pool.query(query);

            if (surgeries.length === 0) continue;

            for (const surgery of surgeries) {
                const patientDisplay = surgery.patient_name || surgery.manual_patient_name || 'Unknown Patient';
                const reminderTitle = `Surgery Reminder: ${interval.label} to go`;
                const reminderMessage = `Important: ${surgery.surgery_type} for ${patientDisplay} starts in ${interval.label} at ${surgery.scheduled_time}.`;

                const userIdsToNotify = new Set();
                if (surgery.surgeon_user_id) userIdsToNotify.add(surgery.surgeon_user_id);
                if (surgery.anaesthetist_user_id) userIdsToNotify.add(surgery.anaesthetist_user_id);

                const nurseQuery = `
                    SELECT u.id as user_id 
                    FROM surgery_nurses sn
                    JOIN nurses n ON sn.nurse_id = n.id
                    JOIN users u ON n.email = u.email
                    WHERE sn.surgery_id = $1
                `;
                const { rows: nurses } = await pool.query(nurseQuery, [surgery.surgery_id]);
                nurses.forEach(n => { if (n.user_id) userIdsToNotify.add(n.user_id); });

                for (const userId of userIdsToNotify) {
                    const checkQuery = `
                        SELECT id FROM notifications 
                        WHERE user_id = $1 AND surgery_id = $2 AND type = 'reminder' AND title = $3
                    `;
                    const { rows: existing } = await pool.query(checkQuery, [userId, surgery.surgery_id, reminderTitle]);

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
