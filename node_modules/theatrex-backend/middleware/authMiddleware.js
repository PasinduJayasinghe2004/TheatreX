
import { verifyToken } from '../utils/jwtUtils.js';
import { pool } from '../config/database.js';

// ============================================================================
// MIDDLEWARE: Protect Routes (Verify Custom JWT)
// ============================================================================
// Extracts token from Authorization header, verifies it, and attaches user to req
// ============================================================================
export const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header (Bearer <token>)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token using centralized utility
            const decoded = verifyToken(token);

            // Fetch current user from database to ensure they still exist and are active
            const { rows: users } = await pool.query(
                'SELECT id, name, email, role, phone, profile_image, is_active FROM users WHERE id = $1',
                [decoded.id]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, user no longer exists'
                });
            }

            const user = users[0];

            // Check if user account is active
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            // Attach user object to request for use in controllers
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
// Restricts access to specific user roles
// ============================================================================
export const authorize = (...roles) => {
    return (req, res, next) => {
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
