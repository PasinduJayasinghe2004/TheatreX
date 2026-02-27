// ============================================================================
// Nurse Controller Tests - M2 Day 14
// ============================================================================
// Created by: M2 (Chandeepa) - Day 14
//
// Tests for:
//   PUT    /api/nurses/:id  - updateNurse
//   DELETE /api/nurses/:id  - deleteNurse (soft-delete)
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
 * Creates a nurse as coordinator and returns the created nurse object.
 * Unique timestamp-based email and license to avoid conflicts between tests.
 */
const createTestNurse = async (token) => {
    const ts = Date.now();
    const data = {
        name: `Nurse Test ${ts}`,
        specialization: 'Surgical Nursing',
        license_number: `NRS-DAY14-${ts}`,
        years_of_experience: 3,
        phone: '+94771234567',
        email: `day14.nurse.${ts}@hospital.com`,
        is_available: true,
        shift_preference: 'morning',
    };
    const res = await request(app)
        .post('/api/nurses')
        .set('Authorization', `Bearer ${token}`)
        .send(data);
    return res.body?.data;
};

// ─────────────────────────────────────────────────────────────────────────────
describe('Nurse API - M2 Day 14', () => {

    // ── PUT /api/nurses/:id ───────────────────────────────────────────────────
    describe('PUT /api/nurses/:id', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).put('/api/nurses/1').send({ name: 'Changed' });
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 if authenticated as nurse (not coordinator/admin)', async () => {
            const token = await getToken('nurse');
            if (!token) return;
            const res = await request(app)
                .put('/api/nurses/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Changed' });
            expect(res.statusCode).toBe(403);
        });

        it('should return 404 for a non-existent nurse ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .put('/api/nurses/999999999')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Ghost Nurse' });
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for an invalid nurse ID format', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .put('/api/nurses/abc')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Invalid' });
            expect(res.statusCode).toBe(400);
        });

        it('should return 400 if email is invalid', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const nurse = await createTestNurse(token);
            if (!nurse) return;
            const res = await request(app)
                .put(`/api/nurses/${nurse.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'not-an-email' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 if shift_preference is invalid', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const nurse = await createTestNurse(token);
            if (!nurse) return;
            const res = await request(app)
                .put(`/api/nurses/${nurse.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ shift_preference: 'weekend' });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should update nurse name successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const nurse = await createTestNurse(token);
            if (!nurse) return;
            const updatedName = 'Nurse Updated Name';
            const res = await request(app)
                .put(`/api/nurses/${nurse.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: updatedName });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(updatedName);
            // Other fields should remain unchanged
            expect(res.body.data.specialization).toBe(nurse.specialization);
            expect(res.body.data.email).toBe(nurse.email);
        });

        it('should update shift preference successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const nurse = await createTestNurse(token); // created with shift_preference: 'morning'
            if (!nurse) return;
            const res = await request(app)
                .put(`/api/nurses/${nurse.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ shift_preference: 'night' });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.shift_preference).toBe('night');
        });

        it('should update availability flag successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const nurse = await createTestNurse(token); // created with is_available: true
            if (!nurse) return;
            const res = await request(app)
                .put(`/api/nurses/${nurse.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_available: false });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.is_available).toBe(false);
        });

        it('should return 409 if updating email to an already-used email', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const n1 = await createTestNurse(token);
            const n2 = await createTestNurse(token);
            if (!n1 || !n2) return;
            const res = await request(app)
                .put(`/api/nurses/${n2.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ email: n1.email });
            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    // ── DELETE /api/nurses/:id ────────────────────────────────────────────────
    describe('DELETE /api/nurses/:id', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).delete('/api/nurses/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 if authenticated as nurse (not coordinator/admin)', async () => {
            const token = await getToken('nurse');
            if (!token) return;
            const res = await request(app)
                .delete('/api/nurses/1')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(403);
        });

        it('should return 404 for a non-existent nurse ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .delete('/api/nurses/999999999')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for an invalid nurse ID format', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const res = await request(app)
                .delete('/api/nurses/abc')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(400);
        });

        it('should soft-delete a nurse successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const nurse = await createTestNurse(token);
            if (!nurse) return;
            const res = await request(app)
                .delete(`/api/nurses/${nurse.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain(nurse.name);
        });

        it('should not return the deleted nurse in GET /api/nurses', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const nurse = await createTestNurse(token);
            if (!nurse) return;
            await request(app)
                .delete(`/api/nurses/${nurse.id}`)
                .set('Authorization', `Bearer ${token}`);
            const listRes = await request(app)
                .get('/api/nurses')
                .set('Authorization', `Bearer ${token}`);
            expect(listRes.statusCode).toBe(200);
            const ids = listRes.body.data.map(n => n.id);
            expect(ids).not.toContain(nurse.id);
        });

        it('should return 404 when deleting an already-deleted nurse', async () => {
            const token = await getToken('coordinator');
            if (!token) return;
            const nurse = await createTestNurse(token);
            if (!nurse) return;
            // First delete — should succeed
            await request(app)
                .delete(`/api/nurses/${nurse.id}`)
                .set('Authorization', `Bearer ${token}`);
            // Second delete — should 404
            const res = await request(app)
                .delete(`/api/nurses/${nurse.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
});
