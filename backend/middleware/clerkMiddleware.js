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

            // Fetch user from local database using Clerk ID or session email
            let { rows: users } = await pool.query(
                'SELECT id, name, email, role, phone, is_active FROM users WHERE clerk_id = $1 OR email = $2',
                [userId, decodedRequest.auth.sessionClaims?.email]
            );

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
