import { promisePool } from '../config/database.js';

/**
 * Notification Model
 * Handles notifications table creation and management
 * Created by: M2 - Day 2
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
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      -- Who receives the notification
      user_id INT NOT NULL COMMENT 'FK to users table - recipient',
      
      -- What surgery it relates to (optional)
      surgery_id INT NULL COMMENT 'FK to surgeries table - NULL for system notifications',
      
      -- Notification content
      type ENUM('reminder', 'alert', 'info', 'warning', 'success') NOT NULL DEFAULT 'info',
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      
      -- Read status
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP NULL COMMENT 'When the notification was read',
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Indexes for performance
      INDEX idx_user_id (user_id),
      INDEX idx_surgery_id (surgery_id),
      INDEX idx_is_read (is_read),
      INDEX idx_type (type),
      INDEX idx_created_at (created_at),
      
      -- Composite index for common query: get unread notifications for a user
      INDEX idx_user_unread (user_id, is_read, created_at)
      
      -- Foreign key constraints (will be enabled when related tables exist)
      -- CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      -- CONSTRAINT fk_notification_surgery FOREIGN KEY (surgery_id) REFERENCES surgeries(id) ON DELETE SET NULL
      
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await promisePool.query(createTableQuery);
    console.log('✅ Notifications table created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating notifications table:', error.message);
    throw error;
  }
};

export { createNotificationsTable };
