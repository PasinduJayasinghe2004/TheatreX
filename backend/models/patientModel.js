// Import database connection pool for executing SQL queries
import { promisePool } from '../config/database.js';

/**
 
 
 * Store comprehensive patient information including:
 * - Personal details (name, age, gender, blood type)
 * - Contact information (phone, email, address)
 * - Emergency contacts
 * - Medical history and current medications
 * 
 * Created by: Pasindu - Day 2
 * 
 * WHY WE NEED THIS:
 * -----------------
 * Patients are the core of the TheatreX system. We need to store their
 * information to:
 * 1. Schedule surgeries for them
 * 2. Track their medical history
 * 3. Contact them or their emergency contacts
 * 4. Ensure medical staff have all necessary information
 */


// FUNCTION: Create Patients Table

// This is an async function (runs asynchronously, doesn't block other code)
// It creates the patients table in the database if it doesn't exist
const createPatientsTable = async () => {
  // SQL Query: This is the command that tells MySQL how to create the table
  // Template literal (backticks) allows multi-line strings
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS patients (
      -- PRIMARY KEY: Unique identifier for each patient
      -- AUTO_INCREMENT: MySQL automatically assigns next number (1, 2, 3, etc.)
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      -- ==========================================
      -- PERSONAL INFORMATION SECTION
      -- ==========================================
      -- These fields store basic patient details
      
      -- VARCHAR(255): Variable-length string, max 255 characters
      -- NOT NULL: This field is required, cannot be empty
      name VARCHAR(255) NOT NULL,
      
      -- DATE: Stores date in YYYY-MM-DD format (e.g., 1990-05-15)
      date_of_birth DATE NOT NULL,
      
      -- INT NULL: Integer that can be empty (NULL)
      -- We store age separately because it's frequently used in queries
      -- Could be calculated from DOB, but storing it improves performance
      age INT NULL COMMENT 'Age in years (can be calculated from DOB)',
      
      -- ENUM: Field can only have one of the listed values
      -- Ensures data consistency (prevents typos like 'mal' or 'femal')
      gender ENUM('male', 'female', 'other') NOT NULL,
      
      -- Blood type is optional (NULL) because not all patients may know it
      -- ENUM ensures only valid blood types can be entered
      blood_type ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
      
      -- ==========================================
      -- CONTACT INFORMATION SECTION
      -- ==========================================
      -- How to reach the patient
      
      -- Phone is required for contacting patient about appointments
      phone VARCHAR(20) NOT NULL,
      
      -- Email is optional (some patients may not have email)
      email VARCHAR(255) NULL,
      
      -- TEXT: Can store large amounts of text (up to 65,535 characters)
      -- Used for address because it can be long and vary in format
      address TEXT,
      
      -- ==========================================
      -- EMERGENCY CONTACT SECTION
      -- ==========================================
      -- Critical information in case of emergency during surgery
      
      emergency_contact_name VARCHAR(255),
      emergency_contact_phone VARCHAR(20),
      emergency_contact_relationship VARCHAR(100), -- e.g., "Spouse", "Parent", "Sibling"
      
      -- ==========================================
      -- MEDICAL INFORMATION SECTION
      -- ==========================================
      -- Critical for surgical planning and patient safety
      
      -- TEXT fields can store detailed information
      -- COMMENT: Explains what should be stored in this field
      medical_history TEXT COMMENT 'Previous medical conditions, surgeries, etc.',
      allergies TEXT COMMENT 'Known allergies (medications, food, etc.)',
      current_medications TEXT COMMENT 'Current medications being taken',
      
      -- ==========================================
      -- STATUS SECTION
      -- ==========================================
      -- Track if patient record is active or archived
      
      -- BOOLEAN: true or false (1 or 0 in MySQL)
      -- DEFAULT true: New patients are active by default
      is_active BOOLEAN DEFAULT true,
      
      -- ==========================================
      -- TIMESTAMP SECTION
      -- ==========================================
      -- Automatic tracking of when records are created/updated
      
      -- CURRENT_TIMESTAMP: MySQL automatically sets to current date/time
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- ON UPDATE CURRENT_TIMESTAMP: Automatically updates when record changes
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      -- ==========================================
      -- INDEXES FOR PERFORMANCE
      -- ==========================================
      -- Indexes make searching faster (like an index in a book)
      -- Without indexes, MySQL has to scan every row to find data
      -- With indexes, MySQL can quickly jump to the right rows
      
      -- INDEX idx_name: Speeds up searches by patient name
      -- Example: SELECT * FROM patients WHERE name LIKE 'John%'
      INDEX idx_name (name),
      
      -- INDEX idx_phone: Speeds up searches by phone number
      -- Example: SELECT * FROM patients WHERE phone = '555-1234'
      INDEX idx_phone (phone),
      
      -- INDEX idx_email: Speeds up searches by email
      INDEX idx_email (email),
      
      -- INDEX idx_is_active: Speeds up filtering active/inactive patients
      -- Example: SELECT * FROM patients WHERE is_active = true
      INDEX idx_is_active (is_active),
      
      -- INDEX idx_date_of_birth: Speeds up age-based queries
      -- Example: SELECT * FROM patients WHERE date_of_birth > '2000-01-01'
      INDEX idx_date_of_birth (date_of_birth)
      
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  // ENGINE=InnoDB: MySQL storage engine (supports transactions, foreign keys)
  // CHARSET=utf8mb4: Supports all Unicode characters (including emojis)
  // COLLATE=utf8mb4_unicode_ci: Case-insensitive sorting and comparison


  try {
    // TRY block: Attempt to run the query
    // await: Wait for the query to complete before continuing
    // promisePool.query(): Executes the SQL query on the database
    await promisePool.query(createTableQuery);

    // If successful, log success message with green checkmark
    console.log('✅ Patients table created/verified successfully');

  } catch (error) {
    // CATCH block: Runs if there's an error
    // Logs the error message to help with debugging
    console.error('❌ Error creating patients table:', error.message);

    // throw error: Re-throw the error so calling code knows something went wrong
    // This stops the application if table creation fails (critical error)
    throw error;
  }
};


// Makes this function available to other files
// Other files can import it like: import { createPatientsTable } from './patientModel.js'
export { createPatientsTable };
