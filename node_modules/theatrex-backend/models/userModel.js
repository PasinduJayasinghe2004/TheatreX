/**
 * User Model
 * 
 * Defines the database schema and initialization logic for the users table.
 * Handles table creation and ensures database structure is properly set up.
 * 
 * @module models/userModel
 * @requires config/database - PostgreSQL connection pool
 */

import { pool } from '../config/database.js';
import { createNursesTable } from './nurseModel.js';
import { createNotificationsTable } from './notificationModel.js';
import { createAnaesthetistsTable } from './anaesthetistModel.js';
import { createSurgeonsTable } from './surgeonModel.js';
import { createSurgeryNursesTable } from './surgeryNurseModel.js';
import { createSurgeriesTable } from './surgeryModel.js';
import { createTheatresTable } from './theatreModel.js';
import { createPatientsTable } from './patientModel.js';
import { createTechniciansTable } from './technicianModel.js';

/**
 * Create shared trigger function for auto-updating updated_at timestamps
 * This is used by all tables that have an updated_at column.
 * In PostgreSQL, ON UPDATE CURRENT_TIMESTAMP doesn't exist,
 * so we use a trigger function instead.
 */
const createUpdateTimestampFunction = async () => {
    const query = `
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    `;
    await pool.query(query);
};

/**
 * Create the users table in the database
 * 
 * @async
 * @function createUsersTable
 * @throws {Error} If table creation fails
 * 
 * Table Schema:
 * - id: Auto-incrementing primary key (SERIAL)
 * - name: User's full name (required)
 * - email: Unique email address for login (required, indexed)
 * - password: Hashed password (nullable for Clerk/OAuth users)
 * - role: User's role in the system (VARCHAR with CHECK constraint)
 * - phone: Contact phone number (optional)
 * - is_active: Account status flag (default: true)
 * - created_at: Timestamp of account creation
 * - updated_at: Timestamp of last update (auto-updates via trigger)
 */
const createUsersTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      -- Primary key: Auto-incrementing unique identifier
      id SERIAL PRIMARY KEY,
      
      -- User information fields
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255),
      
      -- Role-based access control
      -- Defines what permissions and features the user has access to
      role VARCHAR(50) DEFAULT 'coordinator'
        CHECK (role IN ('admin', 'coordinator', 'surgeon', 'nurse', 'anaesthetist', 'technician')),
      
      -- Optional contact information
      phone VARCHAR(20),
      
      -- Profile image URL/path
      profile_image VARCHAR(255),
      
      -- Account status: true = active, false = deactivated
      is_active BOOLEAN DEFAULT TRUE,
      
      -- Automatic timestamps for audit trail
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    // Create indexes separately (PostgreSQL doesn't support inline INDEX in CREATE TABLE)
    const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
    `;

    // Create trigger for auto-updating updated_at
    const createTrigger = `
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
            CREATE TRIGGER update_users_updated_at
                BEFORE UPDATE ON users
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END
    $$;
    `;

    try {
        await pool.query(createTableQuery);

        // Add profile_image column if it doesn't exist
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name='users' AND column_name='profile_image') THEN
                    ALTER TABLE users ADD COLUMN profile_image VARCHAR(255);
                END IF;
            END
            $$;
        `);

        // Add clerk_id column if it doesn't exist (for Clerk integration)
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name='users' AND column_name='clerk_id') THEN
                    ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255) UNIQUE;
                END IF;
            END
            $$;
        `);

        // Make password column nullable (for Clerk/OAuth users who have no local password)
        await pool.query(`
            ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
        `);

        await pool.query(createIndexes);
        await pool.query(createTrigger);
        console.log('✅ Users table created/verified successfully');
    } catch (error) {
        console.error('❌ Error creating users table:', error.message);
        throw error;
    }
};

/**
 * Initialize all database tables
 * 
 * This function is called during server startup to ensure all required
 * database tables exist.
 * 
 * @async
 * @function initializeTables
 * @throws {Error} If any table creation fails
 */
const initializeTables = async () => {
    try {
        // Create shared trigger function first
        await createUpdateTimestampFunction();
        // Create users table
        await createUsersTable();
        await createSurgeriesTable(); // M5 - Day 1
        await createTheatresTable();  // M6 - Day 1
        await createPatientsTable();  // pasindu - Day 2
        await createTechniciansTable(); // M6 - Day 2
        await createNursesTable();    // M4 - Day 2
        await createNotificationsTable(); // M5/M6 - Day 16
        await createAnaesthetistsTable(); // M5 - Day 2
        await createSurgeonsTable(); // Janani (M3) - Day 2
        await createSurgeryNursesTable(); // M2 - Day 9
        console.log('✅ All tables initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing tables:', error.message);
        throw error;
    }
};

// Export functions for use in server initialization
export { createUsersTable, initializeTables };
