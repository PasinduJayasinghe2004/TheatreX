import { createClerkClient } from '@clerk/clerk-sdk-node';
import { pool } from '../config/database.js';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Clerk Protect Middleware
 * Verifies the Clerk JWT token and attaches the local DB user to req.user
 */
export const clerkProtect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify the token with Clerk
            const decodedRequest = await clerkClient.authenticateRequest(req);

            if (decodedRequest.status === 'signed-out') {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, token failed'
                });
            }

            const { userId } = decodedRequest.auth;

            // Fetch user from local database using Clerk ID
            // Assuming we added clerk_id to the users table
            const { rows: users } = await pool.query(
                'SELECT id, name, email, role, phone, is_active FROM users WHERE clerk_id = $1 OR email = $2',
                [userId, decodedRequest.auth.sessionClaims?.email]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found in local database. Please sync via webhooks.'
                });
            }

            req.user = users[0];
            req.auth = decodedRequest.auth;
            next();

        } catch (error) {
            console.error('Clerk Auth Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token validation failed',
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

/**
 * Role-Based Access Control (RBAC) - compatible with req.user
 */
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
