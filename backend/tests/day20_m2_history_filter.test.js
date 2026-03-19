// ============================================================================
// Surgery History Date Filter API Tests - M2 Day 20
// ============================================================================
// Created by: M2 (Chandeepa) - Day 20
//
// Tests for:
//   GET /api/surgeries/history?startDate=...&endDate=...
// ============================================================================

import request from 'supertest';
import app from '../server.js';

const getToken = async (role = 'coordinator') => {
    const credentials = {
        coordinator: { email: 'coordinator@test.com', password: 'Test1234!' }
    };

    const cred = credentials[role];
    const res = await request(app).post('/api/auth/login').send(cred);
    return res.body?.data?.token || res.body?.token || null;
};

describe('Surgery History API - M2 Day 20 Date Filter', () => {
    it('should accept startDate and endDate query params', async () => {
        const token = await getToken('coordinator');
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/history?startDate=2024-01-01&endDate=2030-01-01')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return empty list for future range with no history records', async () => {
        const token = await getToken('coordinator');
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/history?startDate=2099-01-01&endDate=2099-12-31')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(0);
        expect(res.body.data).toEqual([]);
    });
});
