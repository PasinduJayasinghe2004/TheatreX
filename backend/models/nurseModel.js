import { pool } from '../config/database.js';

/**
 * Nurse Model
 * Handles nurses table creation and management
 * Created by: M4 (Oneli) - Day 2
 * Updated: Migrated from MySQL to PostgreSQL
 */

// Create nurses table
const createNursesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS nurses (
      id SERIAL PRIMARY KEY,
      
      -- Personal Information
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20),
      
      -- Professional Details
      specialization VARCHAR(255),
      license_number VARCHAR(100),
      years_of_experience INT DEFAULT 0,
      
      -- Availability
      is_available BOOLEAN DEFAULT TRUE,
      shift_preference VARCHAR(20) DEFAULT 'flexible'
        CHECK (shift_preference IN ('morning', 'afternoon', 'night', 'flexible')),
      
      -- Status
      is_active BOOLEAN DEFAULT TRUE,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_nurses_email ON nurses (email);
    CREATE INDEX IF NOT EXISTS idx_nurses_is_available ON nurses (is_available);
    CREATE INDEX IF NOT EXISTS idx_nurses_is_active ON nurses (is_active);
    CREATE INDEX IF NOT EXISTS idx_nurses_specialization ON nurses (specialization);
    `;

  const createTrigger = `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_nurses_updated_at') THEN
            CREATE TRIGGER update_nurses_updated_at
                BEFORE UPDATE ON nurses
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
    console.log('✅ Nurses table created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating nurses table:', error.message);
    throw error;
  }
};

export { createNursesTable };
