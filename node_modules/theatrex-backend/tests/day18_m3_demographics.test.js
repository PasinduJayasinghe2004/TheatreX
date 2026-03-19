// ============================================================================
// Patient Demographics Analytics Tests - M3 Day 18
// ============================================================================
// Created by: M3 (Janani) - Day 18
//
// Tests for:
//   GET /api/analytics/patient-demographics - getPatientDemographics
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
describe('Patient Demographics Analytics - M3 Day 18', () => {

    // ── Route mounting verification ──────────────────────────────────────────
    describe('Route mounting verification', () => {

        it('GET /api/analytics/patient-demographics should return 401 without token (route is mounted)', async () => {
            const res = await request(app).get('/api/analytics/patient-demographics');
            expect(res.statusCode).toBe(401);
        });
    });

    // ── GET /api/analytics/patient-demographics ──────────────────────────────
    describe('GET /api/analytics/patient-demographics', () => {

        it('should return 200 with demographics data for authenticated user', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/patient-demographics')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });

        it('response should contain total, gender, bloodType, and ageGroups fields', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/patient-demographics')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            const { data } = res.body;
            expect(data).toHaveProperty('total');
            expect(data).toHaveProperty('gender');
            expect(data).toHaveProperty('bloodType');
            expect(data).toHaveProperty('ageGroups');
            expect(typeof data.total).toBe('number');
            expect(data.total).toBeGreaterThanOrEqual(0);
        });

        it('gender array should have valid entries with gender, count, and percentage', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/patient-demographics')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data.gender)).toBe(true);

            const validGenders = ['male', 'female', 'other'];
            res.body.data.gender.forEach((entry) => {
                expect(validGenders).toContain(entry.gender);
                expect(typeof entry.count).toBe('number');
                expect(entry.count).toBeGreaterThanOrEqual(0);
                expect(typeof entry.percentage).toBe('number');
                expect(entry.percentage).toBeGreaterThanOrEqual(0);
                expect(entry.percentage).toBeLessThanOrEqual(100);
            });
        });

        it('bloodType array should have valid entries with bloodType, count, and percentage', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/patient-demographics')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data.bloodType)).toBe(true);

            res.body.data.bloodType.forEach((entry) => {
                expect(entry).toHaveProperty('bloodType');
                expect(typeof entry.count).toBe('number');
                expect(entry.count).toBeGreaterThanOrEqual(0);
                expect(typeof entry.percentage).toBe('number');
            });
        });

        it('ageGroups array should have valid entries with ageGroup, count, and percentage', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/patient-demographics')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data.ageGroups)).toBe(true);

            const validAgeGroups = ['0-17', '18-30', '31-45', '46-60', '60+', 'Unknown'];
            res.body.data.ageGroups.forEach((entry) => {
                expect(validAgeGroups).toContain(entry.ageGroup);
                expect(typeof entry.count).toBe('number');
                expect(entry.count).toBeGreaterThanOrEqual(0);
                expect(typeof entry.percentage).toBe('number');
            });
        });

        it('percentages within gender should sum close to 100 when patients exist', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/patient-demographics')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            const { gender, total } = res.body.data;

            if (total > 0 && gender.length > 0) {
                const totalPercentage = gender.reduce((sum, g) => sum + g.percentage, 0);
                // Allow for rounding differences
                expect(totalPercentage).toBeGreaterThanOrEqual(99);
                expect(totalPercentage).toBeLessThanOrEqual(101);
            }
        });

        it('gender counts should sum to total patients', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/patient-demographics')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            const { gender, total } = res.body.data;

            const genderTotal = gender.reduce((sum, g) => sum + g.count, 0);
            expect(genderTotal).toBe(total);
        });

        it('should be accessible by nurse role', async () => {
            const token = await getToken('nurse');
            if (!token) return;

            const res = await request(app)
                .get('/api/analytics/patient-demographics')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
