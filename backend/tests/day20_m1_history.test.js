// ============================================================================
// Surgery History API Tests - M1 Day 20
// ============================================================================
// Created by: M1 (Pasindu) - Day 20
//
// Tests for:
//   GET /api/surgeries/history
// ============================================================================

import request from 'supertest';
import app from '../server.js';

const getToken = async (role = 'coordinator') => {
    const credentials = {
        coordinator: { email: 'coordinator@test.com', password: 'Test1234!' },
        admin: { email: 'admin@test.com', password: 'Test1234!' }
    };

    const cred = credentials[role];
    const res = await request(app).post('/api/auth/login').send(cred);
    return res.body?.data?.token || res.body?.token || null;
};

describe('Surgery History API - M1 Day 20', () => {

    it('GET /api/surgeries/history should return 401 without token (route mounted)', async () => {
        const res = await request(app).get('/api/surgeries/history');
        expect(res.statusCode).toBe(401);
    });

    it('should return completed surgeries list for authenticated users', async () => {
        const token = await getToken('coordinator');
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/history')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(typeof res.body.count).toBe('number');

        // If rows exist, each entry must belong to completed history.
        res.body.data.forEach((row) => {
            expect(row).toHaveProperty('id');
            expect(row).toHaveProperty('status');
            expect(row.status).toBe('completed');
            expect(row).toHaveProperty('scheduled_date');
            expect(row).toHaveProperty('scheduled_time');
            expect(row).toHaveProperty('surgery_type');
        });
    });

    it('should be accessible for admin role as well', async () => {
        const token = await getToken('admin');
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/history')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
