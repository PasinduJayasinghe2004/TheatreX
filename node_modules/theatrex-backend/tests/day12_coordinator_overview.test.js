// ============================================================================
// Coordinator Overview API Tests
// ============================================================================
// Created by: M1 (Pasindu) - Day 12
//
// Integration tests for:
//   GET /api/theatres/coordinator-overview
//
// Covers:
//   1. Auth requirement (no token → 401)
//   2. RBAC: staff role → 403
//   3. Coordinator happy path → 200
//   4. Response has required summary keys
//   5. Summary counts are internally consistent
//   6. Data array has required theatre shape
//   7. generated_at is a valid ISO timestamp
//   8. Admin role can also access the endpoint
//
// Run with: npm test -- --testPathPattern=day12_coordinator_overview
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

describe('Coordinator Overview API - Day 12', () => {
    let coordinatorToken;
    let staffToken;
    let adminToken;

    const uniqueId = Date.now();

    const coordinatorUser = {
        name: 'Coord Overview Tester',
        email: `coord.overview${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771100000'
    };

    const staffUser = {
        name: 'Staff Overview Tester',
        email: `staff.overview${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'nurse',
        phone: '0771100001'
    };

    const adminUser = {
        name: 'Admin Overview Tester',
        email: `admin.overview${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'admin',
        phone: '0771100002'
    };

    // ── Setup ─────────────────────────────────────────────────────────────────
    beforeAll(async () => {
        // Register and login coordinator
        await request(app).post('/api/auth/register').send(coordinatorUser);
        const coordLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: coordinatorUser.email, password: coordinatorUser.password });
        coordinatorToken = coordLogin.body.token;

        // Register and login staff
        await request(app).post('/api/auth/register').send(staffUser);
        const staffLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: staffUser.email, password: staffUser.password });
        staffToken = staffLogin.body.token;

        // Register and login admin
        await request(app).post('/api/auth/register').send(adminUser);
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: adminUser.email, password: adminUser.password });
        adminToken = adminLogin.body.token;
    });

    // ── Authentication ────────────────────────────────────────────────────────
    describe('Authentication', () => {
        it('should return 401 when no auth token is supplied', async () => {
            const res = await request(app)
                .get('/api/theatres/coordinator-overview');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ── RBAC ──────────────────────────────────────────────────────────────────
    describe('RBAC (Role-Based Access)', () => {
        it('should return 403 for staff users (not coordinator/admin)', async () => {
            const res = await request(app)
                .get('/api/theatres/coordinator-overview')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should allow admin users to access the endpoint', async () => {
            const res = await request(app)
                .get('/api/theatres/coordinator-overview')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ── Happy Path ────────────────────────────────────────────────────────────
    describe('GET /api/theatres/coordinator-overview (Coordinator)', () => {
        let res;

        beforeAll(async () => {
            res = await request(app)
                .get('/api/theatres/coordinator-overview')
                .set('Authorization', `Bearer ${coordinatorToken}`);
        });

        it('should return HTTP 200 with success: true', () => {
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should include a generated_at ISO timestamp', () => {
            expect(res.body).toHaveProperty('generated_at');
            const parsed = new Date(res.body.generated_at);
            expect(isNaN(parsed.getTime())).toBe(false);
        });

        it('should include a summary object with all required keys', () => {
            const { summary } = res.body;
            expect(summary).toBeDefined();
            expect(summary).toHaveProperty('total');
            expect(summary).toHaveProperty('available');
            expect(summary).toHaveProperty('in_use');
            expect(summary).toHaveProperty('maintenance');
            expect(summary).toHaveProperty('cleaning');
            expect(summary).toHaveProperty('utilization_rate');
            expect(summary).toHaveProperty('overdue_count');
        });

        it('summary status counts should add up to total', () => {
            const { summary } = res.body;
            const computedTotal =
                summary.available +
                summary.in_use +
                summary.maintenance +
                summary.cleaning;
            expect(computedTotal).toBe(summary.total);
        });

        it('utilization_rate should be a number between 0 and 100', () => {
            const { utilization_rate } = res.body.summary;
            expect(typeof utilization_rate).toBe('number');
            expect(utilization_rate).toBeGreaterThanOrEqual(0);
            expect(utilization_rate).toBeLessThanOrEqual(100);
        });

        it('overdue_count should be a non-negative integer', () => {
            const { overdue_count } = res.body.summary;
            expect(typeof overdue_count).toBe('number');
            expect(overdue_count).toBeGreaterThanOrEqual(0);
        });

        it('should include a data array of theatres', () => {
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('each theatre in data should have required shape', () => {
            const theatres = res.body.data;
            if (theatres.length === 0) return; // no theatres seeded — skip shape check

            theatres.forEach(theatre => {
                expect(theatre).toHaveProperty('id');
                expect(theatre).toHaveProperty('name');
                expect(theatre).toHaveProperty('status');
                expect(theatre).toHaveProperty('theatre_type');
                // current_surgery is either null or an object
                expect(
                    theatre.current_surgery === null ||
                    typeof theatre.current_surgery === 'object'
                ).toBe(true);
            });
        });

        it('theatres with a current surgery should have auto-progress fields', () => {
            const theatres = res.body.data;
            const inProgress = theatres.filter(t => t.current_surgery !== null);

            inProgress.forEach(theatre => {
                const cs = theatre.current_surgery;
                expect(cs).toHaveProperty('auto_progress');
                expect(cs).toHaveProperty('elapsed_minutes');
                expect(cs).toHaveProperty('remaining_minutes');
                expect(cs).toHaveProperty('is_overdue');
                expect(cs).toHaveProperty('estimated_end_time');
                // auto_progress must be 0-100
                expect(cs.auto_progress).toBeGreaterThanOrEqual(0);
                expect(cs.auto_progress).toBeLessThanOrEqual(100);
            });
        });

        it('data length should equal summary.total', () => {
            expect(res.body.data.length).toBe(res.body.summary.total);
        });
    });
});
