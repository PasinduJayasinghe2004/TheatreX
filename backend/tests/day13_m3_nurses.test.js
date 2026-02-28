// ============================================================================
// Nurse API Tests - M3 Day 13
// ============================================================================
// Created by: M3 (Janani) - Day 13
//
// Tests for:
//   POST /api/nurses        - createNurse  (validation, auth, create)
//   GET  /api/nurses        - getAllNurses  (list, search, availability, shift filter)
//   GET  /api/nurses/:id    - getNurseById (single nurse, 404 handling)
// ============================================================================

import request from 'supertest';
import app from '../server.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Login and return a JWT token for the given role */
const getToken = async (role = 'coordinator') => {
    const credentials = {
        coordinator: { email: 'coordinator@test.com', password: 'Test1234!' },
        admin: { email: 'admin@test.com', password: 'Test1234!' },
        nurse: { email: 'staff@test.com', password: 'Test1234!' },
    };
    const cred = credentials[role];
    const res = await request(app)
        .post('/api/auth/login')
        .send(cred);
    return res.body?.data?.token || res.body?.token || null;
};

/** Build a valid nurse payload with unique fields */
const validNurse = () => ({
    name: 'Nurse M3 Test',
    specialization: 'Surgical Nursing',
    license_number: `NRS-M3-${Date.now()}`,
    years_of_experience: 5,
    phone: '+94771234569',
    email: `m3.nurse.${Date.now()}@hospital.com`,
    is_available: true,
    shift_preference: 'morning',
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Nurse API - M3 Day 13', () => {

    // ── POST /api/nurses ──────────────────────────────────────────────────────
    describe('POST /api/nurses', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .post('/api/nurses')
                .send(validNurse());
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 if authenticated as nurse (not coordinator/admin)', async () => {
            const token = await getToken('nurse');
            if (!token) return; // skip if staff user doesn't exist in test DB

            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send(validNurse());
            expect(res.statusCode).toBe(403);
        });

        it('should return 400 if required fields are missing', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Nurse Incomplete' }); // missing most fields

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(Array.isArray(res.body.errors)).toBe(true);
        });

        it('should return 400 if email is invalid', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = { ...validNurse(), email: 'not-an-email' };
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 if shift_preference is invalid', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = { ...validNurse(), shift_preference: 'weekend' };
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should create a nurse successfully as coordinator', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = validNurse();
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Nurse created successfully');
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.name).toBe(data.name);
            expect(res.body.data.specialization).toBe(data.specialization);
            expect(res.body.data.email).toBe(data.email.toLowerCase());
            expect(res.body.data.shift_preference).toBe(data.shift_preference);
        });

        it('should create a nurse successfully as admin', async () => {
            const token = await getToken('admin');
            if (!token) return;

            const data = validNurse();
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
        });

        it('should return 409 if duplicate email', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = validNurse();
            // First create
            await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            // Second create with same email
            const data2 = { ...validNurse(), license_number: `NRS-DUP-${Date.now()}` };
            data2.email = data.email;
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send(data2);

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });

        it('should default shift_preference to flexible when not provided', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = validNurse();
            delete data.shift_preference;
            const res = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(res.statusCode).toBe(201);
            expect(res.body.data.shift_preference).toBe('flexible');
        });
    });

    // ── GET /api/nurses ───────────────────────────────────────────────────────
    describe('GET /api/nurses (list)', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/nurses');
            expect(res.statusCode).toBe(401);
        });

        it('should return 200 with an array of nurses', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/nurses')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('count');
        });

        it('should support search filter', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/nurses?search=Surgical')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.filters.search).toBe('Surgical');
        });

        it('should support available=true filter', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/nurses?available=true')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            res.body.data.forEach(n => {
                expect(n.is_available).toBe(true);
            });
        });

        it('should support available=false filter', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/nurses?available=false')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            res.body.data.forEach(n => {
                expect(n.is_available).toBe(false);
            });
        });

        it('should support shift filter', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/nurses?shift=morning')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.filters.shift).toBe('morning');
            res.body.data.forEach(n => {
                expect(n.shift_preference).toBe('morning');
            });
        });
    });

    // ── GET /api/nurses/:id ──────────────────────────────────────────────────
    describe('GET /api/nurses/:id', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/nurses/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 400 for invalid ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/nurses/abc')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 for non-existent nurse', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/nurses/999999')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Nurse not found');
        });

        it('should return a nurse by valid ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            // Create a nurse first so we know one exists
            const data = validNurse();
            const createRes = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            if (createRes.statusCode !== 201) return;

            const nurseId = createRes.body.data.id;
            const res = await request(app)
                .get(`/api/nurses/${nurseId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(nurseId);
            expect(res.body.data.name).toBe(data.name);
            expect(res.body.data).toHaveProperty('active_surgery_count');
        });
    });

    // ── Integration: Create + List ────────────────────────────────────────────
    describe('Integration: Create + Verify in List', () => {

        it('should show a newly created nurse in the list', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = validNurse();
            const createRes = await request(app)
                .post('/api/nurses')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            if (createRes.statusCode !== 201) return;

            const listRes = await request(app)
                .get('/api/nurses')
                .set('Authorization', `Bearer ${token}`);

            expect(listRes.statusCode).toBe(200);
            const found = listRes.body.data.find(
                n => n.email === data.email.toLowerCase()
            );
            expect(found).toBeDefined();
            expect(found.name).toBe(data.name);
        });
    });
});
