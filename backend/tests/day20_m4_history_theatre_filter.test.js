// ============================================================================
// Surgery History Theatre Filter API Tests - M4 Day 20
// ============================================================================
// Created by: M4 (Oneli) - Day 20
//
// Tests for:
//   GET /api/surgeries/history?theatreId=...
// ============================================================================

import request from 'supertest';
import app from '../server.js';

const getToken = async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'coordinator@test.com', password: 'Test1234!' });

    return res.body?.data?.token || res.body?.token || null;
};

describe('Surgery History API - M4 Day 20 Theatre Filter', () => {
    it('should return 400 when theatreId is invalid', async () => {
        const token = await getToken();
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/history?theatreId=abc')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should accept a valid theatreId and return filtered completed surgeries', async () => {
        const token = await getToken();
        if (!token) return;

        const theatresRes = await request(app)
            .get('/api/theatres')
            .set('Authorization', `Bearer ${token}`);

        expect(theatresRes.statusCode).toBe(200);
        expect(theatresRes.body.success).toBe(true);

        if (!Array.isArray(theatresRes.body.data) || theatresRes.body.data.length === 0) {
            return;
        }

        const theatreId = theatresRes.body.data[0].id;

        const res = await request(app)
            .get(`/api/surgeries/history?theatreId=${theatreId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);

        res.body.data.forEach((row) => {
            expect(row.status).toBe('completed');
            expect(row.theatre_id).toBe(theatreId);
        });
    });
});
