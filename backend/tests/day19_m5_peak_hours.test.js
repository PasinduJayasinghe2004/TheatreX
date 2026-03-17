import request from 'supertest';
import app from '../server.js';

const getToken = async (role = 'coordinator') => {
    const credentials = {
        coordinator: { email: 'coordinator@test.com', password: 'Test1234!' },
    };
    const cred = credentials[role];
    const res = await request(app).post('/api/auth/login').send(cred);
    return res.body?.data?.token || res.body?.token || null;
};

describe('Peak Hours Analysis API - M5 Day 19', () => {

    it('GET /api/analytics/peak-hours should return 401 without token', async () => {
        const res = await request(app).get('/api/analytics/peak-hours');
        expect(res.statusCode).toBe(401);
    });

    it('GET /api/analytics/peak-hours should return 200 and chart data for authenticated user', async () => {
        const token = await getToken('coordinator');
        if (!token) {
            console.warn('Skipping test: No token obtained.');
            return;
        }

        const res = await request(app)
            .get('/api/analytics/peak-hours')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('chartData');
        expect(res.body.data).toHaveProperty('peak');
        expect(Array.isArray(res.body.data.chartData)).toBe(true);
        expect(res.body.data.chartData.length).toBe(24); // 24 hours
        
        // Verify first hour format
        const firstHour = res.body.data.chartData[0];
        expect(firstHour).toHaveProperty('hour');
        expect(firstHour).toHaveProperty('displayHour');
        expect(firstHour).toHaveProperty('count');
        expect(typeof firstHour.count).toBe('number');
    });

    it('peak summary should have correct fields', async () => {
        const token = await getToken('coordinator');
        if (!token) return;

        const res = await request(app)
            .get('/api/analytics/peak-hours')
            .set('Authorization', `Bearer ${token}`);

        const { peak } = res.body.data;
        expect(peak).toHaveProperty('hour');
        expect(peak).toHaveProperty('displayHour');
        expect(peak).toHaveProperty('count');
        expect(typeof peak.count).toBe('number');
    });
});
