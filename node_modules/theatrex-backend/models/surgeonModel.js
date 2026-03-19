// Import database connection pool for executing SQL queries
import { pool } from '../config/database.js';

/**
 * SURGEONS TABLE MODEL
 * ====================
 * Store comprehensive surgeon information including:
 * - Personal details (name, contact information)
 * - Professional details (specialization, license number, experience)
 * - Availability status for surgery assignments
 * 
 * Created by: Janani (M3) - Day 2
 * Updated: Migrated from MySQL to PostgreSQL
 */

// FUNCTION: Create Surgeons Table
const createSurgeonsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS surgeons (
      -- PRIMARY KEY: Unique identifier for each surgeon
      id SERIAL PRIMARY KEY,
      
      -- PERSONAL INFORMATION
      name VARCHAR(255) NOT NULL,
      
      -- PROFESSIONAL INFORMATION
      specialization VARCHAR(255) NOT NULL,
      license_number VARCHAR(100) UNIQUE NOT NULL,
      years_of_experience INT NULL,
      
      -- CONTACT INFORMATION
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      
      -- AVAILABILITY
      is_available BOOLEAN DEFAULT TRUE,
      
      -- STATUS
      is_active BOOLEAN DEFAULT TRUE,
      
      -- PROFILE
      profile_picture VARCHAR(500),
      
      -- TIMESTAMPS
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_surgeons_name ON surgeons (name);
    CREATE INDEX IF NOT EXISTS idx_surgeons_specialization ON surgeons (specialization);
    CREATE INDEX IF NOT EXISTS idx_surgeons_is_available ON surgeons (is_available);
    CREATE INDEX IF NOT EXISTS idx_surgeons_is_active ON surgeons (is_active);
    CREATE INDEX IF NOT EXISTS idx_surgeons_available_active ON surgeons (is_available, is_active);
    `;

  const createTrigger = `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_surgeons_updated_at') THEN
            CREATE TRIGGER update_surgeons_updated_at
                BEFORE UPDATE ON surgeons
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END
    $$;
    `;

  try {
    await pool.query(createTableQuery);
    await pool.query(createIndexes);
    await pool.query(createTrigger);
    console.log('✅ Surgeons table created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating surgeons table:', error.message);
    throw error;
  }
};

export { createSurgeonsTable };
