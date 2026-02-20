import { pool } from '../config/database.js';

/**
 * Surgery Model
 * Handles surgeries table creation and management
 * Created by: M5 - Day 1
 * Updated: Migrated from MySQL to PostgreSQL
 */

// Create surgeries table
const createSurgeriesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS surgeries (
      id SERIAL PRIMARY KEY,
      
      -- Patient Information
      -- Either patient_id (for registered patients) OR manual entry fields must be provided
      patient_id INT NULL,
      patient_name VARCHAR(255) NULL,
      patient_age INT NULL,
      patient_gender VARCHAR(10) NULL
        CHECK (patient_gender IN ('male', 'female', 'other')),
      
      -- Surgery Details
      surgery_type VARCHAR(255) NOT NULL,
      description TEXT,
      scheduled_date DATE NOT NULL,
      scheduled_time TIME NOT NULL,
      duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
      
      -- Resource Assignment (nullable until assigned)
      theatre_id INT NULL,
      surgeon_id INT NULL,
      anaesthetist_id INT NULL,
      
      -- Status and Priority
      status VARCHAR(20) DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
      priority VARCHAR(20) DEFAULT 'routine'
        CHECK (priority IN ('routine', 'urgent', 'emergency')),
      
      -- Additional Information
      notes TEXT,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Patient data validation: Either patient_id OR manual fields must be provided
      CONSTRAINT chk_patient_data CHECK (
        (patient_id IS NOT NULL) OR 
        (patient_name IS NOT NULL AND patient_age IS NOT NULL AND patient_gender IS NOT NULL)
      )
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_surgeries_scheduled_date ON surgeries (scheduled_date);
    CREATE INDEX IF NOT EXISTS idx_surgeries_status ON surgeries (status);
    CREATE INDEX IF NOT EXISTS idx_surgeries_priority ON surgeries (priority);
    CREATE INDEX IF NOT EXISTS idx_surgeries_theatre_id ON surgeries (theatre_id);
    CREATE INDEX IF NOT EXISTS idx_surgeries_surgeon_id ON surgeries (surgeon_id);
    CREATE INDEX IF NOT EXISTS idx_surgeries_patient_id ON surgeries (patient_id);
    CREATE INDEX IF NOT EXISTS idx_surgeries_anaesthetist_id ON surgeries (anaesthetist_id);
  `;

  // Add anaesthetist_id column if it doesn't exist (M3 - Day 9)
  const addAnaesthetistColumn = `
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'surgeries' AND column_name = 'anaesthetist_id'
        ) THEN
            ALTER TABLE surgeries ADD COLUMN anaesthetist_id INT NULL;
            CREATE INDEX IF NOT EXISTS idx_surgeries_anaesthetist_id ON surgeries (anaesthetist_id);
        END IF;
    END
    $$;
  `;

  const createTrigger = `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_surgeries_updated_at') THEN
            CREATE TRIGGER update_surgeries_updated_at
                BEFORE UPDATE ON surgeries
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END
    $$;
  `;

  try {
    await pool.query(createTableQuery);
    await pool.query(createIndexes);
    await pool.query(addAnaesthetistColumn); // M3 - Day 9
    await pool.query(createTrigger);
    console.log('✅ Surgeries table created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating surgeries table:', error.message);
    throw error;
  }
};

export { createSurgeriesTable };
