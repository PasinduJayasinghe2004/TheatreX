import { promisePool } from '../config/database.js';
import { hashPassword } from '../utils/hashPassword.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Public (will be protected later)
export const getAllUsers = async (req, res) => {
    try {
        const [rows] = await promisePool.query(
            'SELECT id, name, email, role, phone, is_active, created_at FROM users'
        );

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public (will be protected later)
export const getUserById = async (req, res) => {
    try {
        const [rows] = await promisePool.query(
            'SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
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

export const updateUser = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Update user endpoint - Coming in Day 4 (Authentication)'
    });
};

export const deleteUser = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Delete user endpoint - Coming in Day 4 (Authentication)'
    });
};
