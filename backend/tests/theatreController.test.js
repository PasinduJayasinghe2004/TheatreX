// ============================================================================
// Theatre Controller Tests
// ============================================================================
// Created by: M1 (Pasindu) - Day 10
// Updated by: M2 (Chandeepa) - Day 12 (Added Quick Status tests)
//
// Comprehensive tests for theatre API endpoints:
// - GET  /api/theatres             (List theatres)
// - GET  /api/theatres/:id         (Get theatre detail)
// - PUT  /api/theatres/:id/status  (Update theatre status)
// - GET  /api/theatres/availability (Check theatre availability)
// - GET  /api/theatres/:id/current-surgery (Current surgery info)
// - GET  /api/theatres/:id/duration (Theatre duration calculation)
// - PATCH /api/theatres/:id/quick-status (Quick status update)
//
// Run with: npm test -- --testPathPattern=theatreController
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

describe('Theatre API Tests', () => {
    let coordinatorToken;
    let staffToken;
    let testTheatreId;

    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Coordinator user (can update theatre status)
    const coordinatorUser = {
        name: 'Theatre Test Coordinator',
        email: `theatre.coord${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234567'
    };

    // Staff user (can view but not update status)
    const staffUser = {
        name: 'Theatre Test Staff',
        email: `theatre.staff${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'staff',
        phone: '0771234568'
    };

    // ========================================================================
    // Setup: Register and login test users
    // ========================================================================
    beforeAll(async () => {
        // Register coordinator (ignore if exists)
        await request(app).post('/api/auth/register').send(coordinatorUser);
        const coordLogin = await request(app).post('/api/auth/login').send({
            email: coordinatorUser.email,
            password: coordinatorUser.password
        });
        coordinatorToken = coordLogin.body.token;

        // Register staff (ignore if exists)
        await request(app).post('/api/auth/register').send(staffUser);
        const staffLogin = await request(app).post('/api/auth/login').send({
            email: staffUser.email,
            password: staffUser.password
        });
        staffToken = staffLogin.body.token;

        if (!coordinatorToken || !staffToken) {
            console.warn('Warning: Tokens not received during setup. Check registration/login logic.');
        }
    });

    // ========================================================================
    // GET /api/theatres - List Theatres
    // ========================================================================
    describe('GET /api/theatres', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/theatres');
            expect(res.statusCode).toBe(401);
        });

        it('should return theatre list with auth token', async () => {
            const res = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            if (res.body.data.length > 0) {
                testTheatreId = res.body.data[0].id;
            }
        });

        it('should support status filter', async () => {
            const res = await request(app)
                .get('/api/theatres?status=available')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            if (res.body.data.length > 0) {
                res.body.data.forEach(t => {
                    expect(t.status).toBe('available');
                });
            }
        });
    });

    // ========================================================================
    // GET /api/theatres/:id - Theatre Detail
    // ========================================================================
    describe('GET /api/theatres/:id', () => {
        it('should return 404 for non-existent theatre', async () => {
            const res = await request(app)
                .get('/api/theatres/99999')
                .set('Authorization', `Bearer ${coordinatorToken}`);
            expect(res.statusCode).toBe(404);
        });

        it('should return theatre detail', async () => {
            if (!testTheatreId) return;
            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.data.id).toBe(testTheatreId);
        });
    });

    // ========================================================================
    // PUT /api/theatres/:id/status - Update Theatre Status
    // ========================================================================
    describe('PUT /api/theatres/:id/status', () => {
        it('should return 403 for staff users (RBAC)', async () => {
            if (!testTheatreId) return;
            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ status: 'maintenance' });
            expect(res.statusCode).toBe(403);
        });

        it('should update theatre status for coordinator', async () => {
            if (!testTheatreId) return;
            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: 'maintenance' });
            expect(res.statusCode).toBe(200);
            expect(res.body.data.status).toBe('maintenance');

            // Restore
            await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: 'available' });
        });
    });

    // ========================================================================
    // GET /api/theatres/availability
    // ========================================================================
    describe('GET /api/theatres/availability', () => {
        it('should return 400 when required params are missing', async () => {
            const res = await request(app)
                .get('/api/theatres/availability')
                .set('Authorization', `Bearer ${coordinatorToken}`);
            expect(res.statusCode).toBe(400);
        });
    });

    // ========================================================================
    // GET /api/theatres/:id/current-surgery
    // ========================================================================
    describe('GET /api/theatres/:id/current-surgery', () => {
        it('should return 200 even if no surgery is in progress', async () => {
            if (!testTheatreId) return;
            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}/current-surgery`)
                .set('Authorization', `Bearer ${coordinatorToken}`);
            expect(res.statusCode).toBe(200);
        });
    });

    // ========================================================================
    // GET /api/theatres/:id/duration
    // ========================================================================
    describe('GET /api/theatres/:id/duration', () => {
        it('should return 404 for non-existent theatre', async () => {
            const res = await request(app)
                .get('/api/theatres/99999/duration')
                .set('Authorization', `Bearer ${coordinatorToken}`);
            expect(res.statusCode).toBe(404);
        });
    });

    // ========================================================================
    // PATCH /api/theatres/:id/quick-status - Quick Status Update (Day 12)
    // ========================================================================
    describe('PATCH /api/theatres/:id/quick-status', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .patch(`/api/theatres/1/quick-status`)
                .send({ status: 'maintenance' });
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for staff users (RBAC)', async () => {
            if (!testTheatreId) return;
            const res = await request(app)
                .patch(`/api/theatres/${testTheatreId}/quick-status`)
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ status: 'maintenance' });
            expect(res.statusCode).toBe(403);
        });

        it('should update status for coordinator', async () => {
            if (!testTheatreId) return;
            // Ensure starting state
            await request(app).put(`/api/theatres/${testTheatreId}/status`).set('Authorization', `Bearer ${coordinatorToken}`).send({ status: 'available' });

            const res = await request(app)
                .patch(`/api/theatres/${testTheatreId}/quick-status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: 'maintenance' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.status).toBe('maintenance');

            // Cleanup
            await request(app).put(`/api/theatres/${testTheatreId}/status`).set('Authorization', `Bearer ${coordinatorToken}`).send({ status: 'available' });
        });

        it('should return 400 for invalid transition', async () => {
            if (!testTheatreId) return;
            // available -> cleaning is NOT allowed directly
            await request(app).put(`/api/theatres/${testTheatreId}/status`).set('Authorization', `Bearer ${coordinatorToken}`).send({ status: 'available' });

            const res = await request(app)
                .patch(`/api/theatres/${testTheatreId}/quick-status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: 'cleaning' });

            expect(res.statusCode).toBe(400);
        });
    });
});
