// ============================================================================
// Quick Status Update API Tests
// ============================================================================
// Created by: M6 (Dinil) - Day 12
//
// Integration tests for:
//   PATCH /api/theatres/:id/quick-status
//
// Covers:
//   1.  Auth requirement (no token → 401)
//   2.  RBAC: staff role → 403
//   3.  RBAC: coordinator role → 200
//   4.  RBAC: admin role → 200
//   5.  Invalid theatre ID (non-numeric) → 400
//   6.  Missing status in body → 400
//   7.  Invalid status value → 400
//   8.  Non-existent theatre ID → 404
//   9.  Happy path: set status to 'available'
//   10. Happy path: set status to 'maintenance'
//   11. Happy path: set status to 'cleaning'
//   12. Response shape: success true + data with updated theatre
//
// Run with: npm test -- --testPathPattern=day12_m6_quick_status
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { pool } from '../config/database.js';

jest.setTimeout(30000);

describe('Quick Status Update API - M6 Day 12', () => {
    let coordinatorToken;
    let staffToken;
    let adminToken;
    let theatreId;

    const uniqueId = Date.now();

    const coordinatorUser = {
        name: 'QS Coord Tester',
        email: `qs.coord${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771300000'
    };

    const staffUser = {
        name: 'QS Staff Tester',
        email: `qs.staff${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'staff',
        phone: '0771300001'
    };

    const adminUser = {
        name: 'QS Admin Tester',
        email: `qs.admin${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'admin',
        phone: '0771300002'
    };

    // ── Setup ─────────────────────────────────────────────────────────────────
    beforeAll(async () => {
        // Register + login coordinator
        await request(app).post('/api/auth/register').send(coordinatorUser);
        const coordRes = await request(app)
            .post('/api/auth/login')
            .send({ email: coordinatorUser.email, password: coordinatorUser.password });
        coordinatorToken = coordRes.body.token;

        // Register + login staff
        await request(app).post('/api/auth/register').send(staffUser);
        const staffRes = await request(app)
            .post('/api/auth/login')
            .send({ email: staffUser.email, password: staffUser.password });
        staffToken = staffRes.body.token;

        // Register + login admin
        await request(app).post('/api/auth/register').send(adminUser);
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ email: adminUser.email, password: adminUser.password });
        adminToken = adminRes.body.token;

        // Seed a test theatre
        const { rows } = await pool.query(`
            INSERT INTO theatres (name, location, status, theatre_type, is_active)
            VALUES ($1, 'Test Building', 'available', 'general', TRUE)
            RETURNING id
        `, [`QS Theatre ${uniqueId}`]);
        theatreId = rows[0].id;
    });

    // ── Authentication ────────────────────────────────────────────────────────
    describe('Authentication', () => {
        it('should return 401 when no auth token is provided', async () => {
            const res = await request(app)
                .patch(`/api/theatres/${theatreId}/quick-status`)
                .send({ status: 'maintenance' });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    // ── RBAC ──────────────────────────────────────────────────────────────────
    describe('RBAC (Role-Based Access)', () => {
        it('should return 403 for staff users', async () => {
            const res = await request(app)
                .patch(`/api/theatres/${theatreId}/quick-status`)
                .send({ status: 'maintenance' })
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should allow coordinator users to update status', async () => {
            const res = await request(app)
                .patch(`/api/theatres/${theatreId}/quick-status`)
                .send({ status: 'available' })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should allow admin users to update status', async () => {
            const res = await request(app)
                .patch(`/api/theatres/${theatreId}/quick-status`)
                .send({ status: 'available' })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ── Validation ────────────────────────────────────────────────────────────
    describe('Validation', () => {
        it('should return 400 for a non-numeric theatre ID', async () => {
            const res = await request(app)
                .patch('/api/theatres/abc/quick-status')
                .send({ status: 'maintenance' })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when status is missing from the body', async () => {
            const res = await request(app)
                .patch(`/api/theatres/${theatreId}/quick-status`)
                .send({})
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for an invalid status value', async () => {
            const res = await request(app)
                .patch(`/api/theatres/${theatreId}/quick-status`)
                .send({ status: 'on_fire' })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ── Not Found ─────────────────────────────────────────────────────────────
    describe('Not Found', () => {
        it('should return 404 for a non-existent theatre ID', async () => {
            const res = await request(app)
                .patch('/api/theatres/999999/quick-status')
                .send({ status: 'maintenance' })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
        });
    });

    // ── Happy Paths ───────────────────────────────────────────────────────────
    describe('Happy Paths - Status Transitions', () => {
        it('should update theatre status to maintenance', async () => {
            const res = await request(app)
                .patch(`/api/theatres/${theatreId}/quick-status`)
                .send({ status: 'maintenance' })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should update theatre status to cleaning', async () => {
            const res = await request(app)
                .patch(`/api/theatres/${theatreId}/quick-status`)
                .send({ status: 'cleaning' })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should update theatre status back to available', async () => {
            const res = await request(app)
                .patch(`/api/theatres/${theatreId}/quick-status`)
                .send({ status: 'available' })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return the updated theatre in the response data', async () => {
            const res = await request(app)
                .patch(`/api/theatres/${theatreId}/quick-status`)
                .send({ status: 'maintenance' })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('data');
            const theatre = res.body.data;
            expect(theatre).toHaveProperty('id');
            expect(theatre).toHaveProperty('name');
            expect(theatre).toHaveProperty('status');
            expect(theatre.status).toBe('maintenance');
            expect(theatre.id).toBe(theatreId);
        });
    });
});
