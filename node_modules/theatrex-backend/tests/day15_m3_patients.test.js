// ============================================================================
// Patient Detail Tests - M3 Day 15
// ============================================================================
// Created by: M3 (Janani) - Day 15
//
// Tests for:
//   GET /api/patients/:id  - getPatientById  (with surgery history)
//   GET /api/patients       - getPatients     (route mount verification)
// ============================================================================

import request from 'supertest';
import app from '../server.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getToken = async (role = 'coordinator') => {
    const credentials = {
        coordinator: { email: 'coordinator@test.com', password: 'Test1234!' },
        admin: { email: 'admin@test.com', password: 'Test1234!' },
        nurse: { email: 'staff@test.com', password: 'Test1234!' },
    };
    const cred = credentials[role];
    const res = await request(app).post('/api/auth/login').send(cred);
    return res.body?.data?.token || res.body?.token || null;
};

/**
 * Creates a patient as coordinator and returns the created patient object.
 */
const createTestPatient = async (token, overrides = {}) => {
    const ts = Date.now();
    const data = {
        name: `Patient M3 ${ts}`,
        date_of_birth: '1985-08-20',
        gender: 'female',
        blood_type: 'B+',
        phone: `076${String(ts).slice(-7)}`,
        email: `m3.patient.${ts}@hospital.com`,
        address: '456 Test Lane, Kandy',
        emergency_contact_name: 'EC Person',
        emergency_contact_phone: '0779998877',
        emergency_contact_relationship: 'Parent',
        medical_history: 'Asthma',
        allergies: 'Penicillin, Latex',
        current_medications: 'Salbutamol inhaler',
        ...overrides,
    };
    const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send(data);
    return res.body?.data;
};

// ─────────────────────────────────────────────────────────────────────────────
describe('Patient Detail API - M3 Day 15', () => {

    // ── Verify routes are mounted ─────────────────────────────────────────────
    describe('Route mounting verification', () => {

        it('GET /api/patients should return 401 without token (route is mounted)', async () => {
            const res = await request(app).get('/api/patients');
            expect(res.statusCode).toBe(401);
        });

        it('GET /api/patients should return 200 with a valid token', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('POST /api/patients should return 401 without token (route is mounted)', async () => {
            const res = await request(app)
                .post('/api/patients')
                .send({ name: 'Test', date_of_birth: '2000-01-01', gender: 'male', phone: '0771111111' });
            expect(res.statusCode).toBe(401);
        });
    });

    // ── GET /api/patients/:id ─────────────────────────────────────────────────
    describe('GET /api/patients/:id', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/patients/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 404 for a non-existent patient ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .get('/api/patients/999999999')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('not found');
        });

        it('should return patient data for a valid ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;

            const res = await request(app)
                .get(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(patient.id);
            expect(res.body.data.name).toBe(patient.name);
        });

        it('should include all patient fields in the response', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;

            const res = await request(app)
                .get(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);

            const data = res.body.data;
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('name');
            expect(data).toHaveProperty('date_of_birth');
            expect(data).toHaveProperty('age');
            expect(data).toHaveProperty('gender');
            expect(data).toHaveProperty('blood_type');
            expect(data).toHaveProperty('phone');
            expect(data).toHaveProperty('email');
            expect(data).toHaveProperty('address');
            expect(data).toHaveProperty('emergency_contact_name');
            expect(data).toHaveProperty('emergency_contact_phone');
            expect(data).toHaveProperty('emergency_contact_relationship');
            expect(data).toHaveProperty('medical_history');
            expect(data).toHaveProperty('allergies');
            expect(data).toHaveProperty('current_medications');
            expect(data).toHaveProperty('is_active');
            expect(data).toHaveProperty('created_at');
            expect(data).toHaveProperty('updated_at');
        });

        it('should include a surgeries array in the response', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;

            const res = await request(app)
                .get(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data.surgeries)).toBe(true);
        });

        it('should allow a non-coordinator user to view patient detail', async () => {
            const coordToken = await getToken('coordinator');
            const nurseToken = await getToken('nurse');
            if (!coordToken || !nurseToken) return;

            const patient = await createTestPatient(coordToken);
            if (!patient) return;

            const res = await request(app)
                .get(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${nurseToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(patient.id);
        });

        it('should return correct field values that were sent during creation', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const ts = Date.now();
            const input = {
                name: `Detail Check ${ts}`,
                date_of_birth: '1992-03-10',
                gender: 'male',
                blood_type: 'O+',
                phone: `078${String(ts).slice(-7)}`,
                email: `detail.check.${ts}@test.com`,
                address: '789 Unit Test Road',
                emergency_contact_name: 'Jane Test',
                emergency_contact_phone: '0771234567',
                emergency_contact_relationship: 'Sibling',
                medical_history: 'Diabetes Type 2',
                allergies: 'Sulfa',
                current_medications: 'Metformin 500mg',
            };

            const createRes = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${token}`)
                .send(input);
            const createdId = createRes.body?.data?.id;
            if (!createdId) return;

            const res = await request(app)
                .get(`/api/patients/${createdId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            const data = res.body.data;
            expect(data.name).toBe(input.name);
            expect(data.gender).toBe(input.gender);
            expect(data.blood_type).toBe(input.blood_type);
            expect(data.phone).toBe(input.phone);
            expect(data.email).toBe(input.email.toLowerCase());
            expect(data.address).toBe(input.address);
            expect(data.emergency_contact_name).toBe(input.emergency_contact_name);
            expect(data.medical_history).toBe(input.medical_history);
            expect(data.allergies).toBe(input.allergies);
            expect(data.current_medications).toBe(input.current_medications);
            expect(data.is_active).toBe(true);
        });

        it('should return surgeries as an empty array for a new patient', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;

            const res = await request(app)
                .get(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.data.surgeries).toEqual([]);
        });
    });
});
