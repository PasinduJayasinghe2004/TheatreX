import bcrypt from 'bcryptjs';
import { promisePool } from './config/database.js';

// Create a test user for login testing
const createTestUser = async () => {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Insert test user
        const [result] = await promisePool.query(
            `INSERT INTO users (name, email, password, role, phone) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             password = VALUES(password),
             name = VALUES(name)`,
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
