// ============================================================================
// Analytics API Tests - M1 Day 18
// ============================================================================
// Created by: M1 (Pasindu) - Day 18
//
// Tests for:
//   GET /api/analytics/surgeries-per-day - getSurgeriesPerDay
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
describe('Analytics API - M1 Day 18', () => {

    // ── Route mounting verification ──────────────────────────────────────────
    describe('Route mounting verification', () => {

        it('GET /api/analytics/surgeries-per-day should return 401 without token (route is mounted)', async () => {
            const res = await request(app).get('/api/analytics/surgeries-per-day');
            expect(res.statusCode).toBe(401);
        });
    });

    // ── GET /api/analytics/surgeries-per-day ─────────────────────────────────
    describe('GET /api/analytics/surgeries-per-day', () => {

        it('should return 200 and an array of 7 day entries for authenticated user', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/surgeries-per-day')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(7);
        });

        it('each entry should have date, day, and count fields', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/surgeries-per-day')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            res.body.data.forEach((entry) => {
                expect(entry).toHaveProperty('date');
                expect(entry).toHaveProperty('day');
                expect(entry).toHaveProperty('count');
                expect(typeof entry.count).toBe('number');
                expect(entry.count).toBeGreaterThanOrEqual(0);
            });
        });

        it('count values should be non-negative integers', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/surgeries-per-day')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            res.body.data.forEach((entry) => {
                expect(Number.isInteger(entry.count)).toBe(true);
                expect(entry.count).toBeGreaterThanOrEqual(0);
            });
        });

        it('day field should be a 3-letter day abbreviation', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

            const res = await request(app)
                .get('/api/analytics/surgeries-per-day')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            res.body.data.forEach((entry) => {
                expect(validDays).toContain(entry.day);
            });
        });

        it('dates should be in ascending order', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/surgeries-per-day')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            const dates = res.body.data.map(e => new Date(e.date).getTime());
            for (let i = 1; i < dates.length; i++) {
                expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
            }
        });
    });
});
