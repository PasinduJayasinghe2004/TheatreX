// ============================================================================
// Surgery History Pagination API Tests - M5 Day 20
// ============================================================================
// Created by: M5 (User) - Day 20
//
// Tests for:
//   GET /api/surgeries/history?page=...&limit=...
// ============================================================================

import request from 'supertest';
import app from '../server.js';

const getToken = async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'coordinator@test.com', password: 'Test1234!' });

    return res.body?.data?.token || res.body?.token || null;
};

describe('Surgery History API - M5 Day 20 Pagination', () => {
    it('should return 400 when page is invalid', async () => {
        const token = await getToken();
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/history?page=0&limit=10')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should return pagination metadata for valid page and limit', async () => {
        const token = await getToken();
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/history?page=1&limit=5')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.pagination).toMatchObject({
            page: 1,
            limit: 5
        });
        expect(typeof res.body.pagination.total).toBe('number');
        expect(typeof res.body.pagination.totalPages).toBe('number');
        expect(typeof res.body.pagination.hasNextPage).toBe('boolean');
        expect(typeof res.body.pagination.hasPrevPage).toBe('boolean');
    });
});
