// ============================================================================
// RBAC (Role-Based Access Control) Tests
// ============================================================================
// Created by: M6 (Dinil) - Day 4
// 
// Tests all RBAC middleware functionality using the test routes:
// - /api/test/admin-only
// - /api/test/coordinator-only
// - /api/test/staff
// - /api/test/any-authenticated
// ============================================================================

import request from 'supertest';
import app from '../server.js';
import { generateToken } from '../utils/jwtUtils.js';

describe('RBAC Middleware Tests', () => {
    // Tokens for different roles
    let adminToken;
    let coordinatorToken;
    let surgeonToken;
    let nurseToken;
    let anaesthetistToken;
    let technicianToken;

    beforeAll(() => {
        // Create tokens for different roles to test RBAC
        adminToken = generateToken({ id: 1, role: 'admin', email: 'admin@theatrex.com' });
        coordinatorToken = generateToken({ id: 2, role: 'coordinator', email: 'coordinator@theatrex.com' });
        surgeonToken = generateToken({ id: 3, role: 'surgeon', email: 'surgeon@theatrex.com' });
        nurseToken = generateToken({ id: 4, role: 'nurse', email: 'nurse@theatrex.com' });
        anaesthetistToken = generateToken({ id: 5, role: 'anaesthetist', email: 'anaesthetist@theatrex.com' });
        technicianToken = generateToken({ id: 6, role: 'technician', email: 'technician@theatrex.com' });
    });

    // ========================================================================
    // Admin-Only Route Tests (/api/test/admin-only)
    // ========================================================================
    describe('Admin-Only Route Access', () => {
        test('Admin should access admin-only routes', async () => {
            const res = await request(app)
                .get('/api/test/admin-only')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('Admin access granted');
        });

        test('Coordinator should NOT access admin-only routes', async () => {
            const res = await request(app)
                .get('/api/test/admin-only')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('Surgeon should NOT access admin-only routes', async () => {
            const res = await request(app)
                .get('/api/test/admin-only')
                .set('Authorization', `Bearer ${surgeonToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('Nurse should NOT access admin-only routes', async () => {
            const res = await request(app)
                .get('/api/test/admin-only')
                .set('Authorization', `Bearer ${nurseToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================================================
    // Coordinator-Only Route Tests (/api/test/coordinator-only)
    // ========================================================================
    describe('Coordinator-Only Route Access', () => {
        test('Coordinator should access coordinator-only routes', async () => {
            const res = await request(app)
                .get('/api/test/coordinator-only')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('Coordinator access granted');
        });

        test('Admin should NOT access coordinator-only routes', async () => {
            const res = await request(app)
                .get('/api/test/coordinator-only')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('Surgeon should NOT access coordinator-only routes', async () => {
            const res = await request(app)
                .get('/api/test/coordinator-only')
                .set('Authorization', `Bearer ${surgeonToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================================================
    // Staff Route Tests (/api/test/staff)
    // ========================================================================
    describe('Staff Route Access', () => {
        test('Surgeon should access staff routes', async () => {
            const res = await request(app)
                .get('/api/test/staff')
                .set('Authorization', `Bearer ${surgeonToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('Staff access granted');
        });

        test('Nurse should access staff routes', async () => {
            const res = await request(app)
                .get('/api/test/staff')
                .set('Authorization', `Bearer ${nurseToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('Anaesthetist should access staff routes', async () => {
            const res = await request(app)
                .get('/api/test/staff')
                .set('Authorization', `Bearer ${anaesthetistToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('Technician should access staff routes', async () => {
            const res = await request(app)
                .get('/api/test/staff')
                .set('Authorization', `Bearer ${technicianToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('Admin should NOT access staff routes', async () => {
            const res = await request(app)
                .get('/api/test/staff')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        test('Coordinator should NOT access staff routes', async () => {
            const res = await request(app)
                .get('/api/test/staff')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================================================
    // Any Authenticated Route Tests (/api/test/any-authenticated)
    // ========================================================================
    describe('Any Authenticated Route Access', () => {
        test('Admin should access any-authenticated routes', async () => {
            const res = await request(app)
                .get('/api/test/any-authenticated')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('Coordinator should access any-authenticated routes', async () => {
            const res = await request(app)
                .get('/api/test/any-authenticated')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('Surgeon should access any-authenticated routes', async () => {
            const res = await request(app)
                .get('/api/test/any-authenticated')
                .set('Authorization', `Bearer ${surgeonToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('Nurse should access any-authenticated routes', async () => {
            const res = await request(app)
                .get('/api/test/any-authenticated')
                .set('Authorization', `Bearer ${nurseToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ========================================================================
    // Token Validation Tests
    // ========================================================================
    describe('Token Validation in RBAC', () => {
        test('Request without token should be denied (401)', async () => {
            const res = await request(app).get('/api/auth/profile');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('no token');
        });

        test('Request with invalid token should be denied (401)', async () => {
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid_token_here');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('Request with malformed Authorization header should be denied', async () => {
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'NotBearer token');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('Request with expired token should be denied', async () => {
            // Create an expired token (setting expiresIn to a past date would require different approach)
            // For now, test with a clearly invalid token structure
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxfQ.invalid';

            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${expiredToken}`);

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================================================
    // Cross-Role Verification Tests
    // ========================================================================
    describe('Cross-Role Access Verification', () => {
        test('Each role should only access their permitted routes', async () => {
            // Admin can only access admin routes, not coordinator or staff
            const adminToCoordinator = await request(app)
                .get('/api/test/coordinator-only')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(adminToCoordinator.statusCode).toBe(403);

            const adminToStaff = await request(app)
                .get('/api/test/staff')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(adminToStaff.statusCode).toBe(403);

            // Coordinator can only access coordinator routes, not admin or staff
            const coordinatorToAdmin = await request(app)
                .get('/api/test/admin-only')
                .set('Authorization', `Bearer ${coordinatorToken}`);
            expect(coordinatorToAdmin.statusCode).toBe(403);

            const coordinatorToStaff = await request(app)
                .get('/api/test/staff')
                .set('Authorization', `Bearer ${coordinatorToken}`);
            expect(coordinatorToStaff.statusCode).toBe(403);

            // Staff can only access staff routes, not admin or coordinator
            const staffToAdmin = await request(app)
                .get('/api/test/admin-only')
                .set('Authorization', `Bearer ${surgeonToken}`);
            expect(staffToAdmin.statusCode).toBe(403);

            const staffToCoordinator = await request(app)
                .get('/api/test/coordinator-only')
                .set('Authorization', `Bearer ${surgeonToken}`);
            expect(staffToCoordinator.statusCode).toBe(403);
        });
    });
});
