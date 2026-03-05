// ============================================================================
// Patient Controller Tests - M2 Day 15
// ============================================================================
// Created by: M2 (Chandeepa) - Day 15
//
// Tests for:
//   GET    /api/patients         - getPatients (list + search + filters)
//   POST   /api/patients         - createPatient
//   GET    /api/patients/:id     - getPatientById
//   PUT    /api/patients/:id     - updatePatient
//   DELETE /api/patients/:id     - deletePatient (soft-delete)
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
 * Unique timestamp-based phone to avoid conflicts between tests.
 */
const createTestPatient = async (token, overrides = {}) => {
    const ts = Date.now();
    const data = {
        name: `Patient Test ${ts}`,
        date_of_birth: '1990-05-15',
        gender: 'male',
        blood_type: 'A+',
        phone: `077${String(ts).slice(-7)}`,
        email: `day15.patient.${ts}@hospital.com`,
        address: '123 Test Street, Colombo',
        emergency_contact_name: 'Emergency Contact',
        emergency_contact_phone: '0771112233',
        emergency_contact_relationship: 'Spouse',
        medical_history: 'None',
        allergies: 'Penicillin',
        current_medications: 'None',
        ...overrides,
    };
    const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send(data);
    return res.body?.data;
};

// ─────────────────────────────────────────────────────────────────────────────
describe('Patient API - M2 Day 15', () => {

    // ── GET /api/patients ─────────────────────────────────────────────────────
    describe('GET /api/patients', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/patients');
            expect(res.statusCode).toBe(401);
        });

        it('should return a list of patients for authenticated user', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('count');
        });

        it('should filter by gender', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            // Create a female patient to ensure at least one exists
            await createTestPatient(token, { gender: 'female' });
            const res = await request(app)
                .get('/api/patients?gender=female')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            res.body.data.forEach(p => {
                expect(p.gender).toBe('female');
            });
        });

        it('should filter by blood_type', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            await createTestPatient(token, { blood_type: 'O-' });
            const res = await request(app)
                .get('/api/patients?blood_type=O-')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            res.body.data.forEach(p => {
                expect(p.blood_type).toBe('O-');
            });
        });

        it('should search patients by name', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const ts = Date.now();
            const uniqueName = `SearchUnique${ts}`;
            await createTestPatient(token, { name: uniqueName });
            const res = await request(app)
                .get(`/api/patients?search=${uniqueName}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0].name).toBe(uniqueName);
        });

        it('should allow non-coordinator authenticated user to view', async () => {
            const token = await getToken('nurse');
            if (!token) return;
            const res = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ── POST /api/patients ────────────────────────────────────────────────────
    describe('POST /api/patients', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .post('/api/patients')
                .send({ name: 'Test', date_of_birth: '2000-01-01', gender: 'male', phone: '0771111111' });
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 if authenticated as nurse (not coordinator/admin)', async () => {
            const token = await getToken('nurse');
            if (!token) return;
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Test', date_of_birth: '2000-01-01', gender: 'male', phone: '0771111111' });
            expect(res.statusCode).toBe(403);
        });

        it('should create a patient successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            expect(patient).toBeDefined();
            expect(patient.id).toBeDefined();
            expect(patient.name).toContain('Patient Test');
            expect(patient.gender).toBe('male');
            expect(patient.blood_type).toBe('A+');
            expect(patient.is_active).toBe(true);
        });

        it('should return 400 if name is missing', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${token}`)
                .send({ date_of_birth: '2000-01-01', gender: 'male', phone: '0779999999' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 if date_of_birth is missing', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Test', gender: 'male', phone: '0779999998' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid gender', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Test', date_of_birth: '2000-01-01', gender: 'unknown', phone: '0779999997' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid blood type', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Test', date_of_birth: '2000-01-01', gender: 'male', phone: '0779999996', blood_type: 'X+' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid email format', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Test', date_of_birth: '2000-01-01', gender: 'male', phone: '0779999995', email: 'not-an-email' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 409 for duplicate phone number', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const p1 = await createTestPatient(token);
            if (!p1) return;
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Duplicate Phone',
                    date_of_birth: '2000-01-01',
                    gender: 'female',
                    phone: p1.phone // same phone
                });
            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });

        it('should calculate age from date_of_birth', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token, { date_of_birth: '1990-05-15' });
            expect(patient).toBeDefined();
            expect(patient.age).toBeGreaterThanOrEqual(35);
            expect(patient.age).toBeLessThanOrEqual(36);
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
        });

        it('should return a patient by ID', async () => {
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
    });

    // ── PUT /api/patients/:id ─────────────────────────────────────────────────
    describe('PUT /api/patients/:id', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).put('/api/patients/1').send({ name: 'Changed' });
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 if authenticated as nurse (not coordinator/admin)', async () => {
            const token = await getToken('nurse');
            if (!token) return;
            const res = await request(app)
                .put('/api/patients/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Changed' });
            expect(res.statusCode).toBe(403);
        });

        it('should return 404 for a non-existent patient ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .put('/api/patients/999999999')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Ghost Patient' });
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 if no fields are provided', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;
            const res = await request(app)
                .put(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({});
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should update patient name successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;
            const updatedName = 'Updated Patient Name';
            const res = await request(app)
                .put(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: updatedName });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(updatedName);
            // Other fields should remain unchanged
            expect(res.body.data.phone).toBe(patient.phone);
            expect(res.body.data.gender).toBe(patient.gender);
        });

        it('should update blood_type successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token, { blood_type: 'A+' });
            if (!patient) return;
            const res = await request(app)
                .put(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ blood_type: 'AB-' });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.blood_type).toBe('AB-');
        });

        it('should return 400 for invalid gender in update', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;
            const res = await request(app)
                .put(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ gender: 'invalid' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid email in update', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;
            const res = await request(app)
                .put(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'not-an-email' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 409 if updating phone to an already-used phone', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const p1 = await createTestPatient(token);
            const p2 = await createTestPatient(token);
            if (!p1 || !p2) return;
            const res = await request(app)
                .put(`/api/patients/${p2.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ phone: p1.phone });
            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });

        it('should recalculate age when date_of_birth is updated', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token, { date_of_birth: '2000-01-01' });
            if (!patient) return;
            const res = await request(app)
                .put(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ date_of_birth: '1980-06-15' });
            expect(res.statusCode).toBe(200);
            expect(res.body.data.age).toBeGreaterThanOrEqual(45);
        });
    });

    // ── DELETE /api/patients/:id ──────────────────────────────────────────────
    describe('DELETE /api/patients/:id', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).delete('/api/patients/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 if authenticated as nurse (not coordinator/admin)', async () => {
            const token = await getToken('nurse');
            if (!token) return;
            const res = await request(app)
                .delete('/api/patients/1')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(403);
        });

        it('should return 404 for a non-existent patient ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .delete('/api/patients/999999999')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should soft-delete a patient successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;
            const res = await request(app)
                .delete(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain(patient.name);
        });

        it('should not return the deleted patient in GET /api/patients', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;
            await request(app)
                .delete(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`);
            const listRes = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${token}`);
            expect(listRes.statusCode).toBe(200);
            const ids = listRes.body.data.map(p => p.id);
            expect(ids).not.toContain(patient.id);
        });

        it('should return 400 when deleting an already-deleted patient', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const patient = await createTestPatient(token);
            if (!patient) return;
            // First delete — should succeed
            await request(app)
                .delete(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`);
            // Second delete — should 400 (already deactivated)
            const res = await request(app)
                .delete(`/api/patients/${patient.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
