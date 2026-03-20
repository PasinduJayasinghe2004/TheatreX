// ============================================================================
// Surgery Export API Tests - Day 21
// ============================================================================
// Tests for:
//   GET /api/surgeries/history/export/csv
//   GET /api/surgeries/:id/export/csv
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

describe('Surgery Export API - Day 21', () => {
    it('GET /api/surgeries/history/export/csv should return 401 without token', async () => {
        const res = await request(app).get('/api/surgeries/history/export/csv');
        expect(res.statusCode).toBe(401);
    });

    it('should export filtered history CSV for authenticated users', async () => {
        const token = await getToken('coordinator');
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/history/export/csv?startDate=2020-01-01&endDate=2100-01-01')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toContain('text/csv');
        expect(res.headers['content-disposition']).toContain('attachment;');
    });

    it('should reject invalid surgery id on detail export', async () => {
        const token = await getToken('coordinator');
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/abc/export/csv')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
