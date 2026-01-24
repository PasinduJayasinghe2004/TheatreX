import { promisePool } from '../config/database.js';

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

// Placeholder for future CRUD operations
// Will be implemented in Day 3-4 (Authentication)
export const createUser = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Create user endpoint - Coming in Day 3 (Authentication)'
    });
};

export const updateUser = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Update user endpoint - Coming in Day 3 (Authentication)'
    });
};

export const deleteUser = async (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Delete user endpoint - Coming in Day 3 (Authentication)'
    });
};
