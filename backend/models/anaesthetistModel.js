import { pool } from '../config/database.js';

/**
 * Anaesthetist Model
 * Handles anaesthetists table creation and management
 * Created by: M5 - Day 2
 * Updated: Migrated from MySQL to PostgreSQL
 */

// Create anaesthetists table
const createAnaesthetistsTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS anaesthetists (
      id SERIAL PRIMARY KEY,
      
      -- Personal Information
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20),
      
      -- Professional Details
      specialization VARCHAR(255),
      license_number VARCHAR(100),
      years_of_experience INT DEFAULT 0,
      qualification VARCHAR(255),
      
      -- Availability
      is_available BOOLEAN DEFAULT TRUE,
      shift_preference VARCHAR(20) DEFAULT 'flexible'
        CHECK (shift_preference IN ('morning', 'afternoon', 'night', 'flexible')),
      
      -- Status
      is_active BOOLEAN DEFAULT TRUE,
      
      -- Profile
      profile_picture VARCHAR(500),
      notes TEXT,
      
      -- Timestamps
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_anaesthetists_email ON anaesthetists (email);
    CREATE INDEX IF NOT EXISTS idx_anaesthetists_is_available ON anaesthetists (is_available);
    CREATE INDEX IF NOT EXISTS idx_anaesthetists_is_active ON anaesthetists (is_active);
    CREATE INDEX IF NOT EXISTS idx_anaesthetists_specialization ON anaesthetists (specialization);
    `;

    const createTrigger = `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_anaesthetists_updated_at') THEN
            CREATE TRIGGER update_anaesthetists_updated_at
                BEFORE UPDATE ON anaesthetists
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
        console.log('✅ Anaesthetists table created/verified successfully');
    } catch (error) {
        console.error('❌ Error creating anaesthetists table:', error.message);
        throw error;
    }
};

// Get all anaesthetists
const getAllAnaesthetists = async () => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM anaesthetists WHERE is_active = TRUE ORDER BY name ASC'
        );
        return rows;
    } catch (error) {
        console.error('❌ Error fetching anaesthetists:', error.message);
        throw error;
    }
};

// Get available anaesthetists (for surgery assignment)
const getAvailableAnaesthetists = async () => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM anaesthetists WHERE is_active = TRUE AND is_available = TRUE ORDER BY name ASC'
        );
        return rows;
    } catch (error) {
        console.error('❌ Error fetching available anaesthetists:', error.message);
        throw error;
    }
};

// Get anaesthetist by ID
const getAnaesthetistById = async (id) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM anaesthetists WHERE id = $1',
            [id]
        );
        return rows[0] || null;
    } catch (error) {
        console.error('❌ Error fetching anaesthetist:', error.message);
        throw error;
    }
};

// Create a new anaesthetist
const createAnaesthetist = async (anaesthetistData) => {
    const { name, email, phone, specialization, license_number, years_of_experience, qualification, shift_preference } = anaesthetistData;

    try {
        const { rows } = await pool.query(
            `INSERT INTO anaesthetists (name, email, phone, specialization, license_number, years_of_experience, qualification, shift_preference)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [name, email, phone, specialization, license_number, years_of_experience || 0, qualification, shift_preference || 'flexible']
        );
        return { id: rows[0].id, ...anaesthetistData };
    } catch (error) {
        console.error('❌ Error creating anaesthetist:', error.message);
        throw error;
    }
};

// Update anaesthetist availability
const updateAnaesthetistAvailability = async (id, isAvailable) => {
    try {
        const result = await pool.query(
            'UPDATE anaesthetists SET is_available = $1 WHERE id = $2',
            [isAvailable, id]
        );
        return result.rowCount > 0;
    } catch (error) {
        console.error('❌ Error updating anaesthetist availability:', error.message);
        throw error;
    }
};

export {
    createAnaesthetistsTable,
    getAllAnaesthetists,
    getAvailableAnaesthetists,
    getAnaesthetistById,
    createAnaesthetist,
    updateAnaesthetistAvailability
};
