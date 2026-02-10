// ============================================================================
// Authentication Controller
// ============================================================================
// This file handles all authentication-related business logic
// Created by: M1 (Pasindu) - Day 3 (Register) & M4 (Oneli) - Day 3 (Login)
// 
// ENDPOINTS HANDLED:
// - POST /api/auth/register - User registration with password hashing
// - POST /api/auth/login - User login with JWT token generation
// ============================================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { promisePool } from '../config/database.js';
import { generateToken } from '../utils/jwtUtils.js';

// ============================================================================
// CONSTANT: Salt Rounds for Password Hashing
// ============================================================================
// Higher number = more secure but slower
// 10 is industry standard balance between security and performance
const SALT_ROUNDS = 10;

// ============================================================================
// FUNCTION: Register New User
// ============================================================================
// Creates a new user account with hashed password
// 
// REQUEST BODY:
// {
//   "name": "John Doe",
//   "email": "john@example.com",
//   "password": "SecurePass123",
//   "role": "coordinator"
// }
//
// RESPONSE:
// {
//   "success": true,
//   "message": "User registered successfully",
//   "user": { id, name, email, role }
// }
// ============================================================================
export const register = async (req, res) => {
    try {
        // ========================================
        // STEP 1: Extract and Validate Input
        // ========================================
        const { name, email, password, role } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required (name, email, password, role)'
            });
        }

        // Validate email format using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password length (minimum 8 characters)
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }

        // Validate role (must be one of the allowed roles)
        const allowedRoles = ['coordinator', 'admin', 'surgeon', 'nurse', 'anaesthetist', 'technician'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
            });
        }

        // ========================================
        // STEP 2: Check if User Already Exists
        // ========================================
        const [existingUsers] = await promisePool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // ========================================
        // STEP 3: Hash Password with Bcrypt
        // ========================================
        // This converts plain text password into a secure hash
        // Example: "password123" -> "$2b$10$N9qo8uLOickgx2ZMRZoMye..."
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // ========================================
        // STEP 4: Insert User into Database
        // ========================================
        const [result] = await promisePool.query(
            `INSERT INTO users (name, email, password, role) 
             VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role]
        );

        // ========================================
        // STEP 5: Return Success Response
        // ========================================
        // Note: We don't return the password (even hashed) for security
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: result.insertId,
                name,
                email,
                role
            }
        });

    } catch (error) {
        // ========================================
        // ERROR HANDLING
        // ========================================
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================================================
// FUNCTION: Login User
// ============================================================================
// Authenticates user and generates JWT token using centralized utility
// Updated by: M5 (Inthusha) - Day 3 (JWT Utility Integration)
// 
// REQUEST BODY:
// {
//   "email": "john@example.com",
//   "password": "SecurePass123"
// }
//
// RESPONSE:
// {
//   "success": true,
//   "message": "Login successful",
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
//   "user": { id, name, email, role, phone, is_active, created_at }
// }
// ============================================================================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check if user exists
        const [users] = await promisePool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // ========================================
        // STEP 4: Generate JWT Token
        // ========================================
        // Using centralized JWT utility (created by M5 - Day 3)
        // This generates a signed token containing user id, email, and role
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Return user data (without password) and token
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                is_active: user.is_active,
                created_at: user.created_at
            }
        });



    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================================================
// FUNCTION: Forgot Password
// ============================================================================
// REQUEST BODY: { "email": "john@example.com" }
// ============================================================================
import crypto from 'crypto';
import { sendResetEmail } from '../utils/emailService.js';

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if user exists
        const [users] = await promisePool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];

        // Generate Reset Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save token to database
        // Ideally we should have a password_resets table, but for now allow saving to users table if columns exist
        // OR create a temporary table. Let's assume we create a password_resets table on the fly if not exists or use a simple updates
        // For standard implementation, we'll create a `password_resets` table if it doesn't exist

        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS password_resets (
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL,
                expiry DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (email)
            )
        `);

        // Upsert token
        await promisePool.query(`
            INSERT INTO password_resets (email, token, expiry) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE token = ?, expiry = ?
        `, [email, resetToken, tokenExpiry, resetToken, tokenExpiry]);

        // Send Email
        await sendResetEmail(email, resetToken);

        res.status(200).json({ success: true, message: 'Password reset link sent to your email' });

    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ success: false, message: 'Error sending email' });
    }
};

// ============================================================================
// FUNCTION: Reset Password
// ============================================================================
// REQUEST BODY: { "email": "...", "token": "...", "newPassword": "..." }
// ============================================================================
export const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        // Verify Token
        const [resets] = await promisePool.query(
            'SELECT * FROM password_resets WHERE email = ? AND token = ? AND expiry > NOW()',
            [email, token]
        );

        if (resets.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update User Password
        await promisePool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        // Delete reset token
        await promisePool.query('DELETE FROM password_resets WHERE email = ?', [email]);

        res.status(200).json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ success: false, message: 'Error resetting password' });
    }
};

// ============================================================================
// FUNCTION: Get User Profile
// ============================================================================
// Returns current authenticated user's profile information
// Created by: M2 (Chandeepa) & M4 (Oneli) - Day 4
// 
// REQUIRES: protect middleware (sets req.user)
// RESPONSE: { success, user: { id, name, email, role, phone, is_active, created_at } }
// ============================================================================
export const getProfile = async (req, res) => {
    try {
        // req.user is set by protect middleware
        // It already excludes the password field
        res.status(200).json({
            success: true,
            user: req.user
        });

    } catch (error) {
        console.error('Get Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ============================================================================
// FUNCTION: Update User Profile
// ============================================================================
// Updates current authenticated user's profile information
// Created by: M4 (Oneli) - Day 4
// 
// REQUIRES: protect middleware (sets req.user)
// REQUEST BODY: { name?, phone?, password? }
// RESPONSE: { success, message, user }
// 
// NOTES:
// - Email and role changes require admin privileges (not implemented here)
// - Password is optional; if provided, it will be hashed
// - Returns updated user data without password
// ============================================================================
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        const userId = req.user.id;

        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }

        if (phone) {
            updates.push('phone = ?');
            values.push(phone);
        }

        if (password) {
            // Validate password length
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters long'
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            updates.push('password = ?');
            values.push(hashedPassword);
        }

        // Check if there are any fields to update
        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update. Provide name, phone, or password.'
            });
        }

        // Add user ID to values array
        values.push(userId);

        // Execute update query
        await promisePool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Fetch updated user data (without password)
        const [users] = await promisePool.query(
            'SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE id = ?',
            [userId]
        );

        const updatedUser = users[0];

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
