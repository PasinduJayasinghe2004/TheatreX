/**
 * Inquiry Model
 * 
 * Handles demo requests and inquiries from the landing page.
 * 
 * @module models/inquiryModel
 */

import { pool } from '../config/database.js';

/**
 * Create the inquiries table in the database
 * 
 * @async
 * @function createInquiriesTable
 */
const createInquiriesTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS inquiries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      organization VARCHAR(255),
      role VARCHAR(100),
      phone VARCHAR(50),
      message TEXT,
      status VARCHAR(50) DEFAULT 'new', -- e.g., 'new', 'contacted', 'closed'
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    try {
        await pool.query(query);
        console.log('✅ Inquiries table verified');
    } catch (error) {
        console.error('❌ Error creating inquiries table:', error.message);
    }
};

export { createInquiriesTable };
