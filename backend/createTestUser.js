import bcrypt from 'bcryptjs';
import { pool } from './config/database.js';

// Create a test user for login testing
const createTestUser = async () => {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Insert test user (PostgreSQL ON CONFLICT syntax)
        const { rows } = await pool.query(
            `INSERT INTO users (name, email, password, role, phone) 
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO UPDATE SET
             password = EXCLUDED.password,
             name = EXCLUDED.name
             RETURNING id`,
            [
                'Test User',
                'test@example.com',
                hashedPassword,
                'admin',
                '+1234567890'
            ]
        );

        console.log('✅ Test user created/updated successfully');
        console.log('📧 Email: test@example.com');
        console.log('🔑 Password: password123');
        console.log('👤 Role: admin');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test user:', error.message);
        process.exit(1);
    }
};

createTestUser();
