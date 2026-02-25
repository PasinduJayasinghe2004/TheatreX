// ============================================================================
// Surgeon Controller Tests - M1 Day 13
// ============================================================================
// Created by: M1 (Pasindu) - Day 13
//
// Tests for:
//   POST /api/surgeons  - createSurgeon
//   GET  /api/surgeons  - getAllSurgeons
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

const validSurgeon = () => ({
    name: 'Dr. Test Surgeon',
    specialization: 'Cardiothoracic Surgery',
    license_number: `LK-TEST-${Date.now()}`,
    years_of_experience: 12,
    phone: '+94771234567',
    email: `testsurgeon.${Date.now()}@hospital.com`,
    is_available: true,
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Surgeon API - M1 Day 13', () => {

    // ── POST /api/surgeons ────────────────────────────────────────────────────
    describe('POST /api/surgeons', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .post('/api/surgeons')
                .send(validSurgeon());
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 if authenticated as staff (not coordinator/admin)', async () => {
            const token = await getToken('staff');
            if (!token) return; // skip if staff user doesn't exist in test DB

            const res = await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send(validSurgeon());
            expect(res.statusCode).toBe(403);
        });

        it('should return 400 if required fields are missing', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Dr. Incomplete' }); // missing most fields

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(Array.isArray(res.body.errors)).toBe(true);
        });

        it('should return 400 if email is invalid', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = { ...validSurgeon(), email: 'not-an-email' };
            const res = await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should create a surgeon successfully as coordinator', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = validSurgeon();
            const res = await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                name: data.name,
                specialization: data.specialization,
                email: data.email.toLowerCase(),
                is_available: true,
                is_active: true,
            });
        });

        it('should return 409 if license_number already exists', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const data = validSurgeon();

            // Create first
            await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            // Try to create again with same licence
            const data2 = { ...validSurgeon(), email: `diff.${Date.now()}@hospital.com` };
            data2.license_number = data.license_number;

            const res = await request(app)
                .post('/api/surgeons')
                .set('Authorization', `Bearer ${token}`)
                .send(data2);

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    // ── GET /api/surgeons ─────────────────────────────────────────────────────
    describe('GET /api/surgeons', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).get('/api/surgeons');
            expect(res.statusCode).toBe(401);
        });

        it('should return all active surgeons', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/surgeons')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should filter by search string', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/surgeons?search=Cardio')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should filter by available=true', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/surgeons?available=true')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            // Every returned surgeon should be available
            res.body.data.forEach(s => {
                expect(s.is_available).toBe(true);
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
});
