// ============================================================================
// Theatre Utilization API Tests - M5 Day 18
// ============================================================================
// Created by: M5 (Inthusha) - Day 18
//
// Tests for:
//   GET /api/analytics/theatre-utilization
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
describe('Analytics API - Theatre Utilization (M5 Day 18)', () => {

    describe('Route mounting verification', () => {
        it('GET /api/analytics/theatre-utilization should return 401 without token', async () => {
            const res = await request(app).get('/api/analytics/theatre-utilization');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/analytics/theatre-utilization', () => {
        it('should return 200 and available/active theatres with utilization data', async () => {
            const token = await getToken('coordinator');
            if (!token) {
                console.warn('Skipping test: No token obtained. Ensure test user exists.');
                return;
            }

            const res = await request(app)
                .get('/api/analytics/theatre-utilization')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            if (res.body.data.length > 0) {
                const item = res.body.data[0];
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('theatre_type');
                expect(item).toHaveProperty('total_minutes');
                expect(item).toHaveProperty('utilization_percentage');
                expect(typeof item.utilization_percentage).toBe('number');
                expect(item.utilization_percentage).toBeGreaterThanOrEqual(0);
                expect(item.utilization_percentage).toBeLessThanOrEqual(100);
            }
        });
    });
});
