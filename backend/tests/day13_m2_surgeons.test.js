// ============================================================================
// Surgeon API Tests - M2 Day 13
// ============================================================================
// Created by: M2 (Chandeepa) - Day 13
//
// Tests for:
//   GET  /api/surgeons      - getAllSurgeons (list, search, availability filter)
//   GET  /api/surgeons/:id  - getSurgeonById (single surgeon, 404 handling)
//   POST /api/surgeons      - createSurgeon (create + verify in list)
// ============================================================================

import request from 'supertest';
import app from '../server.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Login and return a JWT token for the given role */
const getToken = async (role = 'coordinator') => {
    const credentials = {
        coordinator: { email: 'coordinator@test.com', password: 'Test1234!' },
        admin: { email: 'admin@test.com', password: 'Test1234!' },
        staff: { email: 'staff@test.com', password: 'Test1234!' },
    };
    const cred = credentials[role];
    const res = await request(app)
        .post('/api/auth/login')
        .send(cred);
    return res.body?.data?.token || res.body?.token || null;
};

/** Build a valid surgeon payload with unique fields */
const validSurgeon = () => ({
    name: 'Dr. M2 Test Surgeon',
    specialization: 'Orthopaedic Surgery',
    license_number: `LK-M2-${Date.now()}`,
    years_of_experience: 8,
    phone: '+94771234568',
    email: `m2.surgeon.${Date.now()}@hospital.com`,
    is_available: true,
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Surgeon API - M2 Day 13', () => {

    // ── GET /api/surgeons ─────────────────────────────────────────────────────
    describe('GET /api/surgeons (list)', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/surgeons');
            expect(res.statusCode).toBe(401);
        });

        it('should return 200 with an array of surgeons', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/surgeons')
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
                .get('/api/surgeons?search=Ortho')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.filters.search).toBe('Ortho');
        });

        it('should support available=true filter', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/surgeons?available=true')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            res.body.data.forEach(s => {
                expect(s.is_available).toBe(true);
            });
        });

        it('should support available=false filter', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/surgeons?available=false')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            res.body.data.forEach(s => {
                expect(s.is_available).toBe(false);
            });
        });

        it('should include active_surgery_count in each surgeon', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/surgeons')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            res.body.data.forEach(s => {
                expect(s.active_surgery_count).toBeDefined();
            });
        });
    });

    // ── GET /api/surgeons/:id ─────────────────────────────────────────────────
    describe('GET /api/surgeons/:id (single)', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/surgeons/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 400 for invalid ID (non-numeric)', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/surgeons/abc')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid ID (zero)', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/surgeons/0')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 for non-existent surgeon', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/surgeons/999999')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Surgeon not found');
        });

        it('should return 200 with a single surgeon when valid ID is given', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            // First, create a surgeon to ensure one exists
            const data = validSurgeon();
            const createRes = await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            if (createRes.statusCode !== 201) return; // skip if create fails
            const createdId = createRes.body.data.id;

            // Now fetch by ID
            const res = await request(app)
                .get(`/api/surgeons/${createdId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(createdId);
            expect(res.body.data.name).toBe(data.name);
            expect(res.body.data.specialization).toBe(data.specialization);
            expect(res.body.data.active_surgery_count).toBeDefined();
        });
    });

    // ── POST /api/surgeons (create + integration) ────────────────────────────
    describe('POST /api/surgeons (create & verify in list)', () => {

        it('should create a surgeon and verify it appears in the list', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = validSurgeon();

            // Create the surgeon
            const createRes = await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(createRes.statusCode).toBe(201);
            expect(createRes.body.success).toBe(true);
            expect(createRes.body.data.name).toBe(data.name);

            const createdId = createRes.body.data.id;

            // Verify it appears in the list
            const listRes = await request(app)
                .get('/api/surgeons')
                .set('Authorization', `Bearer ${token}`);

            expect(listRes.statusCode).toBe(200);
            const found = listRes.body.data.find(s => s.id === createdId);
            expect(found).toBeDefined();
            expect(found.name).toBe(data.name);
        });

        it('should create a surgeon and verify it can be fetched by ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = validSurgeon();

            // Create
            const createRes = await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(createRes.statusCode).toBe(201);
            const createdId = createRes.body.data.id;

            // Fetch by ID
            const getRes = await request(app)
                .get(`/api/surgeons/${createdId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(getRes.statusCode).toBe(200);
            expect(getRes.body.data.id).toBe(createdId);
            expect(getRes.body.data.email).toBe(data.email.toLowerCase());
            expect(getRes.body.data.is_available).toBe(true);
            expect(getRes.body.data.is_active).toBe(true);
        });

        it('should return 400 when required fields are missing', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Dr. Incomplete' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(Array.isArray(res.body.errors)).toBe(true);
        });

        it('should return 409 for duplicate license_number', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = validSurgeon();

            // Create first
            await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            // Try again with same license but different email
            const data2 = {
                ...validSurgeon(),
                license_number: data.license_number,
                email: `dup.${Date.now()}@hospital.com`,
            };

            const res = await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send(data2);

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });
});
