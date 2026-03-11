// ============================================================================
// Surgery Status Counts Analytics Tests - M2 Day 18
// ============================================================================
// Created by: M2 (Chandeepa) - Day 18
//
// Tests for:
//   GET /api/analytics/surgery-status-counts - getSurgeryStatusCounts
// ============================================================================

import request from 'supertest';
import app from '../server.js';
import { pool } from '../config/database.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getToken = async (role = 'coordinator') => {
    const credentials = {
        coordinator: { email: 'coordinator@test.com', password: 'Test1234!' },
        admin: { email: 'admin@test.com', password: 'Test1234!' },
        nurse: { email: 'staff@test.com', password: 'Test1234!' },
    };
    const cred = credentials[role];
    const res = await request(app).post('/api/auth/login').send(cred);
    return res.body?.data?.token || res.body?.token || null;
};

// ─────────────────────────────────────────────────────────────────────────────
describe('Surgery Status Counts Analytics - M2 Day 18', () => {

    // ── Route mounting verification ──────────────────────────────────────────
    describe('Route mounting verification', () => {

        it('GET /api/analytics/surgery-status-counts should return 401 without token', async () => {
            const res = await request(app).get('/api/analytics/surgery-status-counts');
            expect(res.statusCode).toBe(401);
        });
    });

    // ── GET /api/analytics/surgery-status-counts ─────────────────────────────
    describe('GET /api/analytics/surgery-status-counts', () => {

        it('should return 200 with status counts data for authenticated user', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/surgery-status-counts')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });

        it('response should contain counts, total, and breakdown fields', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/surgery-status-counts')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            const { data } = res.body;
            expect(data).toHaveProperty('counts');
            expect(data).toHaveProperty('total');
            expect(data).toHaveProperty('breakdown');
            expect(typeof data.total).toBe('number');
            expect(data.total).toBeGreaterThanOrEqual(0);
        });

        it('counts should have scheduled, in_progress, completed, and cancelled', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/surgery-status-counts')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            const { counts } = res.body.data;
            expect(counts).toHaveProperty('scheduled');
            expect(counts).toHaveProperty('in_progress');
            expect(counts).toHaveProperty('completed');
            expect(counts).toHaveProperty('cancelled');
        });
    });

    afterAll(async () => {
        await pool.end();
    });
});
