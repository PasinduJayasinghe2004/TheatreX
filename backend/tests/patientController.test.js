// ============================================================================
// Patient Controller Tests
// ============================================================================
// Created by: M1 (Pasindu) - Day 15
// Updated by: M4 (Oneli) - Day 15 (added PUT update tests)
//
// Tests for patient API endpoints:
// - GET  /api/patients        (List patients)
// - GET  /api/patients/:id    (Get patient detail)
// - POST /api/patients        (Create patient)
// - PUT  /api/patients/:id    (Update patient)
//
// Run with: npm test -- --testPathPattern=patientController
// ============================================================================

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';


describe('Patient API Tests - Day 15', () => {
    let coordinatorToken;
    let staffToken;
    let createdPatientId;

    const uniqueId = Date.now();

    const coordinatorUser = {
        name: 'Patient Test Coordinator',
        email: `patient.coord${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234567'
    };

    const staffUser = {
        name: 'Patient Test Staff',
        email: `patient.staff${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'surgeon',
        phone: '0771234568'
    };

    const validPatient = {
        name: 'John Doe',
        date_of_birth: '1990-05-15',
        gender: 'male',
        blood_type: 'O+',
        phone: `09${uniqueId}`,
        email: `john.doe${uniqueId}@example.com`,
        address: '123 Main Street, Colombo',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '0771112223',
        emergency_contact_relationship: 'Spouse',
        medical_history: 'No significant history',
        allergies: 'Penicillin',
        current_medications: 'None'
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
    // GET /api/patients - List Patients
    // ========================================================================
    describe('GET /api/patients', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/patients');
            expect(res.statusCode).toBe(401);
        });

        it('should return patient list with coordinator token', async () => {
            const res = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('count');
        });

        it('should allow staff users to view patients', async () => {
            const res = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should support gender filter', async () => {
            const res = await request(app)
                .get('/api/patients?gender=male')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            if (res.body.data.length > 0) {
                res.body.data.forEach(p => {
                    expect(p.gender).toBe('male');
                });
            }
        });

        it('should support blood_type filter', async () => {
            const res = await request(app)
                .get('/api/patients?blood_type=O+')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            if (res.body.data.length > 0) {
                res.body.data.forEach(p => {
                    expect(p.blood_type).toBe('O+');
                });
            }
        });
    });

    // ========================================================================
    // POST /api/patients - Create Patient
    // ========================================================================
    describe('POST /api/patients', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .post('/api/patients')
                .send(validPatient);

            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for staff users (RBAC)', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${staffToken}`)
                .send(validPatient);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when name is missing', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ date_of_birth: '1990-01-01', gender: 'male', phone: '0771111111' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/name/i);
        });

        it('should return 400 when date_of_birth is missing', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test Patient', gender: 'male', phone: '0771111112' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/date of birth/i);
        });

        it('should return 400 when gender is missing', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test Patient', date_of_birth: '1990-01-01', phone: '0771111113' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/gender/i);
        });

        it('should return 400 when phone is missing', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test Patient', date_of_birth: '1990-01-01', gender: 'male' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/phone/i);
        });

        it('should return 400 for invalid gender', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test', date_of_birth: '1990-01-01', gender: 'invalid', phone: '0771111114' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/gender/i);
        });

        it('should return 400 for invalid blood type', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test', date_of_birth: '1990-01-01', gender: 'male', phone: '0771111115', blood_type: 'X+' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/blood type/i);
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test', date_of_birth: '1990-01-01', gender: 'male', phone: '0771111116', email: 'not-an-email' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/email/i);
        });

        it('should create a patient for coordinator', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send(validPatient);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.name).toBe(validPatient.name);
            expect(res.body.data.gender).toBe(validPatient.gender);
            expect(res.body.data.blood_type).toBe(validPatient.blood_type);
            expect(res.body.data.age).toBeGreaterThanOrEqual(0);

            createdPatientId = res.body.data.id;
        });

        it('should return 409 for duplicate phone number', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send(validPatient); // same phone as above

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    // ========================================================================
    // GET /api/patients/:id - Get Patient by ID
    // ========================================================================
    describe('GET /api/patients/:id', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/patients/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 404 for non-existent patient', async () => {
            const res = await request(app)
                .get('/api/patients/99999999')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return patient detail for created patient', async () => {
            if (!createdPatientId) return;

            const res = await request(app)
                .get(`/api/patients/${createdPatientId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id', createdPatientId);
            expect(res.body.data).toHaveProperty('name');
            expect(res.body.data).toHaveProperty('date_of_birth');
            expect(res.body.data).toHaveProperty('gender');
            expect(res.body.data).toHaveProperty('phone');
        });

        it('should allow staff users to view a patient', async () => {
            if (!createdPatientId) return;

            const res = await request(app)
                .get(`/api/patients/${createdPatientId}`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ========================================================================
    // PUT /api/patients/:id - Update Patient
    // ========================================================================
    describe('PUT /api/patients/:id', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .put('/api/patients/1')
                .send({ name: 'Updated Name' });

            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for staff users (RBAC)', async () => {
            if (!createdPatientId) return;

            const res = await request(app)
                .put(`/api/patients/${createdPatientId}`)
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ name: 'Updated Name' });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 for non-existent patient', async () => {
            const res = await request(app)
                .put('/api/patients/99999999')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Updated Name' });

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for empty body (no fields)', async () => {
            if (!createdPatientId) return;

            const res = await request(app)
                .put(`/api/patients/${createdPatientId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/no fields/i);
        });

        it('should return 400 for invalid gender', async () => {
            if (!createdPatientId) return;

            const res = await request(app)
                .put(`/api/patients/${createdPatientId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ gender: 'invalid' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/gender/i);
        });

        it('should return 400 for invalid blood type', async () => {
            if (!createdPatientId) return;

            const res = await request(app)
                .put(`/api/patients/${createdPatientId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ blood_type: 'Z+' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/blood type/i);
        });

        it('should successfully update patient name and phone', async () => {
            if (!createdPatientId) return;

            const updatedPhone = `08${uniqueId}`;
            const res = await request(app)
                .put(`/api/patients/${createdPatientId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({
                    name: 'John Doe Updated',
                    phone: updatedPhone,
                    allergies: 'Penicillin, Latex'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('John Doe Updated');
            expect(res.body.data.phone).toBe(updatedPhone);
            expect(res.body.data.allergies).toBe('Penicillin, Latex');
            expect(res.body.data.id).toBe(createdPatientId);
        });
    });
});
