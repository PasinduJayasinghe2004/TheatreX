// ============================================================================
// Day 26 – M3 (Janani) – Theatre Unit Tests
// ============================================================================
// Covers:
//   - GET  /api/theatres                  (list, status filter, structure)
//   - GET  /api/theatres/:id             (detail, 404)
//   - PUT  /api/theatres/:id/status      (RBAC, valid transitions)
//   - GET  /api/theatres/:id/current-surgery
//   - GET  /api/theatres/coordinator-overview
//   - PUT  /api/theatres/:id/maintenance (enable/disable, RBAC)
//   - E2E: view list → get detail → update status → verify → restore
//
// Run: cd backend && npx jest tests/day26_m3_theatre.test.js --no-coverage
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { pool } from '../config/database.js';

jest.setTimeout(30000);

// ─── Shared state ─────────────────────────────────────────────────────────────
let coordinatorToken;
let nurseToken;
let surgeonToken;
let testTheatreId;

const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 9999)}`;

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeAll(async () => {
    // Coordinator
    const coordEmail = `m3_coord_${uniqueId}@theatrex.com`;
    await request(app).post('/api/auth/register').send({
        name: 'M3 Coordinator', email: coordEmail,
        password: 'SecurePass123!', role: 'coordinator', phone: '0771230200'
    });
    const coordLogin = await request(app).post('/api/auth/login')
        .send({ email: coordEmail, password: 'SecurePass123!' });
    coordinatorToken = coordLogin.body.token;

    // Nurse
    const nurseEmail = `m3_nurse_${uniqueId}@theatrex.com`;
    await request(app).post('/api/auth/register').send({
        name: 'M3 Nurse', email: nurseEmail,
        password: 'SecurePass123!', role: 'nurse', phone: '0771230201'
    });
    const nurseLogin = await request(app).post('/api/auth/login')
        .send({ email: nurseEmail, password: 'SecurePass123!' });
    nurseToken = nurseLogin.body.token;

    // Surgeon
    const surgeonEmail = `m3_surgeon_${uniqueId}@theatrex.com`;
    await request(app).post('/api/auth/register').send({
        name: 'M3 Surgeon', email: surgeonEmail,
        password: 'SecurePass123!', role: 'surgeon', phone: '0771230202'
    });
    const surgeonLogin = await request(app).post('/api/auth/login')
        .send({ email: surgeonEmail, password: 'SecurePass123!' });
    surgeonToken = surgeonLogin.body.token;

    // Get a theatre ID to use in tests
    const theatreRes = await request(app)
        .get('/api/theatres')
        .set('Authorization', `Bearer ${coordinatorToken}`);
    if (theatreRes.body.data && theatreRes.body.data.length > 0) {
        testTheatreId = theatreRes.body.data[0].id;
    }
}, 40000);

// ─── GET /api/theatres ────────────────────────────────────────────────────────
describe('M3 Day 26 – GET /api/theatres (List)', () => {
    it('should require authentication (401)', async () => {
        const res = await request(app).get('/api/theatres');
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBeFalsy();
    });

    it('coordinator can list theatres (200)', async () => {
        const res = await request(app)
            .get('/api/theatres')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('nurse can list theatres (200)', async () => {
        const res = await request(app)
            .get('/api/theatres')
            .set('Authorization', `Bearer ${nurseToken}`)
            .expect(200);
        expect(res.body.success).toBe(true);
    });

    it('surgeon can list theatres (200)', async () => {
        const res = await request(app)
            .get('/api/theatres')
            .set('Authorization', `Bearer ${surgeonToken}`)
            .expect(200);
        expect(res.body.success).toBe(true);
    });

    it('status filter should only return matching theatres', async () => {
        const res = await request(app)
            .get('/api/theatres?status=available')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        res.body.data.forEach(t => {
            expect(t.status).toBe('available');
        });
    });

    it('each theatre should have required fields', async () => {
        const res = await request(app)
            .get('/api/theatres')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        if (res.body.data.length > 0) {
            const t = res.body.data[0];
            expect(t).toHaveProperty('id');
            expect(t).toHaveProperty('name');
            expect(t).toHaveProperty('status');
            expect(t).toHaveProperty('theatre_type');
        }
    });
});

// ─── GET /api/theatres/:id ────────────────────────────────────────────────────
describe('M3 Day 26 – GET /api/theatres/:id (Detail)', () => {
    it('should return theatre detail for valid ID (200)', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .get(`/api/theatres/${testTheatreId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(testTheatreId);
    });

    it('should have complete data structure', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .get(`/api/theatres/${testTheatreId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        const t = res.body.data;
        expect(t).toHaveProperty('id');
        expect(t).toHaveProperty('name');
        expect(t).toHaveProperty('status');
        expect(t).toHaveProperty('theatre_type');
        expect(t).toHaveProperty('location');
    });

    it('should return 404 for non-existent theatre', async () => {
        const res = await request(app)
            .get('/api/theatres/9999999')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(404);

        expect(res.body.success).toBe(false);
    });

    it('should require authentication (401)', async () => {
        if (!testTheatreId) return;
        await request(app).get(`/api/theatres/${testTheatreId}`).expect(401);
    });
});

// ─── PUT /api/theatres/:id/status ─────────────────────────────────────────────
describe('M3 Day 26 – PUT /api/theatres/:id/status', () => {
    it('should require authentication (401)', async () => {
        if (!testTheatreId) return;
        await request(app)
            .put(`/api/theatres/${testTheatreId}/status`)
            .send({ status: 'available' })
            .expect(401);
    });

    it('nurse is forbidden from updating theatre status (403)', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .put(`/api/theatres/${testTheatreId}/status`)
            .set('Authorization', `Bearer ${nurseToken}`)
            .send({ status: 'maintenance' });
        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('surgeon is forbidden from updating theatre status (403)', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .put(`/api/theatres/${testTheatreId}/status`)
            .set('Authorization', `Bearer ${surgeonToken}`)
            .send({ status: 'available' });
        expect(res.statusCode).toBe(403);
    });

    it('coordinator can update theatre status to maintenance', async () => {
        if (!testTheatreId) return;
        // Force to available first
        await pool.query('UPDATE theatres SET status = $1 WHERE id = $2', ['available', testTheatreId]);

        const res = await request(app)
            .put(`/api/theatres/${testTheatreId}/status`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ status: 'maintenance' })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('maintenance');

        // Restore
        await pool.query('UPDATE theatres SET status = $1 WHERE id = $2', ['available', testTheatreId]);
    });

    it('should return 400 for invalid status value', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .put(`/api/theatres/${testTheatreId}/status`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ status: 'broken' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent theatre', async () => {
        const res = await request(app)
            .put('/api/theatres/9999999/status')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ status: 'available' });
        expect(res.statusCode).toBe(404);
    });
});

// ─── GET /api/theatres/:id/current-surgery ────────────────────────────────────
describe('M3 Day 26 – GET /api/theatres/:id/current-surgery', () => {
    it('should return 200 even when no surgery is in progress', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .get(`/api/theatres/${testTheatreId}/current-surgery`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
    });

    it('should require authentication (401)', async () => {
        if (!testTheatreId) return;
        await request(app)
            .get(`/api/theatres/${testTheatreId}/current-surgery`)
            .expect(401);
    });
});

// ─── PUT /api/theatres/:id/maintenance ───────────────────────────────────────
describe('M3 Day 26 – PUT /api/theatres/:id/maintenance', () => {
    it('should require authentication (401)', async () => {
        await request(app)
            .put('/api/theatres/1/maintenance')
            .send({ enable: true })
            .expect(401);
    });

    it('nurse is forbidden (403)', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .put(`/api/theatres/${testTheatreId}/maintenance`)
            .set('Authorization', `Bearer ${nurseToken}`)
            .send({ enable: true });
        expect(res.statusCode).toBe(403);
    });

    it('should return 404 for non-existent theatre', async () => {
        const res = await request(app)
            .put('/api/theatres/9999999/maintenance')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ enable: true });
        expect(res.statusCode).toBe(404);
    });

    it('should return 400 when enable field is missing', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .put(`/api/theatres/${testTheatreId}/maintenance`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({});
        expect(res.statusCode).toBe(400);
    });

    it('coordinator can enable maintenance mode', async () => {
        if (!testTheatreId) return;
        // Ensure available first
        await pool.query('UPDATE theatres SET status = $1 WHERE id = $2', ['available', testTheatreId]);

        const res = await request(app)
            .put(`/api/theatres/${testTheatreId}/maintenance`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ enable: true, reason: 'Scheduled equipment check' })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('maintenance');
    });

    it('coordinator can disable maintenance mode', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .put(`/api/theatres/${testTheatreId}/maintenance`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ enable: false })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('available');
    });
});

// ─── E2E: Theatre Flow ────────────────────────────────────────────────────────
describe('M3 Day 26 – E2E: Theatre Status Flow', () => {
    it('Step 1 – List theatres and capture a test theatre', async () => {
        const res = await request(app)
            .get('/api/theatres')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(Array.isArray(res.body.data)).toBe(true);
        // testTheatreId already captured in beforeAll
    });

    it('Step 2 – Get theatre detail', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .get(`/api/theatres/${testTheatreId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.data).toHaveProperty('status');
        expect(res.body.data).toHaveProperty('name');
    });

    it('Step 3 – Set theatre to available state for testing', async () => {
        if (!testTheatreId) return;
        await pool.query('UPDATE theatres SET status = $1 WHERE id = $2', ['available', testTheatreId]);

        const check = await request(app)
            .get(`/api/theatres/${testTheatreId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`);
        expect(check.body.data.status).toBe('available');
    });

    it('Step 4 – Update status to maintenance (coordinator)', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .put(`/api/theatres/${testTheatreId}/status`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ status: 'maintenance' })
            .expect(200);

        expect(res.body.data.status).toBe('maintenance');
    });

    it('Step 5 – Verify status change via GET', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .get(`/api/theatres/${testTheatreId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);
        expect(res.body.data.status).toBe('maintenance');
    });

    it('Step 6 – Restore theatre to available', async () => {
        if (!testTheatreId) return;
        await pool.query('UPDATE theatres SET status = $1 WHERE id = $2', ['available', testTheatreId]);

        const check = await request(app)
            .get(`/api/theatres/${testTheatreId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`);
        expect(check.body.data.status).toBe('available');
    });

    it('Step 7 – Non-coordinator cannot modify status (403)', async () => {
        if (!testTheatreId) return;
        const res = await request(app)
            .put(`/api/theatres/${testTheatreId}/status`)
            .set('Authorization', `Bearer ${nurseToken}`)
            .send({ status: 'maintenance' });
        expect(res.statusCode).toBe(403);
    });
});
