import { createClerkClient } from '@clerk/clerk-sdk-node';
import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// ============================================================================
// MIDDLEWARE: Protect Routes (Verify Clerk JWT)
// ============================================================================
export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify the Clerk JWT directly (more reliable than authenticateRequest
            // for API-only backends where Express req lacks a full URL)
            const decoded = await clerkClient.verifyToken(token);

            if (!decoded || !decoded.sub) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, token failed'
                });
            }

            const userId = decoded.sub;

            // Fetch user from local database using Clerk ID
            let { rows: users } = await pool.query(
                'SELECT id, name, email, role, phone, is_active FROM users WHERE clerk_id = $1',
                [userId]
            );

            // Also try by email if not found by clerk_id
            if (users.length === 0 && decoded.email) {
                const result = await pool.query(
                    'SELECT id, name, email, role, phone, is_active FROM users WHERE email = $1',
                    [decoded.email]
                );
                users = result.rows;
            }

            // AUTO-PROVISION: If user exists in Clerk but not in local DB, create them
            // This is essential for local dev where webhooks aren't easily reachable
            if (users.length === 0) {
                try {
                    console.log(`🔍 User ${userId} not found in DB, auto-provisioning...`);
                    const clerkUser = await clerkClient.users.getUser(userId);
                    const email = clerkUser.emailAddresses[0]?.emailAddress;
                    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Clerk User';
                    const role = clerkUser.publicMetadata?.role || 'coordinator';

                    const { rows: newUser } = await pool.query(
                        `INSERT INTO users (clerk_id, email, name, role, is_active) 
                         VALUES ($1, $2, $3, $4, $5)
                         ON CONFLICT (email) DO UPDATE SET clerk_id = $1
                         RETURNING id, name, email, role, phone, is_active`,
                        [userId, email, name, role, true]
                    );
                    users = newUser;
                    console.log(`✅ Auto-provisioned user ${email} (${role})`);
                } catch (provisionErr) {
                    console.error('Auto-provisioning failed:', provisionErr.message);
                    return res.status(401).json({
                        success: false,
                        message: 'User found in Clerk but local profile creation failed.',
                        error: provisionErr.message
                    });
                }
            }

            req.user = users[0];
            req.auth = { userId, sessionClaims: decoded };
            next();

        } catch (error) {
            console.error('Clerk Auth Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token validation failed',
                error: error.message
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }
};

// ============================================================================
// MIDDLEWARE: Role-Based Access Control (RBAC)
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
