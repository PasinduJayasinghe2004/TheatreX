/**
 * User Controller
 * 
 * Handles all user-related HTTP requests and business logic.
 * Contains CRUD operations for user management.
 * 
 * @module controllers/userController
 * @requires config/database - MySQL connection pool
 */

import { promisePool } from '../config/database.js';
import { hashPassword } from '../utils/hashPassword.js';

/**
 * Get all users from the database
 * 
 * @desc    Retrieves all users with their basic information (excludes password)
 * @route   GET /api/users
 * @access  Public (will be protected with authentication in Day 3)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with:
 *   - success: boolean indicating operation status
 *   - count: number of users returned
 *   - data: array of user objects
 * 
 * @throws {500} Internal server error if database query fails
 */
export const getAllUsers = async (req, res) => {
    try {
        // Query database for all users
        // Note: Password field is excluded for security
        const [rows] = await promisePool.query(
            'SELECT id, name, email, role, phone, is_active, created_at FROM users'
        );

        // Return successful response with user data
        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        // Handle database errors
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

/**
 * Get a single user by their ID
 * 
 * @desc    Retrieves a specific user's information by their unique ID
 * @route   GET /api/users/:id
 * @access  Public (will be protected with authentication in Day 3)
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.id - User ID from URL parameter
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with:
 *   - success: boolean indicating operation status
 *   - data: user object if found
 * 
 * @throws {404} User not found
 * @throws {500} Internal server error if database query fails
 */
export const getUserById = async (req, res) => {
    try {
        // Query database for user with specific ID
        // Using parameterized query to prevent SQL injection
        const [rows] = await promisePool.query(
            'SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE id = ?',
            [req.params.id]
        );

        // Check if user exists
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Return the found user (first element of results array)
        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        // Handle database errors
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// @desc    Create new user (Register)
// @route   POST /api/users
// @access  Public
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if email already exists
        const [existingUsers] = await promisePool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert user into database
        const [result] = await promisePool.query(
            'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'coordinator', phone || null]
        );

        // Get the created user (without password)
        const [newUser] = await promisePool.query(
            'SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: newUser[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

/**
 * Update an existing user (PLACEHOLDER)
 * 
 * @desc    Will update user information with validation
 * @route   PUT /api/users/:id
 * @access  Protected (user can update own profile, admin can update any)
 * 
 * @todo    Implement in Day 3-4 with:
 *          - Authentication middleware
 *          - Authorization checks
 *          - Input validation
 *          - Password update handling
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} 501 Not Implemented status
 */
export const updateUser = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Update user endpoint - Coming in Day 4 (Authentication)'
    });
};

/**
 * Delete a user (PLACEHOLDER)
 * 
 * @desc    Will delete or deactivate a user account
 * @route   DELETE /api/users/:id
 * @access  Protected (admin only)
 * 
 * @todo    Implement in Day 3-4 with:
 *          - Admin authentication required
 *          - Soft delete (set is_active = false) vs hard delete
 *          - Cascade handling for related data
 *          - Audit logging
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} 501 Not Implemented status
 */
export const deleteUser = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Delete user endpoint - Coming in Day 4 (Authentication)'
    });
};
