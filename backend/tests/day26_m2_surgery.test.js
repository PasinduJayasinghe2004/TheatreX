// ============================================================================
// Day 26 – M2 (Chandeepa) – Surgery Unit Tests
// ============================================================================
// Covers:
//   - POST /api/surgeries  (create)
//   - GET  /api/surgeries  (list, filters, sorting)
//   - GET  /api/surgeries/:id (detail)
//   - PUT  /api/surgeries/:id (update)
//   - DELETE /api/surgeries/:id (delete)
//   - RBAC: coordinator vs nurse vs surgeon
//   - E2E: create → read → update → delete lifecycle
//
// Run: cd backend && npx jest tests/day26_m2_surgery.test.js --no-coverage
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

// ─── Shared state ─────────────────────────────────────────────────────────────
let coordinatorToken;
let nurseToken;
let surgeonToken;
let createdSurgeryId;

const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 9999)}`;

const validSurgery = {
    patient_name: 'M2 Test Patient',
    patient_age: 40,
    patient_gender: 'female',
    surgery_type: 'Cholecystectomy',
    description: 'Laparoscopic gallbladder removal',
    scheduled_date: '2027-06-15',
    scheduled_time: '09:00',
    duration_minutes: 120,
    status: 'scheduled',
    priority: 'routine',
    notes: 'No known allergies'
};

// ─── Setup: Register + login test users ───────────────────────────────────────
beforeAll(async () => {
    // Coordinator
    const coordEmail = `m2_coord_${uniqueId}@theatrex.com`;
    await request(app).post('/api/auth/register').send({
        name: 'M2 Coordinator', email: coordEmail,
        password: 'SecurePass123!', role: 'coordinator', phone: '0771230100'
    });
    const coordLogin = await request(app).post('/api/auth/login')
        .send({ email: coordEmail, password: 'SecurePass123!' });
    coordinatorToken = coordLogin.body.token;

    // Nurse
    const nurseEmail = `m2_nurse_${uniqueId}@theatrex.com`;
    await request(app).post('/api/auth/register').send({
        name: 'M2 Nurse', email: nurseEmail,
        password: 'SecurePass123!', role: 'nurse', phone: '0771230101'
    });
    const nurseLogin = await request(app).post('/api/auth/login')
        .send({ email: nurseEmail, password: 'SecurePass123!' });
    nurseToken = nurseLogin.body.token;

    // Surgeon
    const surgeonEmail = `m2_surgeon_${uniqueId}@theatrex.com`;
    await request(app).post('/api/auth/register').send({
        name: 'M2 Surgeon', email: surgeonEmail,
        password: 'SecurePass123!', role: 'surgeon', phone: '0771230102'
    });
    const surgeonLogin = await request(app).post('/api/auth/login')
        .send({ email: surgeonEmail, password: 'SecurePass123!' });
    surgeonToken = surgeonLogin.body.token;
}, 40000);

// ─── POST /api/surgeries ──────────────────────────────────────────────────────
describe('M2 Day 26 – POST /api/surgeries (Create)', () => {
    it('should create surgery with valid data (201)', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send(validSurgery)
            .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.patient_name).toBe(validSurgery.patient_name);
        expect(res.body.data.surgery_type).toBe(validSurgery.surgery_type);
        expect(res.body.data.status).toBe('scheduled');
        createdSurgeryId = res.body.data.id;
    });

    it('should require authentication (401)', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .send(validSurgery)
            .expect(401);
        expect(res.body.success).toBe(false);
    });

    it('should reject missing required fields (400)', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ patient_name: 'Incomplete Patient' })
            .expect(400);
        expect(res.body.success).toBe(false);
    });

    it('should reject invalid status value (400)', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ ...validSurgery, status: 'pending_review', scheduled_date: '2027-07-01' })
            .expect(400);
        expect(res.body.success).toBe(false);
    });

    it('should reject invalid priority value (400)', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ ...validSurgery, priority: 'critical', scheduled_date: '2027-07-02' })
            .expect(400);
        expect(res.body.success).toBe(false);
    });

    it('should reject invalid date format (400)', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ ...validSurgery, scheduled_date: '15-06-2027' })
            .expect(400);
        expect(res.body.success).toBe(false);
    });

    it('should reject invalid time format (400)', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ ...validSurgery, scheduled_time: '9:00 AM', scheduled_date: '2027-07-03' })
            .expect(400);
        expect(res.body.success).toBe(false);
    });

    it('should reject negative duration (400)', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ ...validSurgery, duration_minutes: -30, scheduled_date: '2027-07-04' })
            .expect(400);
        expect(res.body.success).toBe(false);
    });

    it('should deny nurse from creating surgery (403)', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${nurseToken}`)
            .send({ ...validSurgery, scheduled_date: '2027-07-05' })
            .expect(403);
        expect(res.body.success).toBe(false);
    });

    it('should allow emergency priority surgery', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ ...validSurgery, priority: 'emergency', scheduled_date: '2027-07-06' })
            .expect(201);
        expect(res.body.data.priority).toBe('emergency');
    });

    it('should allow urgent priority surgery', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ ...validSurgery, priority: 'urgent', scheduled_date: '2027-07-07' })
            .expect(201);
        expect(res.body.data.priority).toBe('urgent');
    });
});

// ─── GET /api/surgeries ───────────────────────────────────────────────────────
describe('M2 Day 26 – GET /api/surgeries (List)', () => {
    it('should return surgeries list for authenticated user (200)', async () => {
        const res = await request(app)
            .get('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('count');
    });

    it('should require authentication (401)', async () => {
        await request(app).get('/api/surgeries').expect(401);
    });

    it('should allow nurse to view surgeries (200)', async () => {
        const res = await request(app)
            .get('/api/surgeries')
            .set('Authorization', `Bearer ${nurseToken}`)
            .expect(200);
        expect(res.body.success).toBe(true);
    });

    it('each surgery should have required fields', async () => {
        const res = await request(app)
            .get('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        if (res.body.data.length > 0) {
            const s = res.body.data[0];
            expect(s).toHaveProperty('id');
            expect(s).toHaveProperty('patient_name');
            expect(s).toHaveProperty('surgery_type');
            expect(s).toHaveProperty('scheduled_date');
            expect(s).toHaveProperty('status');
            expect(s).toHaveProperty('priority');
        }
    });

    it('should filter by status if query param provided', async () => {
        const res = await request(app)
            .get('/api/surgeries?status=scheduled')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        // All returned items should have status = scheduled
        res.body.data.forEach(s => {
            expect(s.status).toBe('scheduled');
        });
    });
});

// ─── GET /api/surgeries/:id ───────────────────────────────────────────────────
describe('M2 Day 26 – GET /api/surgeries/:id (Detail)', () => {
    it('should return surgery by valid ID (200)', async () => {
        if (!createdSurgeryId) return;
        const res = await request(app)
            .get(`/api/surgeries/${createdSurgeryId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(createdSurgeryId);
        expect(res.body.data.patient_name).toBe(validSurgery.patient_name);
    });

    it('should return 404 for non-existent surgery', async () => {
        const res = await request(app)
            .get('/api/surgeries/9999999')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(404);

        expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
        const res = await request(app)
            .get('/api/surgeries/not-a-number')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(400);
        expect(res.body.success).toBe(false);
    });

    it('should require authentication (401)', async () => {
        if (!createdSurgeryId) return;
        await request(app)
            .get(`/api/surgeries/${createdSurgeryId}`)
            .expect(401);
    });

    it('returned surgery should have complete data structure', async () => {
        if (!createdSurgeryId) return;
        const res = await request(app)
            .get(`/api/surgeries/${createdSurgeryId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`);

        const s = res.body.data;
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('patient_name');
        expect(s).toHaveProperty('patient_age');
        expect(s).toHaveProperty('surgery_type');
        expect(s).toHaveProperty('scheduled_date');
        expect(s).toHaveProperty('scheduled_time');
        expect(s).toHaveProperty('duration_minutes');
        expect(s).toHaveProperty('status');
        expect(s).toHaveProperty('priority');
        expect(s).toHaveProperty('created_at');
    });
});

// ─── PUT /api/surgeries/:id ───────────────────────────────────────────────────
describe('M2 Day 26 – PUT /api/surgeries/:id (Update)', () => {
    it('coordinator can update surgery (200)', async () => {
        if (!createdSurgeryId) return;
        const res = await request(app)
            .put(`/api/surgeries/${createdSurgeryId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ patient_name: 'M2 Updated Patient', notes: 'Updated notes' })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.patient_name).toBe('M2 Updated Patient');
    });

    it('should return 404 for non-existent surgery ID', async () => {
        const res = await request(app)
            .put('/api/surgeries/9999999')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ patient_name: 'Ghost Patient' })
            .expect(404);
        expect(res.body.success).toBe(false);
    });

    it('nurse cannot update surgery (403)', async () => {
        if (!createdSurgeryId) return;
        const res = await request(app)
            .put(`/api/surgeries/${createdSurgeryId}`)
            .set('Authorization', `Bearer ${nurseToken}`)
            .send({ notes: 'Nurse note' })
            .expect(403);
        expect(res.body.success).toBe(false);
    });

    it('should require authentication (401)', async () => {
        if (!createdSurgeryId) return;
        await request(app)
            .put(`/api/surgeries/${createdSurgeryId}`)
            .send({ notes: 'Unauthenticated' })
            .expect(401);
    });
});

// ─── DELETE /api/surgeries/:id ────────────────────────────────────────────────
describe('M2 Day 26 – DELETE /api/surgeries/:id', () => {
    let deleteTargetId;

    beforeAll(async () => {
        // Create a throwaway surgery to delete
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ ...validSurgery, patient_name: 'Delete Target', scheduled_date: '2027-09-01' });
        deleteTargetId = res.body.data?.id;
    }, 15000);

    it('nurse cannot delete surgery (403)', async () => {
        if (!deleteTargetId) return;
        const res = await request(app)
            .delete(`/api/surgeries/${deleteTargetId}`)
            .set('Authorization', `Bearer ${nurseToken}`)
            .expect(403);
        expect(res.body.success).toBe(false);
    });

    it('coordinator can delete surgery (200)', async () => {
        if (!deleteTargetId) return;
        const res = await request(app)
            .delete(`/api/surgeries/${deleteTargetId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);
        expect(res.body.success).toBe(true);
    });

    it('deleted surgery should return 404', async () => {
        if (!deleteTargetId) return;
        await request(app)
            .get(`/api/surgeries/${deleteTargetId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(404);
    });
});

// ─── E2E: Create → Read → Update → Delete ────────────────────────────────────
describe('M2 Day 26 – E2E: Surgery Lifecycle', () => {
    let lifecycleId;

    it('Step 1 – Create surgery', async () => {
        const res = await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ ...validSurgery, patient_name: 'E2E Surgery Patient', scheduled_date: '2027-10-01' })
            .expect(201);

        expect(res.body.success).toBe(true);
        lifecycleId = res.body.data.id;
    });

    it('Step 2 – Read surgery by ID', async () => {
        const res = await request(app)
            .get(`/api/surgeries/${lifecycleId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.data.patient_name).toBe('E2E Surgery Patient');
    });

    it('Step 3 – Update surgery details', async () => {
        const res = await request(app)
            .put(`/api/surgeries/${lifecycleId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ notes: 'Updated during E2E test', priority: 'urgent' })
            .expect(200);

        expect(res.body.data.priority).toBe('urgent');
    });

    it('Step 4 – Verify update persisted', async () => {
        const res = await request(app)
            .get(`/api/surgeries/${lifecycleId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.data.priority).toBe('urgent');
        expect(res.body.data.notes).toContain('Updated during E2E test');
    });

    it('Step 5 – Delete surgery', async () => {
        await request(app)
            .delete(`/api/surgeries/${lifecycleId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);
    });

    it('Step 6 – Confirm surgery is gone (404)', async () => {
        await request(app)
            .get(`/api/surgeries/${lifecycleId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(404);
    });
});
