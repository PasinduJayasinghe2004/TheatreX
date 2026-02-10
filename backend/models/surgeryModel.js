import { promisePool } from '../config/database.js';

/**
 * Surgery Model
 * Handles surgeries table creation and management
 * Created by: M5 - Day 1
 * Updated: Refactored for better data integrity and validation
 */

// Create surgeries table
const createSurgeriesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS surgeries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      -- Patient Information
      -- Either patient_id (for registered patients) OR manual entry fields must be provided
      -- Constraint: If patient_id is NULL, then patient_name, patient_age, patient_gender must NOT be NULL
      patient_id INT NULL COMMENT 'FK to patients table - NULL for manual entry',
      patient_name VARCHAR(255) NULL COMMENT 'Required if patient_id is NULL',
      patient_age INT NULL COMMENT 'Required if patient_id is NULL',
      patient_gender ENUM('male', 'female', 'other') NULL COMMENT 'Required if patient_id is NULL',
      
      -- Surgery Details
      surgery_type VARCHAR(255) NOT NULL,
      description TEXT,
      scheduled_date DATE NOT NULL,
      scheduled_time TIME NOT NULL,
      duration_minutes INT NOT NULL CHECK (duration_minutes > 0) COMMENT 'Must be positive',
      
      -- Resource Assignment (nullable until assigned)
      theatre_id INT NULL COMMENT 'FK to theatres table (M6 task)',
      surgeon_id INT NULL COMMENT 'FK to surgeons table',
      
      -- Status and Priority
      -- Single source of truth: Use priority field to determine urgency
      -- 'emergency' priority implies urgent/emergency status
      status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
      priority ENUM('routine', 'urgent', 'emergency') DEFAULT 'routine' COMMENT 'Single source of truth for urgency',
      
      -- Additional Information
      notes TEXT,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      -- Indexes for performance
      INDEX idx_scheduled_date (scheduled_date),
      INDEX idx_status (status),
      INDEX idx_priority (priority),
      INDEX idx_theatre_id (theatre_id),
      INDEX idx_surgeon_id (surgeon_id),
      INDEX idx_patient_id (patient_id),
      
      -- Data integrity constraints
      -- Ensure duration is positive
      CONSTRAINT chk_duration_positive CHECK (duration_minutes > 0),
      
      -- Ensure scheduled_date is not in the past (optional - can be removed if historical data entry needed)
      -- CONSTRAINT chk_future_date CHECK (scheduled_date >= CURDATE()),
      
      -- Patient data validation: Either patient_id OR manual fields must be provided
      -- Note: MySQL doesn't support complex CHECK constraints well, so this will be enforced in application logic
      CONSTRAINT chk_patient_data CHECK (
        (patient_id IS NOT NULL) OR 
        (patient_name IS NOT NULL AND patient_age IS NOT NULL AND patient_gender IS NOT NULL)
      )
      
      -- Foreign key constraints (will be added when related tables exist)
      -- CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
      -- CONSTRAINT fk_theatre FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE SET NULL,
      -- CONSTRAINT fk_surgeon FOREIGN KEY (surgeon_id) REFERENCES surgeons(id) ON DELETE SET NULL
      
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await promisePool.query(createTableQuery);
    console.log('✅ Surgeries table created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating surgeries table:', error.message);
    throw error;
  }
};

export { createSurgeriesTable };
