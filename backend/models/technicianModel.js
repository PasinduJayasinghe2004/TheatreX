import { promisePool } from '../config/database.js';

/**
 * Technician Model
 * Handles technicians table creation and management
 * Created by: M6 (Dinil) - Day 2
 */

// Create technicians table
const createTechniciansTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS technicians (
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      -- Personal Information
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20),
      
      -- Professional Details
      specialization VARCHAR(255) COMMENT 'e.g., Surgical Tech, Anesthesia Tech, Radiology Tech',
      license_number VARCHAR(100) COMMENT 'Professional license/certification number',
      years_of_experience INT DEFAULT 0,
      
      -- Availability
      is_available BOOLEAN DEFAULT true COMMENT 'Currently available for assignment',
      shift_preference ENUM('morning', 'afternoon', 'night', 'flexible') DEFAULT 'flexible',
      
      -- Status
      is_active BOOLEAN DEFAULT true COMMENT 'Active employee status',
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      -- Indexes for performance
      INDEX idx_email (email),
      INDEX idx_is_available (is_available),
      INDEX idx_is_active (is_active),
      INDEX idx_specialization (specialization)
      
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

    try {
        await promisePool.query(createTableQuery);
        console.log('✅ Technicians table created/verified successfully');
    } catch (error) {
        console.error('❌ Error creating technicians table:', error.message);
        throw error;
    }
};

export { createTechniciansTable };
