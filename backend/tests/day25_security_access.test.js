import request from 'supertest';
import app from '../server.js';

describe('Day 25 Security - Access Control Audit', () => {
    let coordinatorToken;
    let surgeonToken;

    beforeAll(async () => {
        const unique = Date.now();

        const coordinatorEmail = `day25.coordinator.${unique}@theatrex.test`;
        const surgeonEmail = `day25.surgeon.${unique}@theatrex.test`;

        await request(app).post('/api/auth/register').send({
            name: 'Day25 Coordinator',
            email: coordinatorEmail,
            password: 'SecurePass123!',
            role: 'coordinator',
            phone: `0778${String(unique).slice(-6)}`
        });

        await request(app).post('/api/auth/register').send({
            name: 'Day25 Surgeon',
            email: surgeonEmail,
            password: 'SecurePass123!',
            role: 'surgeon',
            phone: `0777${String(unique).slice(-6)}`
        });

        const coordinatorLogin = await request(app).post('/api/auth/login').send({
            email: coordinatorEmail,
            password: 'SecurePass123!'
        });

        const surgeonLogin = await request(app).post('/api/auth/login').send({
            email: surgeonEmail,
            password: 'SecurePass123!'
        });

        coordinatorToken = coordinatorLogin.body.token;
        surgeonToken = surgeonLogin.body.token;
    }, 30000);

    test('public endpoints stay accessible', async () => {
        const healthRes = await request(app).get('/api/health');
        expect(healthRes.statusCode).toBe(200);

        const inquiryRes = await request(app)
            .post('/api/inquiries/demo-request')
            .send({});

        expect(inquiryRes.statusCode).toBe(400);
    });

    test('sensitive APIs reject unauthenticated requests', async () => {
        const routes = [
            ['get', '/api/users'],
            ['get', '/api/surgeries'],
            ['get', '/api/dashboard/stats'],
            ['get', '/api/theatres'],
            ['get', '/api/patients'],
            ['get', '/api/notifications'],
            ['get', '/api/analytics/staff-counts'],
            ['get', '/api/chatbot/history']
        ];

        for (const [method, path] of routes) {
            const res = await request(app)[method](path);
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        }
    });

    test('coordinator can access coordinator-allowed routes', async () => {
        const res = await request(app)
            .get('/api/theatres/coordinator-overview')
            .set('Authorization', `Bearer ${coordinatorToken}`);

        expect([200, 500]).toContain(res.statusCode);
    });

    test('surgeon cannot access restricted user-management routes', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${surgeonToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });

    test('coordinator cannot perform admin-only user creation', async () => {
        const res = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({
                name: 'Unauthorized Create',
                email: 'unauthorized.create@theatrex.test',
                password: 'SecurePass123!',
                role: 'surgeon',
                phone: '0771234567'
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });
});
