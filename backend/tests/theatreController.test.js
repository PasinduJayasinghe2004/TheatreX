// ============================================================================
// Theatre Controller Tests
// ============================================================================
// Created by: M1 (Pasindu) - Day 10
//
// Comprehensive tests for theatre API endpoints:
// - GET  /api/theatres             (List theatres)
// - GET  /api/theatres/:id         (Get theatre detail)
// - PUT  /api/theatres/:id/status  (Update theatre status)
// - GET  /api/theatres/check-availability (Check theatre availability)
//
// Run with: npm test -- --testPathPattern=theatreController
// ============================================================================

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

describe('Theatre API Tests - Day 10', () => {
    let coordinatorToken;
    let staffToken;
    let testTheatreId;

    const uniqueId = Date.now();

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
        // Register coordinator
        await request(app).post('/api/auth/register').send(coordinatorUser);
        const coordLogin = await request(app).post('/api/auth/login').send({
            email: coordinatorUser.email,
            password: coordinatorUser.password
        });
        coordinatorToken = coordLogin.body.token;

        // Register staff
        await request(app).post('/api/auth/register').send(staffUser);
        const staffLogin = await request(app).post('/api/auth/login').send({
            email: staffUser.email,
            password: staffUser.password
        });
        staffToken = staffLogin.body.token;
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
            expect(res.body).toHaveProperty('count');

            // Save a theatre ID for subsequent tests
            if (res.body.data.length > 0) {
                testTheatreId = res.body.data[0].id;
            }
        });

        it('should support status filter', async () => {
            const res = await request(app)
                .get('/api/theatres?status=available')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            // All returned theatres should have status = 'available'
            if (res.body.data.length > 0) {
                res.body.data.forEach(t => {
                    expect(t.status).toBe('available');
                });
            }
        });

        it('should support type filter', async () => {
            const res = await request(app)
                .get('/api/theatres?type=general')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            if (res.body.data.length > 0) {
                res.body.data.forEach(t => {
                    expect(t.theatre_type).toBe('general');
                });
            }
        });

        it('should allow staff users to view theatres', async () => {
            const res = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ========================================================================
    // GET /api/theatres/:id - Theatre Detail
    // ========================================================================
    describe('GET /api/theatres/:id', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/theatres/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 404 for non-existent theatre', async () => {
            const res = await request(app)
                .get('/api/theatres/99999')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return theatre detail', async () => {
            if (!testTheatreId) return; // skip if no theatres exist

            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id', testTheatreId);
            expect(res.body.data).toHaveProperty('name');
            expect(res.body.data).toHaveProperty('status');
            expect(res.body.data).toHaveProperty('theatre_type');
        });
    });

    // ========================================================================
    // PUT /api/theatres/:id/status - Update Theatre Status
    // ========================================================================
    describe('PUT /api/theatres/:id/status', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .put('/api/theatres/1/status')
                .send({ status: 'maintenance' });

            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for staff users (RBAC)', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ status: 'maintenance' });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid status', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: 'invalid_status' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 for non-existent theatre', async () => {
            const res = await request(app)
                .put('/api/theatres/99999/status')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: 'maintenance' });

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should update theatre status for coordinator', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: 'maintenance' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('maintenance');

            // Restore status after test
            await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: 'available' });
        });

        it('should transition through all valid statuses', async () => {
            if (!testTheatreId) return;

            const transitions = ['in_use', 'cleaning', 'available', 'maintenance', 'available'];

            for (const newStatus of transitions) {
                const res = await request(app)
                    .put(`/api/theatres/${testTheatreId}/status`)
                    .set('Authorization', `Bearer ${coordinatorToken}`)
                    .send({ status: newStatus });

                expect(res.statusCode).toBe(200);
                expect(res.body.data.status).toBe(newStatus);
            }
        });
    });

    describe('GET /api/theatres/check-availability', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .get('/api/theatres/check-availability');

            expect(res.statusCode).toBe(401);
        });

        it('should return 400 when required query parameters are missing', async () => {
            const res = await request(app)
                .get('/api/theatres/check-availability')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
