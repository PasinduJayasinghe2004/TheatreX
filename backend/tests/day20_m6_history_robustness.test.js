// ============================================================================
// Surgery History Robustness Tests - M6 Day 20
// ============================================================================
// Created by: M6 (Dinil) - Day 20
//
// Tests for:
//   GET /api/surgeries/history robustness and bug fixes
// ============================================================================

import request from 'supertest';
import app from '../server.js';

const getToken = async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'coordinator@test.com', password: 'Test1234!' });

    return res.body?.data?.token || res.body?.token || null;
};

describe('Surgery History API - M6 Day 20 Robustness', () => {
    it('should clamp very large page numbers to the last available page', async () => {
        const token = await getToken();
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/history?page=9999&limit=5')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('pagination');

        const { pagination } = res.body;
        expect(pagination.page).toBeLessThanOrEqual(pagination.totalPages);
        expect(pagination.page).toBeGreaterThanOrEqual(1);
    });
});
