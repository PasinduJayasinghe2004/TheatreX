import { promisePool } from '../config/database.js';

/**
 * Anaesthetist Model
 * Handles anaesthetists table creation and management
 * Created by: M5 - Day 2
 */

// Create anaesthetists table
const createAnaesthetistsTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS anaesthetists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      -- Personal Information
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20),
      
      -- Professional Details
      specialization VARCHAR(255) COMMENT 'e.g., Cardiac, Pediatric, Neuro, General, Regional, Obstetric',
      license_number VARCHAR(100) COMMENT 'Professional license/certification number',
      years_of_experience INT DEFAULT 0,
      qualification VARCHAR(255) COMMENT 'Medical qualification details',
      
      -- Availability
      is_available BOOLEAN DEFAULT true COMMENT 'Currently available for assignment',
      shift_preference ENUM('morning', 'afternoon', 'night', 'flexible') DEFAULT 'flexible',
      
      -- Status
      is_active BOOLEAN DEFAULT true COMMENT 'Active employee status',
      
      -- Profile
      profile_picture VARCHAR(500) COMMENT 'URL/path to profile picture',
      notes TEXT COMMENT 'Additional notes about the anaesthetist',
      
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
        console.log('✅ Anaesthetists table created/verified successfully');
    } catch (error) {
        console.error('❌ Error creating anaesthetists table:', error.message);
        throw error;
    }
};

// Get all anaesthetists
const getAllAnaesthetists = async () => {
    try {
        const [rows] = await promisePool.query(
            'SELECT * FROM anaesthetists WHERE is_active = true ORDER BY name ASC'
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
        const [rows] = await promisePool.query(
            'SELECT * FROM anaesthetists WHERE is_active = true AND is_available = true ORDER BY name ASC'
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
        const [rows] = await promisePool.query(
            'SELECT * FROM anaesthetists WHERE id = ?',
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
        const [result] = await promisePool.query(
            `INSERT INTO anaesthetists (name, email, phone, specialization, license_number, years_of_experience, qualification, shift_preference)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone, specialization, license_number, years_of_experience || 0, qualification, shift_preference || 'flexible']
        );
        return { id: result.insertId, ...anaesthetistData };
    } catch (error) {
        console.error('❌ Error creating anaesthetist:', error.message);
        throw error;
    }
};

// Update anaesthetist availability
const updateAnaesthetistAvailability = async (id, isAvailable) => {
    try {
        const [result] = await promisePool.query(
            'UPDATE anaesthetists SET is_available = ? WHERE id = ?',
            [isAvailable, id]
        );
        return result.affectedRows > 0;
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
