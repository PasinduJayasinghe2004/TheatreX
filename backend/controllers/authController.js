// ============================================================================
// Authentication Controller
// ============================================================================
// This file handles all authentication-related business logic
// Created by: M1 (Pasindu) - Day 3
// 
// ENDPOINTS HANDLED:
// - POST /api/auth/register - User registration with password hashing
// - POST /api/auth/login - User login (Day 4)
// ============================================================================

import bcrypt from 'bcrypt';
import { promisePool } from '../config/database.js';

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
// FUNCTION: Login User (Placeholder for Day 4)
// ============================================================================
// This will be implemented in Day 4
// Will verify password and generate JWT token
// ============================================================================
export const login = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Login endpoint not yet implemented (Day 4)'
    });
};
