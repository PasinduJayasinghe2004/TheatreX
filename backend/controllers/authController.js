// ============================================================================
// Authentication Controller
// ============================================================================
// This file handles all authentication-related business logic
// Created by: M1 (Pasindu) - Day 3 (Register) & M4 (Oneli) - Day 3 (Login)
// Updated: Migrated from MySQL to PostgreSQL
// 
// ENDPOINTS HANDLED:
// - POST /api/auth/register - User registration with password hashing
// - POST /api/auth/login - User login with JWT token generation
// - POST /api/auth/forgot-password - Password reset request
// - POST /api/auth/reset-password - Password reset
// - GET /api/auth/profile - Get user profile
// - PUT /api/auth/profile - Update user profile
// ============================================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwtUtils.js';

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

        
        // STEP 2: Check if User Already Exists
        
        const { rows: existingUsers } = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        
        // STEP 3: Hash Password with Bcrypt
        
        // This converts plain text password into a secure hash
        // Example: "password123" -> "$2b$10$N9qo8uLOickgx2ZMRZoMye..."
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        
        // STEP 4: Insert User into Database
        
        // PostgreSQL uses RETURNING to get the inserted row's id
        const { rows: insertResult } = await pool.query(
            `INSERT INTO users (name, email, password, role) 
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [name, email, hashedPassword, role]
        );

        
        // STEP 5: Return Success Response
        
        // Note: We don't return the password (even hashed) for security
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: insertResult[0].id,
                name,
                email,
                role
            }
        });

    } catch (error) {
        
        // ERROR HANDLING
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// FUNCTION: Login User

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
        const { rows: users } = await pool.query(
            'SELECT * FROM users WHERE email = $1',
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

        
        // STEP 4: Generate JWT Tokens (Access + Refresh)
        
        // Using centralized JWT utility (created by M5 - Day 3)
        // Access token: short-lived, used for API authorization
        // Refresh token: long-lived, used to obtain new access tokens
        // Updated by: M5 (Inthusha) - Day 4 (Refresh Token Logic)
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Return user data (without password), access token, and refresh token
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            refreshToken,
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


// FUNCTION: Forgot Password

// REQUEST BODY: { "email": "john@example.com" }

import crypto from 'crypto';
import { sendResetEmail } from '../utils/emailService.js';

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if user exists
        const { rows: users } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];

        // Generate Reset Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Create password_resets table if it doesn't exist (PostgreSQL syntax)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS password_resets (
                email VARCHAR(255) NOT NULL PRIMARY KEY,
                token VARCHAR(255) NOT NULL,
                expiry TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Upsert token (PostgreSQL ON CONFLICT syntax)
        await pool.query(`
            INSERT INTO password_resets (email, token, expiry) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (email) DO UPDATE SET token = $2, expiry = $3
        `, [email, resetToken, tokenExpiry]);

        // Send Email
        await sendResetEmail(email, resetToken);

        res.status(200).json({ success: true, message: 'Password reset link sent to your email' });

    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ success: false, message: 'Error sending email' });
    }
};


// FUNCTION: Reset Password

// REQUEST BODY: { "email": "...", "token": "...", "newPassword": "..." }

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
        const { rows: resets } = await pool.query(
            'SELECT * FROM password_resets WHERE email = $1 AND token = $2 AND expiry > NOW()',
            [email, token]
        );

        if (resets.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update User Password
        await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

        // Delete reset token
        await pool.query('DELETE FROM password_resets WHERE email = $1', [email]);

        res.status(200).json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ success: false, message: 'Error resetting password' });
    }
};


// FUNCTION: Refresh Access Token

// Accepts a valid refresh token and returns a new access token
// This allows users to stay logged in without re-entering credentials
// Created by: M5 (Inthusha) - Day 4
//
// REQUEST BODY:
// {
//   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// }
//
// RESPONSE:
// {
//   "success": true,
//   "message": "Token refreshed successfully",
//   "token": "<new access token>"
// }
// ============================================================================
export const refreshTokenHandler = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // ========================================
        // STEP 1: Validate Input
        // ========================================
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        
        // STEP 2: Verify Refresh Token
        
        // This will throw an error if the token is expired or invalid
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
                error: error.message
            });
        }

        
        // STEP 3: Verify User Still Exists and Is Active
        
        const { rows: users } = await pool.query(
            'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        
        // STEP 4: Generate New Access Token
        
        const newAccessToken = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            token: newAccessToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Error refreshing token',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// FUNCTION: Get User Profile

// Returns current authenticated user's profile information
// Created by: M2 (Chandeepa) & M4 (Oneli) - Day 4
// 
// REQUIRES: protect middleware (sets req.user)
// RESPONSE: { success, user: { id, name, email, role, phone, is_active, created_at } }

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
        // PostgreSQL uses numbered placeholders ($1, $2, etc.)
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (name) {
            updates.push(`name = $${paramIndex++}`);
            values.push(name);
        }

        if (phone) {
            updates.push(`phone = $${paramIndex++}`);
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
            updates.push(`password = $${paramIndex++}`);
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
        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        // Fetch updated user data (without password)
        const { rows: users } = await pool.query(
            'SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE id = $1',
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
