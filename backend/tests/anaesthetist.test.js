import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

describe('Anaesthetist API Tests', () => {
    let adminToken;
    let coordinatorToken;
    let testAnaesthetistId;

    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const adminUser = {
        name: 'Anaesthetist Test Admin',
        email: `anaes.admin${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'admin',
        phone: '0771234560'
    };

    const coordinatorUser = {
        name: 'Anaesthetist Test Coordinator',
        email: `anaes.coord${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234561'
    };

    beforeAll(async () => {
        // Register and login admin
        await request(app).post('/api/auth/register').send(adminUser);
        const adminLogin = await request(app).post('/api/auth/login').send({
            email: adminUser.email,
            password: adminUser.password
        });
        adminToken = adminLogin.body.token;

        // Register and login coordinator
        await request(app).post('/api/auth/register').send(coordinatorUser);
        const coordLogin = await request(app).post('/api/auth/login').send({
            email: coordinatorUser.email,
            password: coordinatorUser.password
        });
        coordinatorToken = coordLogin.body.token;
    });

    describe('POST /api/anaesthetists', () => {
        it('should return 403 for coordinator (Admin only)', async () => {
            const res = await request(app)
                .post('/api/anaesthetists')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({
                    name: 'Dr. Test Anaes',
                    email: `test.anaes${uniqueId}@hospital.com`,
                    specialization: 'General',
                    license_number: `LIC-${uniqueId}`
                });
            expect(res.statusCode).toBe(403);
        });

        it('should create a new anaesthetist for admin', async () => {
            const res = await request(app)
                .post('/api/anaesthetists')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Dr. Test Anaes',
                    email: `test.anaes${uniqueId}@hospital.com`,
                    specialization: 'General',
                    license_number: `LIC-${uniqueId}`,
                    phone: '1234567890',
                    shift_preference: 'morning'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Dr. Test Anaes');
            testAnaesthetistId = res.body.data.id;
        });
    });

    describe('GET /api/anaesthetists', () => {
        it('should return all anaesthetists for coordinator', async () => {
            const res = await request(app)
                .get('/api/anaesthetists')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/anaesthetists/available', () => {
        it('should return available anaesthetists', async () => {
            const res = await request(app)
                .get('/api/anaesthetists/available')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('PUT /api/anaesthetists/:id/availability', () => {
        it('should update availability', async () => {
            if (!testAnaesthetistId) return;

            const res = await request(app)
                .put(`/api/anaesthetists/${testAnaesthetistId}/availability`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ is_available: false });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
