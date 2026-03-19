// ============================================================================
// Anaesthetist API Tests - M6 Day 13
// ============================================================================
// Created by: M6 (Dinil) - Day 13
//
// Tests for:
//   GET  /api/anaesthetists           - getAnaesthetists   (Coordinator/Admin)
//   GET  /api/anaesthetists/available - getAvailableAnaesthetists
//   POST /api/anaesthetists           - createAnaesthetist (Admin only)
//   PUT  /api/anaesthetists/:id/availability - updateAvailability
// ============================================================================

import request from 'supertest';
import app from '../server.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Login with a pre-seeded account and return a JWT token, with retry for Neon DB cold start */
const getToken = async (role = 'coordinator', retries = 3) => {
    const credentials = {
        coordinator: { email: 'coordinator@test.com', password: 'Test1234!' },
        admin: { email: 'admin@test.com', password: 'Test1234!' },
    };
    const cred = credentials[role];

    for (let i = 0; i < retries; i++) {
        try {
            const res = await request(app).post('/api/auth/login').send(cred);
            if (res.body?.data?.token || res.body?.token) {
                return res.body?.data?.token || res.body?.token;
            }
            if (res.statusCode >= 500) {
                console.log(`[Attempt ${i + 1}] Login returned ${res.statusCode}. Retrying...`);
                await new Promise(r => setTimeout(r, 2000 * (i + 1)));
                continue;
            }
            break;
        } catch (err) {
            console.log(`[Attempt ${i + 1}] Login error: ${err.message}. Retrying...`);
            await new Promise(r => setTimeout(r, 2000 * (i + 1)));
        }
    }
    return null;
};

/** Build a unique valid anaesthetist payload */
const validAnaesthetist = () => ({
    name: 'Dr. M6 Test Anaes',
    email: `m6.anaes.${Date.now()}.${Math.floor(Math.random() * 10000)}@hospital.com`,
    phone: '+94771234599',
    specialization: 'General Anaesthesia',
    license_number: `LK-ANS-M6-${Date.now()}`,
    years_of_experience: 8,
    qualification: 'MBBS, MD Anaesthesiology',
    shift_preference: 'morning'
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Anaesthetist API – M6 Day 13', () => {
    let coordinatorToken;
    let adminToken;
    let createdAnaesthetistId;

    beforeAll(async () => {
        coordinatorToken = await getToken('coordinator');
        adminToken = await getToken('admin');
    }, 60000);

    // ── GET /api/anaesthetists ────────────────────────────────────────────────

    describe('GET /api/anaesthetists', () => {
        it('should return 401 when no token is provided', async () => {
            const res = await request(app).get('/api/anaesthetists');
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should return 200 and a data array for coordinator', async () => {
            if (!coordinatorToken) return;
            const res = await request(app)
                .get('/api/anaesthetists')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(typeof res.body.count).toBe('number');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should return 200 and a data array for admin', async () => {
            if (!adminToken) return;
            const res = await request(app)
                .get('/api/anaesthetists')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    // ── GET /api/anaesthetists/available ─────────────────────────────────────

    describe('GET /api/anaesthetists/available', () => {
        it('should return 401 when no token is provided', async () => {
            const res = await request(app).get('/api/anaesthetists/available');
            expect(res.statusCode).toBe(401);
        });

        it('should return 200 with only available records for coordinator', async () => {
            if (!coordinatorToken) return;
            const res = await request(app)
                .get('/api/anaesthetists/available')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            // Every returned record must have is_available = true
            res.body.data.forEach(a => {
                expect(a.is_available).toBe(true);
            });
        });
    });

    // ── POST /api/anaesthetists ───────────────────────────────────────────────

    describe('POST /api/anaesthetists', () => {
        it('should return 401 when no token is provided', async () => {
            const res = await request(app)
                .post('/api/anaesthetists')
                .send(validAnaesthetist());
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for coordinator (admin-only endpoint)', async () => {
            if (!coordinatorToken) return;
            const res = await request(app)
                .post('/api/anaesthetists')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send(validAnaesthetist());

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when required fields are missing', async () => {
            if (!adminToken) return;
            const res = await request(app)
                .post('/api/anaesthetists')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Dr. Incomplete' }); // missing email, specialization, license_number

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should create a new anaesthetist successfully as admin (201)', async () => {
            if (!adminToken) return;
            const data = validAnaesthetist();
            const res = await request(app)
                .post('/api/anaesthetists')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(data);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/created/i);
            expect(res.body.data.name).toBe(data.name);
            expect(res.body.data.specialization).toBe(data.specialization);
            createdAnaesthetistId = res.body.data.id;
        });
    });

    // ── PUT /api/anaesthetists/:id/availability ───────────────────────────────

    describe('PUT /api/anaesthetists/:id/availability', () => {
        it('should return 401 when no token is provided', async () => {
            const res = await request(app)
                .put('/api/anaesthetists/999/availability')
                .send({ is_available: false });
            expect(res.statusCode).toBe(401);
        });

        it('should return 400 when is_available is not provided', async () => {
            if (!coordinatorToken || !createdAnaesthetistId) return;
            const res = await request(app)
                .put(`/api/anaesthetists/${createdAnaesthetistId}/availability`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({}); // missing is_available

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should set availability to false as coordinator', async () => {
            if (!coordinatorToken || !createdAnaesthetistId) return;
            const res = await request(app)
                .put(`/api/anaesthetists/${createdAnaesthetistId}/availability`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ is_available: false });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/updated/i);
        });

        it('should restore availability to true', async () => {
            if (!coordinatorToken || !createdAnaesthetistId) return;
            const res = await request(app)
                .put(`/api/anaesthetists/${createdAnaesthetistId}/availability`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ is_available: true });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
