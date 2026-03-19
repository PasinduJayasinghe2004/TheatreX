import { pool } from '../config/database.js';

/**
 * Notification Model
 * Handles notifications table creation and management
 * Created by: M2 - Day 2
 * Updated: Migrated from MySQL to PostgreSQL
 * 
 * Used for:
 * - Surgery reminders (15 min before)
 * - Status change alerts
 * - System notifications
 */

// Create notifications table
const createNotificationsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      
      -- Who receives the notification
      user_id INT NOT NULL,
      
      -- What surgery it relates to (optional)
      surgery_id INT NULL,
      
      -- Notification content
      type VARCHAR(20) NOT NULL DEFAULT 'info'
        CHECK (type IN ('reminder', 'alert', 'info', 'warning', 'success')),
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      
      -- Read status
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP NULL,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_surgery_id ON notifications (surgery_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at);
  `;

  try {
    await pool.query(createTableQuery);
    await pool.query(createIndexes);
    console.log('✅ Notifications table created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating notifications table:', error.message);
    throw error;
  }
};

/**
 * Notification Model Class
 * Static methods to interact with the notifications table
 */
class Notification {
  /**
   * Create a new notification
   * @param {Object} data - Notification data (user_id, type, title, message, surgery_id)
   */
  static async create(data) {
    const { user_id, type, title, message, surgery_id } = data;
    const query = `
      INSERT INTO notifications (user_id, type, title, message, surgery_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [user_id, type || 'info', title, message, surgery_id || null];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  /**
   * Get all notifications for a user with pagination
   * @param {number} userId - ID of the user
   * @param {number} limit - Number of records to return
   * @param {number} offset - Number of records to skip
   */
  static async getAllForUser(userId, limit = 20, offset = 0) {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const { rows } = await pool.query(query, [userId, limit, offset]);
    return rows;
  }

  /**
   * Mark a notification as read
   * @param {number} id - Notification ID
   * @param {number} userId - User ID (to ensure ownership)
   */
  static async markAsRead(id, userId) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0];
  }

  /**
   * Mark all notifications for a user as read
   * @param {number} userId - User ID
   */
  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  /**
   * Get unread count for a user
   * @param {number} userId - User ID
   */
  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = $1 AND is_read = FALSE;
    `;
    const { rows } = await pool.query(query, [userId]);
    return parseInt(rows[0].count);
  }

  /**
   * Get notifications created after a given timestamp (for polling / delta updates)
   * @param {number} userId  - ID of the user
   * @param {string} since   - ISO-8601 timestamp (exclusive lower bound)
   * @param {number} limit   - Max rows to return
   * Created by: M3 (Janani) - Day 17
   */
  static async getNewSince(userId, since, limit = 50) {
    const query = `
      SELECT n.*, s.surgery_type AS surgery_name
      FROM notifications n
      LEFT JOIN surgeries s ON n.surgery_id = s.id
      WHERE n.user_id = $1 AND n.created_at > $2
      ORDER BY n.created_at DESC
      LIMIT $3;
    `;
    const { rows } = await pool.query(query, [userId, since, limit]);
    return rows;
  }
}

export { createNotificationsTable, Notification };
