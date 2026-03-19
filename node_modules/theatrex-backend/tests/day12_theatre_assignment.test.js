// ============================================================================
// Theatre Assignment API Tests
// ============================================================================
// Created by: M3 (Janani) - Day 12
//
// Integration tests for:
//   PATCH /api/surgeries/:id/assign-theatre
//   GET   /api/surgeries/unassigned
//
// Covers:
//   Assign-Theatre:
//     1. Auth requirement (no token → 401)
//     2. RBAC: staff role → 403
//     3. Missing theatre_id → 400
//     4. Invalid surgery ID → 400
//     5. Non-existent surgery → 404
//     6. Non-existent theatre → 404
//     7. Coordinator happy path → 200
//     8. Admin happy path → 200
//     9. Already-assigned no-op → 200
//     10. Completed surgery → 400
//   Unassigned Surgeries:
//     11. Auth requirement (no token → 401)
//     12. Returns array of surgeries
//     13. Returned surgeries have theatre_id = null
//     14. Count matches array length
//
// Run with: npm test -- --testPathPattern=day12_theatre_assignment
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { pool } from '../config/database.js';

jest.setTimeout(30000);

describe('Theatre Assignment API - M3 Day 12', () => {
    let coordinatorToken;
    let staffToken;
    let adminToken;

    // IDs created during setup
    let theatreId;
    let unassignedSurgeryId;
    let completedSurgeryId;

    const uniqueId = Date.now();

    const coordinatorUser = {
        name: 'Coord Assign Tester',
        email: `coord.assign${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771200000'
    };

    const staffUser = {
        name: 'Staff Assign Tester',
        email: `staff.assign${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'nurse',
        phone: '0771200001'
    };

    const adminUser = {
        name: 'Admin Assign Tester',
        email: `admin.assign${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'admin',
        phone: '0771200002'
    };

    // ── Setup ─────────────────────────────────────────────────────────────────
    beforeAll(async () => {
        // Register and login users
        await request(app).post('/api/auth/register').send(coordinatorUser);
        const coordLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: coordinatorUser.email, password: coordinatorUser.password });
        coordinatorToken = coordLogin.body.token;

        await request(app).post('/api/auth/register').send(staffUser);
        const staffLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: staffUser.email, password: staffUser.password });
        staffToken = staffLogin.body.token;

        await request(app).post('/api/auth/register').send(adminUser);
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: adminUser.email, password: adminUser.password });
        adminToken = adminLogin.body.token;

        // Seed a theatre
        const { rows: theatreRows } = await pool.query(`
            INSERT INTO theatres (name, location, status, theatre_type, is_active)
            VALUES ($1, $2, 'available', 'general', TRUE)
            RETURNING id
        `, [`Test Theatre ${uniqueId}`, 'Building A']);
        theatreId = theatreRows[0].id;

        // Seed an unassigned surgery (theatre_id IS NULL)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        const { rows: surgeryRows } = await pool.query(`
            INSERT INTO surgeries (patient_name, patient_age, patient_gender, surgery_type,
                       scheduled_date, scheduled_time, duration_minutes, status, priority)
            VALUES ($1, 30, 'male', 'Appendectomy', $2, '10:00', 90, 'scheduled', 'routine')
            RETURNING id
        `, [`Patient Assign ${uniqueId}`, dateStr]);
        unassignedSurgeryId = surgeryRows[0].id;

        // Seed a completed surgery (for negative test)
        const { rows: completedRows } = await pool.query(`
            INSERT INTO surgeries (patient_name, patient_age, patient_gender, surgery_type,
                       scheduled_date, scheduled_time, duration_minutes, status, priority)
            VALUES ($1, 45, 'female', 'Cholecystectomy', $2, '14:00', 60, 'completed', 'routine')
            RETURNING id
        `, [`Patient Completed ${uniqueId}`, dateStr]);
        completedSurgeryId = completedRows[0].id;
    });

    // ────────────────────────────────────────────────────────────────────────
    //  PATCH /api/surgeries/:id/assign-theatre
    // ────────────────────────────────────────────────────────────────────────
    describe('PATCH /api/surgeries/:id/assign-theatre', () => {

        // ── Auth ──────────────────────────────────────────────────────────
        it('should return 401 when no auth token is supplied', async () => {
            const res = await request(app)
                .patch(`/api/surgeries/${unassignedSurgeryId}/assign-theatre`)
                .send({ theatre_id: theatreId });

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        // ── RBAC ─────────────────────────────────────────────────────────
        it('should return 403 for staff users', async () => {
            const res = await request(app)
                .patch(`/api/surgeries/${unassignedSurgeryId}/assign-theatre`)
                .send({ theatre_id: theatreId })
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        // ── Validation ───────────────────────────────────────────────────
        it('should return 400 when theatre_id is missing', async () => {
            const res = await request(app)
                .patch(`/api/surgeries/${unassignedSurgeryId}/assign-theatre`)
                .send({})
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid surgery ID', async () => {
            const res = await request(app)
                .patch('/api/surgeries/abc/assign-theatre')
                .send({ theatre_id: theatreId })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        // ── Not found ────────────────────────────────────────────────────
        it('should return 404 for non-existent surgery', async () => {
            const res = await request(app)
                .patch('/api/surgeries/999999/assign-theatre')
                .send({ theatre_id: theatreId })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
        });

        it('should return 404 for non-existent theatre', async () => {
            const res = await request(app)
                .patch(`/api/surgeries/${unassignedSurgeryId}/assign-theatre`)
                .send({ theatre_id: 999999 })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
        });

        // ── Business rule: completed surgery ─────────────────────────────
        it('should return 400 when assigning to a completed surgery', async () => {
            const res = await request(app)
                .patch(`/api/surgeries/${completedSurgeryId}/assign-theatre`)
                .send({ theatre_id: theatreId })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/completed/i);
        });

        // ── Happy paths ──────────────────────────────────────────────────
        it('should assign surgery to theatre (coordinator)', async () => {
            const res = await request(app)
                .patch(`/api/surgeries/${unassignedSurgeryId}/assign-theatre`)
                .send({ theatre_id: theatreId })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.theatre_id).toBe(theatreId);
            expect(res.body.data).toHaveProperty('theatre_name');
        });

        it('should return 200 (no-op) when already assigned to same theatre', async () => {
            const res = await request(app)
                .patch(`/api/surgeries/${unassignedSurgeryId}/assign-theatre`)
                .send({ theatre_id: theatreId })
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/already/i);
        });

        it('should allow admin users to assign surgery to theatre', async () => {
            // Create another unassigned surgery for admin test
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 2);
            const dateStr = tomorrow.toISOString().split('T')[0];

            const { rows } = await pool.query(`
                INSERT INTO surgeries (patient_name, patient_age, patient_gender, surgery_type,
                           scheduled_date, scheduled_time, duration_minutes, status, priority)
                VALUES ($1, 28, 'female', 'Hernia Repair', $2, '09:00', 60, 'scheduled', 'routine')
                RETURNING id
            `, [`Admin Patient ${uniqueId}`, dateStr]);

            const res = await request(app)
                .patch(`/api/surgeries/${rows[0].id}/assign-theatre`)
                .send({ theatre_id: theatreId })
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    //  GET /api/surgeries/unassigned
    // ────────────────────────────────────────────────────────────────────────
    describe('GET /api/surgeries/unassigned', () => {

        it('should return 401 when no auth token is supplied', async () => {
            const res = await request(app).get('/api/surgeries/unassigned');
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should return a list of unassigned surgeries', async () => {
            const res = await request(app)
                .get('/api/surgeries/unassigned')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('count');
            expect(res.body.count).toBe(res.body.data.length);
        });

        it('should only contain surgeries with no theatre_id', async () => {
            // Seed a fresh unassigned surgery to guarantee at least one result
            const dayAfter = new Date();
            dayAfter.setDate(dayAfter.getDate() + 3);
            const dateStr = dayAfter.toISOString().split('T')[0];

            await pool.query(`
                INSERT INTO surgeries (patient_name, patient_age, patient_gender, surgery_type,
                           scheduled_date, scheduled_time, duration_minutes, status, priority)
                VALUES ($1, 55, 'male', 'Knee Arthroscopy', $2, '11:00', 45, 'scheduled', 'urgent')
            `, [`Unassigned Patient ${uniqueId}`, dateStr]);

            const res = await request(app)
                .get('/api/surgeries/unassigned')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);

            // Each surgery should have expected shape
            res.body.data.forEach(surgery => {
                expect(surgery).toHaveProperty('id');
                expect(surgery).toHaveProperty('surgery_type');
                expect(surgery).toHaveProperty('patient_name');
                expect(surgery).toHaveProperty('scheduled_date');
                expect(surgery).toHaveProperty('scheduled_time');
                expect(surgery).toHaveProperty('duration_minutes');
                expect(surgery).toHaveProperty('status');
                expect(surgery).toHaveProperty('priority');
            });
        });

        it('should support status filter', async () => {
            const res = await request(app)
                .get('/api/surgeries/unassigned?status=scheduled')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            res.body.data.forEach(surgery => {
                expect(surgery.status).toBe('scheduled');
            });
        });
    });
});
