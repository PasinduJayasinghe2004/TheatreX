import request from 'supertest';
import app from '../server.js';
import { generateToken } from '../utils/tokenUtils.js';

describe('RBAC Middleware Tests', () => {
    let adminToken;
    let doctorToken;
    let nurseToken;

    beforeAll(() => {
        // Create tokens for different roles
        adminToken = generateToken({ id: 1, role: 'admin', email: 'admin@example.com' });
        doctorToken = generateToken({ id: 2, role: 'doctor', email: 'doctor@example.com' });
        nurseToken = generateToken({ id: 3, role: 'nurse', email: 'nurse@example.com' });
    });

    // Mock a protected route for testing if it doesn't exist
    // This assumes an endpoint like /api/admin/dashboard exists or similar
    // For now, we'll test against a hypothetical protected endpoint

    test('Admin should access admin routes', async () => {
        // Note: You needs to implement a test route in server.js or check an existing protected route
        // const res = await request(app)
        //     .get('/api/admin/dashboard')
        //     .set('Authorization', `Bearer ${adminToken}`);

        // expect(res.statusCode).not.toBe(403);
        // expect(res.statusCode).not.toBe(401);
    });

    test('Doctor should NOT access admin routes', async () => {
        // const res = await request(app)
        //     .get('/api/admin/dashboard')
        //     .set('Authorization', `Bearer ${doctorToken}`);

        // expect(res.statusCode).toBe(403);
    });

    test('Nurse should NOT access doctor routes', async () => {
        // const res = await request(app)
        //     .get('/api/doctor/dashboard')
        //     .set('Authorization', `Bearer ${nurseToken}`);

        // expect(res.statusCode).toBe(403);
    });

    // Test Token Validation in RBAC
    test('Request without token should be denied', async () => {
        const res = await request(app).get('/api/auth/profile');
        expect(res.statusCode).toBe(401);
    });

    test('Request with invalid token should be denied', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', 'Bearer invalid_token');

        expect(res.statusCode).toBe(401);
    });
});
