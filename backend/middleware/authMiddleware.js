// ============================================================================
// Authentication Middleware
// ============================================================================
// Protects routes by verifying JWT tokens and enforcing role-based access
// Created by: M4 (Oneli) - Day 4
// 
// EXPORTS:
// - protect: Verifies valid JWT token in Authorization header
// - authorize: Restricts access to specific user roles
// ============================================================================

import { verifyToken } from '../utils/jwtUtils.js';
import { promisePool } from '../config/database.js';

// ============================================================================
// MIDDLEWARE: Protect Routes (Verify JWT)
// ============================================================================
// Usage: router.get('/profile', protect, getProfile);
// 
// 1. Checks for token in "Authorization: Bearer <token>" header
// 2. Verifies token signature
// 3. Decodes payload and fetches user from DB
// 4. Attaches user object to req.user
// ============================================================================
export const protect = async (req, res, next) => {
    let token;

    // Check for Authorization header with Bearer scheme
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (remove "Bearer " prefix)
            token = req.headers.authorization.split(' ')[1];

            // Verify token using utility
            const decoded = verifyToken(token);

            // Fetch user from database (exclude password)
            // check if user still exists/is active
            const [users] = await promisePool.query(
                'SELECT id, name, email, role, phone, is_active FROM users WHERE id = ?',
                [decoded.id]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User no longer exists'
                });
            }

            const user = users[0];

            // Check if user is active
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            // Attach user to request object
            req.user = user;
            next();

        } catch (error) {
            console.error('Auth Middleware Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed',
                error: error.message
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }
};

// ============================================================================
// MIDDLEWARE: Role-Based Access Control (RBAC)
// ============================================================================
// Usage: router.delete('/users/:id', protect, authorize('admin'), deleteUser);
// 
// @param {...String} roles - List of allowed roles (e.g., 'admin', 'surgeon')
// ============================================================================
export const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user is set by 'protect' middleware above
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }

        next();
    };
};
