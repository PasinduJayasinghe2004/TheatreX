// ============================================================================
// Technician Controller Tests
// ============================================================================
// Created by: M4 (Oneli) - Day 14
//
// Tests for technician API endpoints (full CRUD):
// - GET    /api/technicians        (List technicians)
// - GET    /api/technicians/:id    (Get technician detail)
// - POST   /api/technicians        (Create technician)
// - PUT    /api/technicians/:id    (Update technician)
// - DELETE /api/technicians/:id    (Soft-delete technician)
//
// Run with: npm test -- --testPathPattern=technicianController
// ============================================================================

import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

describe('Technician API Tests - Day 14', () => {
    let coordinatorToken;
    let staffToken;
    let createdTechnicianId;

    const uniqueId = Date.now();

    const coordinatorUser = {
        name: 'Tech Test Coordinator',
        email: `tech.coord${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234567'
    };

    const staffUser = {
        name: 'Tech Test Surgeon',
        email: `tech.surgeon${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'surgeon',
        phone: '0771234568'
    };

    const validTechnician = {
        name: 'John Technician',
        email: `john.tech${uniqueId}@hospital.com`,
        phone: '0771234591',
        specialization: 'Equipment Maintenance',
        license_number: `TN-${uniqueId}`,
        years_of_experience: 3,
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
    });

    // ========================================================================
    // GET /api/technicians - List Technicians
    // ========================================================================
    describe('GET /api/technicians', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/technicians');
            expect(res.statusCode).toBe(401);
        });

        it('should return technician list with coordinator token', async () => {
            const res = await request(app)
                .get('/api/technicians')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('count');
        });

        it('should allow staff users to view technicians', async () => {
            const res = await request(app)
                .get('/api/technicians')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should support is_available filter', async () => {
            const res = await request(app)
                .get('/api/technicians?is_available=true')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            if (res.body.data.length > 0) {
                res.body.data.forEach(t => {
                    expect(t.is_available).toBe(true);
                });
            }
        });
    });

    // ========================================================================
    // POST /api/technicians - Create Technician
    // ========================================================================
    describe('POST /api/technicians', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .post('/api/technicians')
                .send(validTechnician);

            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for staff users (RBAC)', async () => {
            const res = await request(app)
                .post('/api/technicians')
                .set('Authorization', `Bearer ${staffToken}`)
                .send(validTechnician);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when name is missing', async () => {
            const res = await request(app)
                .post('/api/technicians')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ email: 'test@test.com' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/name/i);
        });

        it('should return 400 when email is missing', async () => {
            const res = await request(app)
                .post('/api/technicians')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test Tech' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/email/i);
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/technicians')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test Tech', email: 'not-an-email' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid shift_preference', async () => {
            const res = await request(app)
                .post('/api/technicians')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test Tech', email: 'valid@test.com', shift_preference: 'invalid' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should create a technician for coordinator', async () => {
            const res = await request(app)
                .post('/api/technicians')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send(validTechnician);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.name).toBe(validTechnician.name);
            expect(res.body.data.specialization).toBe(validTechnician.specialization);
            expect(res.body.data.shift_preference).toBe(validTechnician.shift_preference);

            createdTechnicianId = res.body.data.id;
        });

        it('should return 409 for duplicate email', async () => {
            const res = await request(app)
                .post('/api/technicians')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send(validTechnician); // same email as above

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================================================
    // GET /api/technicians/:id - Get Technician by ID
    // ========================================================================
    describe('GET /api/technicians/:id', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/technicians/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 404 for non-existent technician', async () => {
            const res = await request(app)
                .get('/api/technicians/99999999')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return technician detail for created technician', async () => {
            if (!createdTechnicianId) return;

            const res = await request(app)
                .get(`/api/technicians/${createdTechnicianId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id', createdTechnicianId);
            expect(res.body.data).toHaveProperty('name');
            expect(res.body.data).toHaveProperty('email');
            expect(res.body.data).toHaveProperty('specialization');
        });

        it('should allow staff users to view a technician', async () => {
            if (!createdTechnicianId) return;

            const res = await request(app)
                .get(`/api/technicians/${createdTechnicianId}`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ========================================================================
    // PUT /api/technicians/:id - Update Technician
    // ========================================================================
    describe('PUT /api/technicians/:id', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .put('/api/technicians/1')
                .send({ name: 'Updated' });

            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for staff users (RBAC)', async () => {
            if (!createdTechnicianId) return;

            const res = await request(app)
                .put(`/api/technicians/${createdTechnicianId}`)
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ name: 'Updated' });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 for non-existent technician', async () => {
            const res = await request(app)
                .put('/api/technicians/99999999')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Updated' });

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when no fields provided', async () => {
            if (!createdTechnicianId) return;

            const res = await request(app)
                .put(`/api/technicians/${createdTechnicianId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should update technician fields', async () => {
            if (!createdTechnicianId) return;

            const res = await request(app)
                .put(`/api/technicians/${createdTechnicianId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({
                    name: 'John Updated',
                    specialization: 'Biomedical Equipment',
                    shift_preference: 'night'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('John Updated');
            expect(res.body.data.specialization).toBe('Biomedical Equipment');
            expect(res.body.data.shift_preference).toBe('night');
        });
    });

    // ========================================================================
    // DELETE /api/technicians/:id - Soft-delete Technician
    // ========================================================================
    describe('DELETE /api/technicians/:id', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).delete('/api/technicians/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for staff users (RBAC)', async () => {
            if (!createdTechnicianId) return;

            const res = await request(app)
                .delete(`/api/technicians/${createdTechnicianId}`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 for non-existent technician', async () => {
            const res = await request(app)
                .delete('/api/technicians/99999999')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should soft-delete the technician', async () => {
            if (!createdTechnicianId) return;

            const res = await request(app)
                .delete(`/api/technicians/${createdTechnicianId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/deleted/i);
        });

        it('should not show deleted technician in list', async () => {
            if (!createdTechnicianId) return;

            const res = await request(app)
                .get('/api/technicians')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            const found = res.body.data.find(t => t.id === createdTechnicianId);
            expect(found).toBeUndefined();
        });
    });
});
