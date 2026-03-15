import request from 'supertest';
import app from '../server.js';
import { pool } from '../config/database.js';

const getToken = async (role = 'coordinator') => {
    const credentials = {
        coordinator: { email: 'coordinator@test.com', password: 'Test1234!' },
    };
    const cred = credentials[role];
    const res = await request(app).post('/api/auth/login').send(cred);
    return res.body?.data?.token || res.body?.token || null;
};

describe('Analytics API - M2 Day 19 Date Filters', () => {

    it('GET /api/analytics/surgery-status-counts should accept startDate and endDate queries', async () => {
        const token = await getToken('coordinator');
        if (!token) return;

        const res = await request(app)
            .get('/api/analytics/surgery-status-counts?startDate=2024-01-01&endDate=2030-01-01')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('counts');
        expect(res.body.data).toHaveProperty('total');
        expect(res.body.data).toHaveProperty('breakdown');
    });

    it('GET /api/analytics/surgery-status-counts filtered by future date should return 0 counts', async () => {
        const token = await getToken('coordinator');
        if (!token) return;

        // Querying for surgeries specifically scheduled in the year 2099
        const res = await request(app)
            .get('/api/analytics/surgery-status-counts?startDate=2099-01-01&endDate=2099-12-31')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.total).toBe(0);
        expect(res.body.data.counts.scheduled).toBe(0);
    });
});
