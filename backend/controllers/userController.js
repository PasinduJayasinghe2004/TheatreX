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

// ============================================
// PLACEHOLDER ENDPOINTS - TO BE IMPLEMENTED
// ============================================
// These endpoints will be fully implemented in Day 3-4
// when authentication and password hashing are added

/**
 * Create a new user (PLACEHOLDER)
 * 
 * @desc    Will create a new user with hashed password and validation
 * @route   POST /api/users
 * @access  Public (registration) / Admin (creating other users)
 * 
 * @todo    Implement in Day 3-4 with:
 *          - Password hashing (bcrypt)
 *          - Input validation
 *          - Email uniqueness check
 *          - JWT token generation
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} 501 Not Implemented status
 */
export const createUser = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Create user endpoint - Coming in Day 3 (Authentication)'
    });
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
        message: 'Update user endpoint - Coming in Day 3 (Authentication)'
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
        message: 'Delete user endpoint - Coming in Day 3 (Authentication)'
    });
};
