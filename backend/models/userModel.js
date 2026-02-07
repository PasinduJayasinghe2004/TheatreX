import { promisePool } from '../config/database.js';
import { createSurgeriesTable } from './surgeryModel.js';

// Create users table
const createUsersTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'coordinator', 'surgeon', 'nurse', 'anaesthetist', 'technician') DEFAULT 'coordinator',
      phone VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

    try {
        await promisePool.query(createTableQuery);
        console.log('✅ Users table created/verified successfully');
    } catch (error) {
        console.error('❌ Error creating users table:', error.message);
        throw error;
    }
};

// Initialize all tables (will be expanded by other team members)
const initializeTables = async () => {
    try {
        await createUsersTable();
        await createSurgeriesTable(); // M5 - Day 1
        console.log('✅ All tables initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing tables:', error.message);
        throw error;
    }
};

export { createUsersTable, initializeTables };
