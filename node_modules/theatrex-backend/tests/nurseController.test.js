// ============================================================================
// Nurse Controller Tests
// ============================================================================
// Created by: M4 (Oneli) - Day 13
//
// Tests for nurse API endpoints:
// - GET  /api/nurses        (List nurses)
// - GET  /api/nurses/:id    (Get nurse detail)
// - POST /api/nurses        (Create nurse)
//
// Run with: npm test -- --testPathPattern=nurseController
// ============================================================================

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

describe('Nurse API Tests - Day 13', () => {
    let coordinatorToken;
    let staffToken;
    let createdNurseId;

    const uniqueId = Date.now();

    const coordinatorUser = {
        name: 'Nurse Test Coordinator',
        email: `nurse.coord${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234567'
    };

    const staffUser = {
        name: 'Nurse Test Staff',
        email: `nurse.staff${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'nurse',
        phone: '0771234568'
    };

    const validNurse = {
        name: 'Jane Nurse',
        email: `jane.nurse${uniqueId}@hospital.com`,
        phone: '0771234590',
        specialization: 'ICU',
        license_number: `LN-${uniqueId}`,
        years_of_experience: 5,
        shift_preference: 'morning'
    };

    // ========================================================================
    // Setup: Register and login test users
    // ========================================================================
    beforeAll(async () => {
        await request(app).post('/api/auth/register').send(coordinatorUser);
        const coordLogin = await request(app).post('/api/auth/login').send({
            email: coordinatorUser.email,
            password: coordinatorUser.password
        });
        coordinatorToken = coordLogin.body.token;

        await request(app).post('/api/auth/register').send(staffUser);
        const staffLogin = await request(app).post('/api/auth/login').send({
            email: staffUser.email,
            password: staffUser.password
        });
        staffToken = staffLogin.body.token;
    }, 30000);

    // ========================================================================
    // GET /api/nurses - List Nurses
    // ========================================================================
    describe('GET /api/nurses', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/nurses');
            expect(res.statusCode).toBe(401);
        });

        it('should return nurse list with coordinator token', async () => {
            const res = await request(app)
                .get('/api/nurses')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('count');
        });

        it('should allow staff users to view nurses', async () => {
            const res = await request(app)
                .get('/api/nurses')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should support is_available filter', async () => {
            const res = await request(app)
                .get('/api/nurses?is_available=true')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            if (res.body.data.length > 0) {
                res.body.data.forEach(n => {
                    expect(n.is_available).toBe(true);
                });
            }
        });
    });

    // ========================================================================
    // POST /api/nurses - Create Nurse
    // ========================================================================
    describe('POST /api/nurses', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .post('/api/nurses')
                .send(validNurse);

            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for staff users (RBAC)', async () => {
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${staffToken}`)
                .send(validNurse);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when name is missing', async () => {
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ email: 'test@test.com' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            // Validation middleware puts field messages in the 'errors' array
            expect(JSON.stringify(res.body.errors)).toMatch(/name/i);
        });

        it('should return 400 when email is missing', async () => {
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test Nurse' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            // Validation middleware puts field messages in the 'errors' array
            expect(JSON.stringify(res.body.errors)).toMatch(/email/i);
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test Nurse', email: 'not-an-email' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid shift_preference', async () => {
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test Nurse', email: 'valid@test.com', shift_preference: 'invalid' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should create a nurse for coordinator', async () => {
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send(validNurse);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.name).toBe(validNurse.name);
            expect(res.body.data.specialization).toBe(validNurse.specialization);
            expect(res.body.data.shift_preference).toBe(validNurse.shift_preference);

            createdNurseId = res.body.data.id;
        });

        it('should return 409 for duplicate email', async () => {
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send(validNurse); // same email as above

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================================================
    // GET /api/nurses/:id - Get Nurse by ID
    // ========================================================================
    describe('GET /api/nurses/:id', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/nurses/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 404 for non-existent nurse', async () => {
            const res = await request(app)
                .get('/api/nurses/99999999')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return nurse detail for created nurse', async () => {
            if (!createdNurseId) return;

            const res = await request(app)
                .get(`/api/nurses/${createdNurseId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id', createdNurseId);
            expect(res.body.data).toHaveProperty('name');
            expect(res.body.data).toHaveProperty('email');
            expect(res.body.data).toHaveProperty('specialization');
        });

        it('should allow staff users to view a nurse', async () => {
            if (!createdNurseId) return;

            const res = await request(app)
                .get(`/api/nurses/${createdNurseId}`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
