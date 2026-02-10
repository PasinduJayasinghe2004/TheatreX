import { promisePool } from '../config/database.js';

/**
 * Theatre Model
 * Handles theatres table creation and management
 * Created by: M6 - Day 1
 */

// Create theatres table
const createTheatresTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS theatres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      -- Theatre Information
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255) COMMENT 'Building/floor location',
      
      -- Status and Capacity
      status ENUM('available', 'in_use', 'maintenance', 'cleaning') DEFAULT 'available',
      capacity INT DEFAULT 10 COMMENT 'Maximum staff capacity',
      
      -- Equipment and Facilities
      equipment TEXT COMMENT 'Available equipment (JSON or comma-separated)',
      
      -- Theatre Type
      theatre_type ENUM('general', 'cardiac', 'neuro', 'ortho', 'emergency', 'day_surgery') DEFAULT 'general',
      
      -- Availability
      is_active BOOLEAN DEFAULT true,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      -- Indexes for performance
      INDEX idx_status (status),
      INDEX idx_is_active (is_active),
      INDEX idx_theatre_type (theatre_type)
      
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

    try {
        await promisePool.query(createTableQuery);
        console.log('✅ Theatres table created/verified successfully');
    } catch (error) {
        console.error('❌ Error creating theatres table:', error.message);
        throw error;
    }
};

export { createTheatresTable };
