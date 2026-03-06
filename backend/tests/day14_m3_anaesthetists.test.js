// ============================================================================
// Anaesthetist PUT/DELETE API Tests - M3 Day 14
// ============================================================================
// Created by: M3 (Janani) - Day 14
//
// Tests for:
//   GET    /api/anaesthetists/:id       - getAnaesthetistById
//   PUT    /api/anaesthetists/:id       - updateAnaesthetist (Coordinator/Admin)
//   DELETE /api/anaesthetists/:id       - deleteAnaesthetist (Coordinator/Admin)
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

describe('Anaesthetist PUT/DELETE API Tests (Day 14)', () => {
    let adminToken;
    let coordinatorToken;
    let testAnaesthetistId;

    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const adminUser = {
        name: 'Anaes D14 Admin',
        email: `anaes.d14.admin${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'admin',
        phone: '0771234570'
    };

    const coordinatorUser = {
        name: 'Anaes D14 Coordinator',
        email: `anaes.d14.coord${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234571'
    };

    beforeAll(async () => {
        // Register and login admin
        await request(app).post('/api/auth/register').send(adminUser);
        const adminLogin = await request(app).post('/api/auth/login').send({
            email: adminUser.email,
            password: adminUser.password
        });
        adminToken = adminLogin.body.token;

        // Register and login coordinator
        await request(app).post('/api/auth/register').send(coordinatorUser);
        const coordLogin = await request(app).post('/api/auth/login').send({
            email: coordinatorUser.email,
            password: coordinatorUser.password
        });
        coordinatorToken = coordLogin.body.token;

        // Create a test anaesthetist to work with
        const createRes = await request(app)
            .post('/api/anaesthetists')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Dr. Day14 Test Anaes',
                email: `d14.test.anaes${uniqueId}@hospital.com`,
                specialization: 'General Anaesthesia',
                license_number: `LIC-D14-${uniqueId}`,
                phone: '+94771111111',
                shift_preference: 'morning',
                qualification: 'MBBS, MD',
                years_of_experience: 5
            });

        testAnaesthetistId = createRes.body.data?.id;
    });

    // ═════════════════════════════════════════════════════════════════════════
    // GET /api/anaesthetists/:id
    // ═════════════════════════════════════════════════════════════════════════
    describe('GET /api/anaesthetists/:id', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .get(`/api/anaesthetists/${testAnaesthetistId}`);
            expect(res.statusCode).toBe(401);
        });

        it('should return the anaesthetist by ID (coordinator)', async () => {
            if (!testAnaesthetistId) return;

            const res = await request(app)
                .get(`/api/anaesthetists/${testAnaesthetistId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(testAnaesthetistId);
            expect(res.body.data.name).toBe('Dr. Day14 Test Anaes');
        });

        it('should return 404 for non-existent ID', async () => {
            const res = await request(app)
                .get('/api/anaesthetists/999999')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid ID', async () => {
            const res = await request(app)
                .get('/api/anaesthetists/abc')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ═════════════════════════════════════════════════════════════════════════
    // PUT /api/anaesthetists/:id
    // ═════════════════════════════════════════════════════════════════════════
    describe('PUT /api/anaesthetists/:id', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .put(`/api/anaesthetists/${testAnaesthetistId}`)
                .send({ name: 'Updated Name' });
            expect(res.statusCode).toBe(401);
        });

        it('should update anaesthetist name (coordinator)', async () => {
            if (!testAnaesthetistId) return;

            const res = await request(app)
                .put(`/api/anaesthetists/${testAnaesthetistId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Dr. Updated Anaes' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Dr. Updated Anaes');
            expect(res.body.message).toBe('Anaesthetist updated successfully');
        });

        it('should update multiple fields (admin)', async () => {
            if (!testAnaesthetistId) return;

            const res = await request(app)
                .put(`/api/anaesthetists/${testAnaesthetistId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    specialization: 'Pediatric Anaesthesia',
                    years_of_experience: 10,
                    shift_preference: 'night',
                    qualification: 'MBBS, MD, Fellowship'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.specialization).toBe('Pediatric Anaesthesia');
            expect(res.body.data.years_of_experience).toBe(10);
            expect(res.body.data.shift_preference).toBe('night');
        });

        it('should return 400 for invalid email format', async () => {
            if (!testAnaesthetistId) return;

            const res = await request(app)
                .put(`/api/anaesthetists/${testAnaesthetistId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ email: 'not-an-email' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid years_of_experience', async () => {
            if (!testAnaesthetistId) return;

            const res = await request(app)
                .put(`/api/anaesthetists/${testAnaesthetistId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ years_of_experience: -5 });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 for non-existent anaesthetist', async () => {
            const res = await request(app)
                .put('/api/anaesthetists/999999')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test' });

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid ID format', async () => {
            const res = await request(app)
                .put('/api/anaesthetists/abc')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ name: 'Test' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    // ═════════════════════════════════════════════════════════════════════════
    // DELETE /api/anaesthetists/:id
    // ═════════════════════════════════════════════════════════════════════════
    describe('DELETE /api/anaesthetists/:id', () => {
        let deleteTargetId;

        beforeAll(async () => {
            // Create a separate anaesthetist for deletion tests
            const createRes = await request(app)
                .post('/api/anaesthetists')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Dr. Delete Target',
                    email: `d14.del.target${uniqueId}@hospital.com`,
                    specialization: 'Regional Anaesthesia',
                    license_number: `LIC-DEL-${uniqueId}`,
                    phone: '+94772222222',
                    shift_preference: 'flexible'
                });

            deleteTargetId = createRes.body.data?.id;
        });

        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .delete(`/api/anaesthetists/${deleteTargetId}`);
            expect(res.statusCode).toBe(401);
        });

        it('should soft-delete anaesthetist (coordinator)', async () => {
            if (!deleteTargetId) return;

            const res = await request(app)
                .delete(`/api/anaesthetists/${deleteTargetId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('deleted successfully');
        });

        it('should return 404 when trying to delete already-deleted anaesthetist', async () => {
            if (!deleteTargetId) return;

            const res = await request(app)
                .delete(`/api/anaesthetists/${deleteTargetId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
        });

        it('should return 404 for non-existent ID', async () => {
            const res = await request(app)
                .delete('/api/anaesthetists/999999')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
        });

        it('should return 400 for invalid ID format', async () => {
            const res = await request(app)
                .delete('/api/anaesthetists/abc')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
        });

        it('deleted anaesthetist should not appear in GET list', async () => {
            if (!deleteTargetId) return;

            const res = await request(app)
                .get('/api/anaesthetists')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            const ids = res.body.data.map(a => a.id);
            expect(ids).not.toContain(deleteTargetId);
        });
    });
});
