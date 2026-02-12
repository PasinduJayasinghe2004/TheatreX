import { pool } from '../config/database.js';

/**
 * Theatre Model
 * Handles theatres table creation and management
 * Created by: M6 - Day 1
 * Updated: Migrated from MySQL to PostgreSQL
 */

// Create theatres table
const createTheatresTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS theatres (
      id SERIAL PRIMARY KEY,
      
      -- Theatre Information
      name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      
      -- Status and Capacity
      status VARCHAR(20) DEFAULT 'available'
        CHECK (status IN ('available', 'in_use', 'maintenance', 'cleaning')),
      capacity INT DEFAULT 10,
      
      -- Equipment and Facilities
      equipment TEXT,
      
      -- Theatre Type
      theatre_type VARCHAR(20) DEFAULT 'general'
        CHECK (theatre_type IN ('general', 'cardiac', 'neuro', 'ortho', 'emergency', 'day_surgery')),
      
      -- Availability
      is_active BOOLEAN DEFAULT TRUE,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_theatres_status ON theatres (status);
    CREATE INDEX IF NOT EXISTS idx_theatres_is_active ON theatres (is_active);
    CREATE INDEX IF NOT EXISTS idx_theatres_theatre_type ON theatres (theatre_type);
    `;

  const createTrigger = `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_theatres_updated_at') THEN
            CREATE TRIGGER update_theatres_updated_at
                BEFORE UPDATE ON theatres
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
    console.log('✅ Theatres table created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating theatres table:', error.message);
    throw error;
  }
};

export { createTheatresTable };
