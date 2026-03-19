// ============================================================================
// Staff Analytics API Tests - M4 Day 18
// ============================================================================
// Created by: M4 (Oneli) - Day 18
//
// Tests for:
//   GET /api/analytics/staff-counts - getStaffCountsByRole
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
describe('Staff Analytics API - M4 Day 18', () => {

    // ── Route mounting verification ──────────────────────────────────────────
    describe('Route mounting verification', () => {

        it('GET /api/analytics/staff-counts should return 401 without token (route is mounted)', async () => {
            const res = await request(app).get('/api/analytics/staff-counts');
            expect(res.statusCode).toBe(401);
        });
    });

    // ── GET /api/analytics/staff-counts ──────────────────────────────────────
    describe('GET /api/analytics/staff-counts', () => {

        it('should return 200 and staff counts for authenticated user', async () => {
            const token = await getToken('coordinator');
            if (!token) {
                console.warn('Skipping test: No token obtained. Check if test user exists.');
                return;
            }

            const res = await request(app)
                .get('/api/analytics/staff-counts')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('counts');
            expect(res.body.data).toHaveProperty('total');
            expect(res.body.data).toHaveProperty('breakdown');
            expect(Array.isArray(res.body.data.breakdown)).toBe(true);
            expect(res.body.data.breakdown.length).toBe(4);
        });

        it('counts object should contain all staff categories', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/staff-counts')
                .set('Authorization', `Bearer ${token}`);

            const { counts } = res.body.data;
            expect(counts).toHaveProperty('surgeons');
            expect(counts).toHaveProperty('nurses');
            expect(counts).toHaveProperty('anaesthetists');
            expect(counts).toHaveProperty('technicians');

            Object.values(counts).forEach(count => {
                expect(typeof count).toBe('number');
                expect(count).toBeGreaterThanOrEqual(0);
            });
        });

        it('total should match the sum of individual counts', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/staff-counts')
                .set('Authorization', `Bearer ${token}`);

            const { counts, total } = res.body.data;
            const sum = Object.values(counts).reduce((a, b) => a + b, 0);
            expect(total).toBe(sum);
        });

        it('breakdown should have correct structure for charts', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/staff-counts')
                .set('Authorization', `Bearer ${token}`);

            const { breakdown } = res.body.data;
            breakdown.forEach(item => {
                expect(item).toHaveProperty('role');
                expect(item).toHaveProperty('count');
                expect(item).toHaveProperty('color');
                expect(typeof item.count).toBe('number');
            });

            const roles = breakdown.map(b => b.role);
            expect(roles).toContain('Surgeons');
            expect(roles).toContain('Nurses');
            expect(roles).toContain('Anaesthetists');
            expect(roles).toContain('Technicians');
        });
    });
});
