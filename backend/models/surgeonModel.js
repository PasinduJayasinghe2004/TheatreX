// Import database connection pool for executing SQL queries
import { promisePool } from '../config/database.js';

/**
 * SURGEONS TABLE MODEL
 * ====================
 * Store comprehensive surgeon information including:
 * - Personal details (name, contact information)
 * - Professional details (specialization, license number, experience)
 * - Availability status for surgery assignments
 * 
 * Created by: Janani (M3) - Day 2
 * 
 * WHY WE NEED THIS:
 * -----------------
 * Surgeons are critical to the TheatreX system. We need to store their
 * information to:
 * 1. Assign surgeons to surgeries based on specialization
 * 2. Check surgeon availability before scheduling
 * 3. Track surgeon credentials and experience
 * 4. Contact surgeons for emergency cases
 * 5. Maintain professional records for compliance
 */


// FUNCTION: Create Surgeons Table
// ================================
// This is an async function (runs asynchronously, doesn't block other code)
// It creates the surgeons table in the database if it doesn't exist
const createSurgeonsTable = async () => {
    // SQL Query: This is the command that tells MySQL how to create the table
    // Template literal (backticks) allows multi-line strings
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS surgeons (
      -- PRIMARY KEY: Unique identifier for each surgeon
      -- AUTO_INCREMENT: MySQL automatically assigns next number (1, 2, 3, etc.)
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      -- ==========================================
      -- PERSONAL INFORMATION SECTION
      -- ==========================================
      -- Basic surgeon identification details
      
      -- VARCHAR(255): Variable-length string, max 255 characters
      -- NOT NULL: This field is required, cannot be empty
      name VARCHAR(255) NOT NULL COMMENT 'Full name of the surgeon',
      
      -- ==========================================
      -- PROFESSIONAL INFORMATION SECTION
      -- ==========================================
      -- Critical professional credentials and expertise
      
      -- VARCHAR(255): Stores the surgeon's area of expertise
      -- NOT NULL: Required because we need to match surgeons to surgery types
      -- Examples: 'Cardiothoracic', 'Neurosurgery', 'Orthopedic', 'General Surgery'
      specialization VARCHAR(255) NOT NULL COMMENT 'Medical specialization (e.g., Cardiothoracic, Neurosurgery)',
      
      -- VARCHAR(100): Stores professional license/registration number
      -- UNIQUE: No two surgeons can have the same license number
      -- NOT NULL: Required for legal compliance and verification
      license_number VARCHAR(100) UNIQUE NOT NULL COMMENT 'Medical license/registration number',
      
      -- INT: Number of years practicing as a surgeon
      -- NULL: Optional because new surgeons might not have this recorded yet
      -- Used for: Assigning complex surgeries to experienced surgeons
      years_of_experience INT NULL COMMENT 'Years of surgical experience',
      
      -- ==========================================
      -- CONTACT INFORMATION SECTION
      -- ==========================================
      -- How to reach the surgeon for scheduling and emergencies
      
      -- VARCHAR(20): Phone number with country code
      -- NOT NULL: Required for emergency contact and scheduling
      phone VARCHAR(20) NOT NULL COMMENT 'Contact phone number',
      
      -- VARCHAR(255): Email address for official communication
      -- UNIQUE: Each surgeon must have unique email
      -- NOT NULL: Required for sending notifications and schedules
      email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Email address for notifications',
      
      -- ==========================================
      -- AVAILABILITY SECTION
      -- ==========================================
      -- Track if surgeon is available for assignment
      
      -- BOOLEAN: true (1) = available, false (0) = not available
      -- DEFAULT true: New surgeons are available by default
      -- Used for: Filtering available surgeons when scheduling surgeries
      -- Can be set to false if surgeon is on leave, in surgery, or unavailable
      is_available BOOLEAN DEFAULT true COMMENT 'Current availability status for surgery assignment',
      
      -- ==========================================
      -- STATUS SECTION
      -- ==========================================
      -- Track if surgeon record is active or archived
      
      -- BOOLEAN: true (1) = active, false (0) = inactive/archived
      -- DEFAULT true: New surgeon records are active by default
      -- Used for: Soft delete (keep records but mark as inactive)
      -- Inactive surgeons won't appear in assignment dropdowns
      is_active BOOLEAN DEFAULT true COMMENT 'Whether surgeon is currently employed/active',
      
      -- ==========================================
      -- TIMESTAMP SECTION
      -- ==========================================
      -- Automatic tracking of when records are created/updated
      
      -- CURRENT_TIMESTAMP: MySQL automatically sets to current date/time when record is created
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When surgeon record was created',
      
      -- ON UPDATE CURRENT_TIMESTAMP: Automatically updates when record changes
      -- Useful for tracking last modification time
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When surgeon record was last updated',
      
      -- ==========================================
      -- INDEXES FOR PERFORMANCE
      -- ==========================================
      -- Indexes make searching faster (like an index in a book)
      -- Without indexes, MySQL has to scan every row to find data
      -- With indexes, MySQL can quickly jump to the right rows
      
      -- INDEX idx_name: Speeds up searches by surgeon name
      -- Example query: SELECT * FROM surgeons WHERE name LIKE 'Dr. Smith%'
      INDEX idx_name (name),
      
      -- INDEX idx_specialization: Speeds up filtering by specialization
      -- Example query: SELECT * FROM surgeons WHERE specialization = 'Cardiothoracic'
      -- Very important for surgery assignment (finding surgeons with right expertise)
      INDEX idx_specialization (specialization),
      
      -- INDEX idx_is_available: Speeds up filtering available surgeons
      -- Example query: SELECT * FROM surgeons WHERE is_available = true
      -- Critical for real-time surgery scheduling
      INDEX idx_is_available (is_available),
      
      -- INDEX idx_is_active: Speeds up filtering active surgeons
      -- Example query: SELECT * FROM surgeons WHERE is_active = true
      -- Ensures inactive surgeons are quickly excluded from queries
      INDEX idx_is_active (is_active),
      
      -- COMPOSITE INDEX: Speeds up queries that filter by both availability AND active status
      -- Example query: SELECT * FROM surgeons WHERE is_available = true AND is_active = true
      -- This is the most common query when assigning surgeons to surgeries
      INDEX idx_available_active (is_available, is_active)
      
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
    // ENGINE=InnoDB: MySQL storage engine that supports:
    //   - Transactions (can rollback changes if something goes wrong)
    //   - Foreign keys (can link to other tables)
    //   - Row-level locking (better performance with concurrent users)
    // CHARSET=utf8mb4: Supports all Unicode characters including emojis and international names
    // COLLATE=utf8mb4_unicode_ci: Case-insensitive sorting and comparison


    try {
        // TRY block: Attempt to run the query
        // await: Wait for the query to complete before continuing
        // promisePool.query(): Executes the SQL query on the database
        await promisePool.query(createTableQuery);

        // If successful, log success message with green checkmark
        console.log('✅ Surgeons table created/verified successfully');

    } catch (error) {
        // CATCH block: Runs if there's an error
        // Logs the error message to help with debugging
        console.error('❌ Error creating surgeons table:', error.message);

        // throw error: Re-throw the error so calling code knows something went wrong
        // This stops the application if table creation fails (critical error)
        throw error;
    }
};


// Makes this function available to other files
// Other files can import it like: import { createSurgeonsTable } from './surgeonModel.js'
export { createSurgeonsTable };
