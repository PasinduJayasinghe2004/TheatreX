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

export { createNotificationsTable };
