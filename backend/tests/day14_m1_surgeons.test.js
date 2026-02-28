// ============================================================================
// Surgeon Controller Tests - M1 Day 14
// ============================================================================
// Created by: M1 (Pasindu) - Day 14
//
// Tests for:
//   PUT    /api/surgeons/:id  - updateSurgeon
//   DELETE /api/surgeons/:id  - deleteSurgeon (soft-delete)
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

/**
 * Creates a surgeon as coordinator and returns the created surgeon's ID.
 * Generates unique email/licence so tests don't collide.
 */
const createTestSurgeon = async (token) => {
    const data = {
        name: `Dr. Test ${Date.now()}`,
        specialization: 'General Surgery',
        license_number: `LK-DAY14-${Date.now()}`,
        years_of_experience: 5,
        phone: '+94771234567',
        email: `day14.${Date.now()}@hospital.com`,
        is_available: true,
    };
    const res = await request(app)
        .post('/api/surgeons')
        .set('Authorization', `Bearer ${token}`)
        .send(data);
    return res.body?.data;
};

// ─────────────────────────────────────────────────────────────────────────────
describe('Surgeon API - M1 Day 14', () => {

    // ── PUT /api/surgeons/:id ─────────────────────────────────────────────────
    describe('PUT /api/surgeons/:id', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .put('/api/surgeons/1')
                .send({ name: 'Changed' });
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 if authenticated as nurse (not coordinator/admin)', async () => {
            const token = await getToken('nurse');
            if (!token) return;

            const res = await request(app)
                .put('/api/surgeons/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Changed' });
            expect(res.statusCode).toBe(403);
        });

        it('should return 404 for a non-existent surgeon ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .put('/api/surgeons/999999999')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Ghost Surgeon' });
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for an invalid surgeon ID format', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .put('/api/surgeons/abc')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Invalid' });
            expect(res.statusCode).toBe(400);
        });

        it('should return 400 if email is invalid', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const surgeon = await createTestSurgeon(token);
            if (!surgeon) return;

            const res = await request(app)
                .put(`/api/surgeons/${surgeon.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'not-an-email' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should update surgeon name successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const surgeon = await createTestSurgeon(token);
            if (!surgeon) return;

            const updatedName = 'Dr. Updated Name';
            const res = await request(app)
                .put(`/api/surgeons/${surgeon.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: updatedName });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(updatedName);
            // Other fields should be preserved
            expect(res.body.data.specialization).toBe(surgeon.specialization);
            expect(res.body.data.email).toBe(surgeon.email);
        });

        it('should update availability flag successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const surgeon = await createTestSurgeon(token); // created with is_available: true
            if (!surgeon) return;

            const res = await request(app)
                .put(`/api/surgeons/${surgeon.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ is_available: false });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.is_available).toBe(false);
        });

        it('should return 409 if updating email to an already-used email', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            // Create two surgeons
            const s1 = await createTestSurgeon(token);
            const s2 = await createTestSurgeon(token);
            if (!s1 || !s2) return;

            // Try to give s2 the same email as s1
            const res = await request(app)
                .put(`/api/surgeons/${s2.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ email: s1.email });

            expect(res.statusCode).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });

    // ── DELETE /api/surgeons/:id ──────────────────────────────────────────────
    describe('DELETE /api/surgeons/:id', () => {

        it('should return 401 if not authenticated', async () => {
            const res = await request(app).delete('/api/surgeons/1');
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 if authenticated as nurse (not coordinator/admin)', async () => {
            const token = await getToken('nurse');
            if (!token) return;

            const res = await request(app)
                .delete('/api/surgeons/1')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(403);
        });

        it('should return 404 for a non-existent surgeon ID', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .delete('/api/surgeons/999999999')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for an invalid surgeon ID format', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .delete('/api/surgeons/abc')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(400);
        });

        it('should soft-delete a surgeon successfully', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const surgeon = await createTestSurgeon(token);
            if (!surgeon) return;

            const res = await request(app)
                .delete(`/api/surgeons/${surgeon.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain(surgeon.name);
        });

        it('should not return the deleted surgeon in GET /api/surgeons', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const surgeon = await createTestSurgeon(token);
            if (!surgeon) return;

            // Delete the surgeon
            await request(app)
                .delete(`/api/surgeons/${surgeon.id}`)
                .set('Authorization', `Bearer ${token}`);

            // Verify they no longer appear in the list
            const listRes = await request(app)
                .get('/api/surgeons')
                .set('Authorization', `Bearer ${token}`);

            expect(listRes.statusCode).toBe(200);
            const ids = listRes.body.data.map(s => s.id);
            expect(ids).not.toContain(surgeon.id);
        });

        it('should return 404 when deleting an already-deleted surgeon', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const surgeon = await createTestSurgeon(token);
            if (!surgeon) return;

            // First delete — should succeed
            await request(app)
                .delete(`/api/surgeons/${surgeon.id}`)
                .set('Authorization', `Bearer ${token}`);

            // Second delete — should 404
            const res = await request(app)
                .delete(`/api/surgeons/${surgeon.id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
});
