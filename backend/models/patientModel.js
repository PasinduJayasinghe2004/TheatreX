// Import database connection pool for executing SQL queries
import { pool } from '../config/database.js';

/**
 * Patient Model
 * 
 * Store comprehensive patient information including:
 * - Personal details (name, age, gender, blood type)
 * - Contact information (phone, email, address)
 * - Emergency contacts
 * - Medical history and current medications
 * 
 * Created by: Pasindu - Day 2
 * Updated: Migrated from MySQL to PostgreSQL
 */

// FUNCTION: Create Patients Table
const createPatientsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS patients (
      -- PRIMARY KEY: Unique identifier for each patient
      id SERIAL PRIMARY KEY,
      
      -- PERSONAL INFORMATION SECTION
      name VARCHAR(255) NOT NULL,
      date_of_birth DATE NOT NULL,
      age INT NULL,
      gender VARCHAR(10) NOT NULL
        CHECK (gender IN ('male', 'female', 'other')),
      blood_type VARCHAR(5) NULL
        CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
      
      -- CONTACT INFORMATION SECTION
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) NULL,
      address TEXT,
      
      -- EMERGENCY CONTACT SECTION
      emergency_contact_name VARCHAR(255),
      emergency_contact_phone VARCHAR(20),
      emergency_contact_relationship VARCHAR(100),
      
      -- MEDICAL INFORMATION SECTION
      medical_history TEXT,
      allergies TEXT,
      current_medications TEXT,
      
      -- STATUS SECTION
      is_active BOOLEAN DEFAULT TRUE,
      
      -- TIMESTAMP SECTION
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (name);
    CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients (phone);
    CREATE INDEX IF NOT EXISTS idx_patients_email ON patients (email);
    CREATE INDEX IF NOT EXISTS idx_patients_is_active ON patients (is_active);
    CREATE INDEX IF NOT EXISTS idx_patients_date_of_birth ON patients (date_of_birth);
  `;

  const createTrigger = `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_patients_updated_at') THEN
            CREATE TRIGGER update_patients_updated_at
                BEFORE UPDATE ON patients
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
    console.log('✅ Patients table created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating patients table:', error.message);
    throw error;
  }
};

export { createPatientsTable };
