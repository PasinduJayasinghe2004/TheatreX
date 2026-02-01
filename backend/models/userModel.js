/**
 * User Model
 * 
 * Defines the database schema and initialization logic for the users table.
 * Handles table creation and ensures database structure is properly set up.
 * 
 * @module models/userModel
 * @requires config/database - MySQL connection pool
 */

import { promisePool } from '../config/database.js';

/**
 * Create the users table in the database
 * 
 * This function creates the users table if it doesn't already exist.
 * The table stores all user information for the TheatreX system.
 * 
 * @async
 * @function createUsersTable
 * @throws {Error} If table creation fails
 * 
 * Table Schema:
 * - id: Auto-incrementing primary key
 * - name: User's full name (required)
 * - email: Unique email address for login (required, indexed)
 * - password: Hashed password (required, will use bcrypt in Day 3)
 * - role: User's role in the system (ENUM with 6 possible values)
 * - phone: Contact phone number (optional)
 * - is_active: Account status flag (default: true)
 * - created_at: Timestamp of account creation
 * - updated_at: Timestamp of last update (auto-updates)
 * 
 * Indexes:
 * - idx_email: Speeds up login queries by email
 * - idx_role: Speeds up role-based filtering queries
 */
const createUsersTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      -- Primary key: Auto-incrementing unique identifier
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      -- User information fields
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      
      -- Role-based access control
      -- Defines what permissions and features the user has access to
      role ENUM('admin', 'coordinator', 'surgeon', 'nurse', 'anaesthetist', 'technician') DEFAULT 'coordinator',
      
      -- Optional contact information
      phone VARCHAR(20),
      
      -- Account status: true = active, false = deactivated
      is_active BOOLEAN DEFAULT true,
      
      -- Automatic timestamps for audit trail
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      -- Performance indexes for frequently queried columns
      INDEX idx_email (email),
      INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

    try {
        // Execute the CREATE TABLE query
        // IF NOT EXISTS prevents errors if table already exists
        await promisePool.query(createTableQuery);
        console.log('✅ Users table created/verified successfully');
    } catch (error) {
        // Log error and re-throw to stop server startup if table creation fails
        console.error('❌ Error creating users table:', error.message);
        throw error;
    }
};

/**
 * Initialize all database tables
 * 
 * This function is called during server startup to ensure all required
 * database tables exist. Currently only creates the users table, but will
 * be expanded by other team members to include:
 * - Theatres table
 * - Surgeries/Operations table
 * - Schedules table
 * - Equipment table
 * - And other domain-specific tables
 * 
 * @async
 * @function initializeTables
 * @throws {Error} If any table creation fails
 */
const initializeTables = async () => {
    try {
        // Create users table
        await createUsersTable();

        // TODO: Add other table creation functions here as they are developed
        // await createTheatresTable();
        // await createSurgeriesTable();
        // await createSchedulesTable();

        console.log('✅ All tables initialized successfully');
    } catch (error) {
        // If initialization fails, log error and re-throw
        // This will cause the server to exit (handled in server.js)
        console.error('❌ Error initializing tables:', error.message);
        throw error;
    }
};

// Export functions for use in server initialization
export { createUsersTable, initializeTables };
