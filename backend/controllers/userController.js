/**
 * User Controller
 * 
 * Handles all user-related HTTP requests and business logic.
 * Contains CRUD operations for user management.
 * 
 * @module controllers/userController
 * @requires config/database - PostgreSQL connection pool
 */

import { pool } from '../config/database.js';
import { hashPassword } from '../utils/hashPassword.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Get all users from the database
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, name, email, role, phone, is_active, created_at FROM users'
        );

        sendSuccess(res, rows, 'Users fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single user by their ID
 */
export const getUserById = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE id = $1',
            [req.params.id]
        );

        if (rows.length === 0) {
            return sendError(res, 'User not found', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, rows[0], 'User fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

// @desc    Create new user (Register)
export const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Check if email already exists
        const { rows: existingUsers } = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.trim().toLowerCase()]
        );

        if (existingUsers.length > 0) {
            return sendError(res, 'Email already exists', 409, ERROR_CODES.CONFLICT);
        }

        const hashedPassword = await hashPassword(password);

        const { rows: insertResult } = await pool.query(
            'INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone, is_active, created_at',
            [name.trim(), email.trim().toLowerCase(), hashedPassword, role || 'coordinator', phone || null]
        );

        sendSuccess(res, insertResult[0], 'User registered successfully', 201);
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'Email already exists', 409, ERROR_CODES.CONFLICT);
        }
        next(error);
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
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, role, phone, is_active } = req.body;

        // Check if user exists
        const { rows: userCheck } = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [id]
        );

        if (userCheck.length === 0) {
            return sendError(res, 'User not found', 404, ERROR_CODES.NOT_FOUND);
        }

        // If email is changing, check for duplicates
        if (email) {
            const { rows: emailCheck } = await pool.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email.trim().toLowerCase(), id]
            );

            if (emailCheck.length > 0) {
                return sendError(res, 'Email already exists', 409, ERROR_CODES.CONFLICT);
            }
        }

        // Build update query dynamically
        const fields = [];
        const values = [];
        let idx = 1;

        if (name) { fields.push(`name = $${idx++}`); values.push(name.trim()); }
        if (email) { fields.push(`email = $${idx++}`); values.push(email.trim().toLowerCase()); }
        if (role) { fields.push(`role = $${idx++}`); values.push(role); }
        if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
        if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }

        if (fields.length === 0) {
            return sendError(res, 'No fields to update', 400, ERROR_CODES.BAD_REQUEST);
        }

        values.push(id);
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, phone, is_active, created_at`;

        const { rows } = await pool.query(query, values);
        sendSuccess(res, rows[0], 'User updated successfully', 200);
    } catch (error) {
        next(error);
    }
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
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Hard delete: remove from database
        const { rowCount } = await pool.query(
            'DELETE FROM users WHERE id = $1',
            [id]
        );

        if (rowCount === 0) {
            return sendError(res, 'User not found', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, null, 'User removed from system successfully', 200);
    } catch (error) {
        next(error);
    }
};
