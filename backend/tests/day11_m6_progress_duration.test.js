// ============================================================================
// Day 11 – Progress & Duration Integration Tests
// ============================================================================
// Created by: M6 (Dinil) – Day 11
//
// Tests for:
// 1. PUT /api/theatres/:id/progress  (M1 – Surgery progress update)
//    - Authentication (401 without token)
//    - Authorisation (403 for staff role)
//    - Validation: missing progress, out-of-range, non-integer
//    - 404 for non-existent theatre
//    - 404 when no in-progress surgery
//    - 200 happy path (requires coordinator role)
//
// 2. GET /api/theatres/:id/duration  (M4 – Theatre duration calculation)
//    - Authentication (401 without token)
//    - 404 for non-existent theatre
//    - 200 with null when no in-progress surgery
//    - 200 returning expected duration fields when surgery is in-progress
//
// Run with: npm test -- --testPathPattern=day11_m6_progress_duration
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { pool } from '../config/database.js';

jest.setTimeout(30000);

// ============================================================================
// SHARED SETUP
// ============================================================================

let coordinatorToken;
let staffToken;
let validTheatreId;
let emptyTheatreId;

const uniqueId = Date.now();

const coordinatorUser = {
    name: 'M6 Prog Coordinator',
    email: `m6.prog.coord${uniqueId}@theatrex.com`,
    password: 'SecurePass123!',
    role: 'coordinator',
    phone: '0771234580'
};

const staffUser = {
    name: 'M6 Prog Staff',
    email: `m6.prog.staff${uniqueId}@theatrex.com`,
    password: 'SecurePass123!',
    role: 'nurse',
    phone: '0771234581'
};

beforeAll(async () => {
    // Register + login coordinator
    await request(app).post('/api/auth/register').send(coordinatorUser);
    const coordLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: coordinatorUser.email, password: coordinatorUser.password });
    coordinatorToken = coordLogin.body.token;

    // Register + login staff
    await request(app).post('/api/auth/register').send(staffUser);
    const staffLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: staffUser.email, password: staffUser.password });
    staffToken = staffLogin.body.token;

    // Fetch the first real theatre ID to use in tests
    const theatresRes = await request(app)
        .get('/api/theatres')
        .set('Authorization', `Bearer ${coordinatorToken}`);

    if (theatresRes.body.data && theatresRes.body.data.length > 0) {
        validTheatreId = theatresRes.body.data[0].id;
    }

    // Seed a reliable in-progress theatre and surgery for these tests to work
    if (validTheatreId) {
        // Change the theatre to in_use
        await request(app)
            .put(`/api/theatres/${validTheatreId}/status`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ status: 'in_use' })
            .catch(() => { });

        // Create an in_progress surgery in this theatre
        await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({
                patient_name: 'Prog Dur Patient',
                patient_age: 30,
                patient_gender: 'female',
                surgery_type: 'Prog Dur Surgery',
                scheduled_date: '2026-07-01',
                scheduled_time: '08:00',
                duration_minutes: 120,
                theatre_id: validTheatreId,
                status: 'in_progress', // Make it directly in progress, or update it
                priority: 'routine'
            });
    }

    // Create a dedicated empty theatre (no surgeries) for "no in-progress surgery" tests
    const { rows: emptyTheatreRows } = await pool.query(`
        INSERT INTO theatres (name, location, status, theatre_type, is_active)
        VALUES ($1, 'Test Building', 'available', 'general', TRUE)
        RETURNING id
    `, [`Empty Theatre ${uniqueId}`]);
    emptyTheatreId = emptyTheatreRows[0].id;
});

// ============================================================================
// 1. PUT /api/theatres/:id/progress
// ============================================================================

describe('PUT /api/theatres/:id/progress – Surgery Progress Update', () => {

    // ── Authentication ────────────────────────────────────────────────────

    describe('Authentication', () => {
        it('should return 401 when no token is provided', async () => {
            const res = await request(app)
                .put('/api/theatres/1/progress')
                .send({ progress: 50 });

            expect(res.status).toBe(401);
        });
    });

    // ── Authorisation ─────────────────────────────────────────────────────

    describe('Authorisation', () => {
        it('should return 403 when called by a staff (non-coordinator) user', async () => {
            const res = await request(app)
                .put('/api/theatres/1/progress')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ progress: 50 });

            expect(res.status).toBe(403);
        });
    });

    // ── Input Validation ──────────────────────────────────────────────────

    describe('Input validation', () => {
        it('should return 400 when progress is missing from request body', async () => {
            const res = await request(app)
                .put(`/api/theatres/${validTheatreId || 1}/progress`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/progress/i);
        });

        it('should return 400 when progress is below 0', async () => {
            const res = await request(app)
                .put(`/api/theatres/${validTheatreId || 1}/progress`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ progress: -1 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when progress exceeds 100', async () => {
            const res = await request(app)
                .put(`/api/theatres/${validTheatreId || 1}/progress`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ progress: 101 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for a non-integer progress value (e.g. 45.5)', async () => {
            const res = await request(app)
                .put(`/api/theatres/${validTheatreId || 1}/progress`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ progress: 45.5 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ── Not Found ─────────────────────────────────────────────────────────

    describe('Not found scenarios', () => {
        it('should return 404 for a non-existent theatre ID', async () => {
            const res = await request(app)
                .put('/api/theatres/999999/progress')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ progress: 50 });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/not found/i);
        });
    });

    // ── No In-Progress Surgery ────────────────────────────────────────────

    describe('No in-progress surgery', () => {
        it('should return 404 when the theatre exists but has no in-progress surgery', async () => {
            // Use the dedicated empty theatre (guaranteed no surgeries)
            const res = await request(app)
                .put(`/api/theatres/${emptyTheatreId}/progress`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ progress: 40 });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/no in-progress surgery/i);
        });
    });

    // ── Happy Path ────────────────────────────────────────────────────────

    describe('Happy path', () => {
        it('should return 200 with a valid theatre and in-progress surgery', async () => {
            // Find a theatre that IS in_use
            const theatresRes = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const busyTheatre = theatresRes.body.data?.find(t => t.status === 'in_use');

            if (!busyTheatre) {
                console.log('Skipping happy path: no in-progress surgery available in test DB');
                return;
            }

            const res = await request(app)
                .put(`/api/theatres/${busyTheatre.id}/progress`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ progress: 55 });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/55%/);
            expect(res.body.data).toHaveProperty('theatre_id');
            expect(res.body.data).toHaveProperty('theatre_name');
            expect(res.body.data).toHaveProperty('surgery');
            expect(res.body.data.surgery.progress_percent).toBe(55);
        });

        it('should accept 0 as a valid progress value', async () => {
            const theatresRes = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const busyTheatre = theatresRes.body.data?.find(t => t.status === 'in_use');
            if (!busyTheatre) return;

            const res = await request(app)
                .put(`/api/theatres/${busyTheatre.id}/progress`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ progress: 0 });

            expect(res.status).toBe(200);
            expect(res.body.data.surgery.progress_percent).toBe(0);
        });

        it('should accept 100 as a valid progress value', async () => {
            const theatresRes = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const busyTheatre = theatresRes.body.data?.find(t => t.status === 'in_use');
            if (!busyTheatre) return;

            const res = await request(app)
                .put(`/api/theatres/${busyTheatre.id}/progress`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ progress: 100 });

            expect(res.status).toBe(200);
            expect(res.body.data.surgery.progress_percent).toBe(100);
        });
    });
});

// ============================================================================
// 2. GET /api/theatres/:id/duration
// ============================================================================

describe('GET /api/theatres/:id/duration – Theatre Duration Calculation', () => {

    // ── Authentication ────────────────────────────────────────────────────

    describe('Authentication', () => {
        it('should return 401 when no token is provided', async () => {
            const res = await request(app)
                .get('/api/theatres/1/duration');

            expect(res.status).toBe(401);
        });

        it('should allow any authenticated user (staff) to access duration', async () => {
            if (!validTheatreId) return;

            const res = await request(app)
                .get(`/api/theatres/${validTheatreId}/duration`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect([200]).toContain(res.status);
            expect(res.body.success).toBe(true);
        });
    });

    // ── Not Found ─────────────────────────────────────────────────────────

    describe('Not found', () => {
        it('should return 404 for a non-existent theatre ID', async () => {
            const res = await request(app)
                .get('/api/theatres/999999/duration')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    // ── No In-Progress Surgery (idle theatre) ─────────────────────────────

    describe('No in-progress surgery', () => {
        it('should return 200 with null data when theatre has no in-progress surgery', async () => {
            // Use the dedicated empty theatre (guaranteed no surgeries)
            const res = await request(app)
                .get(`/api/theatres/${emptyTheatreId}/duration`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeNull();
        });
    });

    // ── Happy Path ─────────────────────────────────────────────────────────

    describe('Happy path (theatre with in-progress surgery)', () => {
        it('should return 200 with elapsed, remaining, and total duration fields', async () => {
            const theatresRes = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const busyTheatre = theatresRes.body.data?.find(t => t.status === 'in_use');
            if (!busyTheatre) {
                console.log('Skipping: no in-progress surgery in test DB');
                return;
            }

            const res = await request(app)
                .get(`/api/theatres/${busyTheatre.id}/duration`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            const d = res.body.data;
            expect(d).not.toBeNull();

            // Raw minute fields are inside duration object
            expect(d.duration).toHaveProperty('elapsed');
            expect(d.duration).toHaveProperty('remaining');
            expect(d.duration).toHaveProperty('total');

            // Formatted string fields
            expect(d.duration.formatted).toHaveProperty('elapsed');
            expect(d.duration.formatted).toHaveProperty('remaining');

            // Overdue info
            expect(d).toHaveProperty('is_overdue');
            expect(d.duration).toHaveProperty('overdue');

            // Surgery identification
            expect(d).toHaveProperty('theatre_id');
            expect(d).toHaveProperty('theatre_name');
            expect(d).toHaveProperty('surgery_id');

            // Type checks
            expect(typeof d.duration.elapsed).toBe('number');
            expect(typeof d.duration.remaining).toBe('number');
            expect(typeof d.is_overdue).toBe('boolean');
        });

        it('elapsed + remaining should roughly equal total_minutes', async () => {
            const theatresRes = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const busyTheatre = theatresRes.body.data?.find(t => t.status === 'in_use');
            if (!busyTheatre) return;

            const res = await request(app)
                .get(`/api/theatres/${busyTheatre.id}/duration`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            if (!res.body.data || res.body.data.is_overdue) return;

            const { elapsed, remaining, total } = res.body.data.duration;
            // Allow ±1 min rounding tolerance
            expect(Math.abs(elapsed + remaining - total)).toBeLessThanOrEqual(1);
        });

        it('formatted strings should not be empty', async () => {
            const theatresRes = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const busyTheatre = theatresRes.body.data?.find(t => t.status === 'in_use');
            if (!busyTheatre) return;

            const res = await request(app)
                .get(`/api/theatres/${busyTheatre.id}/duration`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            if (!res.body.data) return;

            expect(res.body.data.duration.formatted.elapsed).toBeTruthy();
            expect(res.body.data.duration.formatted.remaining).toBeDefined(); // Might be '0m' which is truthy, but let's just check length or defined
        });
    });
});
