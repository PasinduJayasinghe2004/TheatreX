// ============================================================================
// Surgery Duration Stats API Tests - M4 Day 19
// ============================================================================
// Created by: M4 (Oneli) - Day 19
//
// Tests for:
//   GET /api/analytics/surgery-duration-stats - getSurgeryDurationStats
// ============================================================================

import request from 'supertest';
import app from '../server.js';

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
describe('Surgery Duration Stats API - M4 Day 19', () => {

    // ── Route mounting verification ──────────────────────────────────────────
    describe('Route mounting verification', () => {

        it('GET /api/analytics/surgery-duration-stats should return 401 without token (route is mounted)', async () => {
            const res = await request(app).get('/api/analytics/surgery-duration-stats');
            expect(res.statusCode).toBe(401);
        });
    });

    // ── GET /api/analytics/surgery-duration-stats ────────────────────────────
    describe('GET /api/analytics/surgery-duration-stats', () => {

        it('should return 200 and duration stats for authenticated user', async () => {
            const token = await getToken('coordinator');
            if (!token) {
                console.warn('Skipping test: No token obtained. Check if test user exists.');
                return;
            }

            const res = await request(app)
                .get('/api/analytics/surgery-duration-stats')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('buckets');
            expect(res.body.data).toHaveProperty('stats');
            expect(Array.isArray(res.body.data.buckets)).toBe(true);
        });

        it('buckets should contain all expected duration ranges', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/surgery-duration-stats')
                .set('Authorization', `Bearer ${token}`);

            const { buckets } = res.body.data;
            expect(buckets.length).toBe(6);

            const ranges = buckets.map(b => b.range);
            expect(ranges).toEqual(['0-30', '31-60', '61-90', '91-120', '121-180', '180+']);

            buckets.forEach(bucket => {
                expect(bucket).toHaveProperty('range');
                expect(bucket).toHaveProperty('count');
                expect(typeof bucket.count).toBe('number');
                expect(bucket.count).toBeGreaterThanOrEqual(0);
            });
        });

        it('stats should contain avgDuration, minDuration, maxDuration, totalSurgeries', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/surgery-duration-stats')
                .set('Authorization', `Bearer ${token}`);

            const { stats } = res.body.data;
            expect(stats).toHaveProperty('avgDuration');
            expect(stats).toHaveProperty('minDuration');
            expect(stats).toHaveProperty('maxDuration');
            expect(stats).toHaveProperty('totalSurgeries');

            expect(typeof stats.avgDuration).toBe('number');
            expect(typeof stats.minDuration).toBe('number');
            expect(typeof stats.maxDuration).toBe('number');
            expect(typeof stats.totalSurgeries).toBe('number');
        });

        it('totalSurgeries should equal the sum of all bucket counts', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/surgery-duration-stats')
                .set('Authorization', `Bearer ${token}`);

            const { buckets, stats } = res.body.data;
            const sum = buckets.reduce((acc, b) => acc + b.count, 0);
            expect(stats.totalSurgeries).toBe(sum);
        });
    });
});
