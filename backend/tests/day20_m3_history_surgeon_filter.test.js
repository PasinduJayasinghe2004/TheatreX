// ============================================================================
// Surgery History Surgeon Filter API Tests - M3 Day 20
// ============================================================================
// Created by: M3 (Janani) - Day 20
//
// Tests for:
//   GET /api/surgeries/history?surgeonId=...
// ============================================================================

import request from 'supertest';
import app from '../server.js';

const getToken = async () => {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'coordinator@test.com', password: 'Test1234!' });

    return res.body?.data?.token || res.body?.token || null;
};

describe('Surgery History API - M3 Day 20 Surgeon Filter', () => {
    it('should return 400 when surgeonId is invalid', async () => {
        const token = await getToken();
        if (!token) return;

        const res = await request(app)
            .get('/api/surgeries/history?surgeonId=abc')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should accept a valid surgeonId and return filtered completed surgeries', async () => {
        const token = await getToken();
        if (!token) return;

        const surgeonsRes = await request(app)
            .get('/api/surgeries/surgeons')
            .set('Authorization', `Bearer ${token}`);

        expect(surgeonsRes.statusCode).toBe(200);
        expect(surgeonsRes.body.success).toBe(true);

        if (!Array.isArray(surgeonsRes.body.data) || surgeonsRes.body.data.length === 0) {
            return;
        }

        const surgeonId = surgeonsRes.body.data[0].id;

        const res = await request(app)
            .get(`/api/surgeries/history?surgeonId=${surgeonId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);

        res.body.data.forEach((row) => {
            expect(row.status).toBe('completed');
            expect(row.surgeon_id).toBe(surgeonId);
        });
    });
});
