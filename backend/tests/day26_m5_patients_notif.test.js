/**
 * M5 Day 26 - Patient & Notification Integration Tests
 * 
 * This suite covers:
 * 1. Patient CRUD (Coordinator/Admin only for write operations)
 * 2. Patient Search & Filtering
 * 3. Notification Lifecycle (Create, List, Mark as Read)
 * 4. Notification Polling & User Isolation
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

let adminToken;
let coordToken;
let staffToken;
let adminUserId;
let coordUserId;
let staffUserId;
const ts = Date.now();

// Register and login users for testing
beforeAll(async () => {
    // Admin
    const adminReg = await request(app).post('/api/auth/register').send({
        name: 'M5 Admin',
        email: `m5.admin.${ts}@test.com`,
        password: 'TestPassword123!',
        role: 'admin',
        phone: `077${String(ts).slice(-7)}1`
    });
    adminUserId = adminReg.body?.user?.id;
    const adminLog = await request(app).post('/api/auth/login').send({
        email: `m5.admin.${ts}@test.com`,
        password: 'TestPassword123!'
    });
    adminToken = adminLog.body.token;

    // Coordinator
    const coordReg = await request(app).post('/api/auth/register').send({
        name: 'M5 Coord',
        email: `m5.coord.${ts}@test.com`,
        password: 'TestPassword123!',
        role: 'coordinator',
        phone: `077${String(ts).slice(-7)}2`
    });
    coordUserId = coordReg.body?.user?.id;
    const coordLog = await request(app).post('/api/auth/login').send({
        email: `m5.coord.${ts}@test.com`,
        password: 'TestPassword123!'
    });
    coordToken = coordLog.body.token;

    // Nurse/Staff
    const staffReg = await request(app).post('/api/auth/register').send({
        name: 'M5 Staff',
        email: `m5.staff.${ts}@test.com`,
        password: 'TestPassword123!',
        role: 'nurse',
        phone: `077${String(ts).slice(-7)}3`
    });
    staffUserId = staffReg.body?.user?.id;
    const staffLog = await request(app).post('/api/auth/login').send({
        email: `m5.staff.${ts}@test.com`,
        password: 'TestPassword123!'
    });
    staffToken = staffLog.body.token;
}, 30000);

describe('Patient & Notification API - M5 Day 26', () => {

    // ── PATIENT MODULE TESTS ───────────────────────────────────────────────
    describe('Patient Module', () => {
        let testPatientId;

        it('should allow coordinator to create a patient (201)', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${coordToken}`)
                .send({
                    name: `Patient M5 ${ts}`,
                    date_of_birth: '1985-10-20',
                    gender: 'female',
                    blood_type: 'B+',
                    phone: `099${String(ts).slice(-7)}`,
                    email: `m5.patient.${ts}@hospital.com`,
                    address: '88 Patient Road, Kandy'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(`Patient M5 ${ts}`);
            expect(res.body.data.age).toBeDefined();
            testPatientId = res.body.data.id;
        });

        it('should prevent nurse from creating a patient (403)', async () => {
            const res = await request(app)
                .post('/api/patients')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({
                    name: 'Bad Patient',
                    date_of_birth: '1990-01-01',
                    gender: 'male',
                    phone: '0000000000'
                });
            expect(res.statusCode).toBe(403);
        });

        it('should fetch patient list with search filter', async () => {
            const res = await request(app)
                .get(`/api/patients?search=Patient M5 ${ts}`)
                .set('Authorization', `Bearer ${staffToken}`); // Any auth user can view

            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
            expect(res.body.data[0].id).toBe(testPatientId);
        });

        it('should fetch patient by ID with empty surgery history', async () => {
            const res = await request(app)
                .get(`/api/patients/${testPatientId}`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.id).toBe(testPatientId);
            expect(Array.isArray(res.body.data.surgeries)).toBe(true);
        });

        it('should allow admin to update patient', async () => {
            const res = await request(app)
                .put(`/api/patients/${testPatientId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ blood_type: 'AB-' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.blood_type).toBe('AB-');
        });

        it('should soft-delete (deactivate) patient', async () => {
            const res = await request(app)
                .delete(`/api/patients/${testPatientId}`)
                .set('Authorization', `Bearer ${coordToken}`);

            expect(res.statusCode).toBe(200);
            
            // Should not appear in active list anymore
            const listRes = await request(app)
                .get('/api/patients')
                .set('Authorization', `Bearer ${coordToken}`);
            const found = listRes.body.data.find(p => p.id === testPatientId);
            expect(found).toBeUndefined();
        });
    });

    // ── NOTIFICATION MODULE TESTS ──────────────────────────────────────────
    describe('Notification Module', () => {
        let notifId;

        it('should allow admin to create a notification for staff (201)', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    user_id: staffUserId,
                    type: 'reminder',
                    title: 'Surgery Reminder',
                    message: 'Please check your schedule for tomorrow.'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            notifId = res.body.data.id;
        });

        it('should list notifications for staff user', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            const found = res.body.data.find(n => n.id === notifId);
            expect(found).toBeDefined();
            expect(found.is_read).toBe(false);
        });

        it('should isolate notifications (coord cannot see staff notif)', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${coordToken}`);

            const found = res.body.data.find(n => n.id === notifId);
            expect(found).toBeUndefined();
        });

        it('should mark notification as read', async () => {
            const res = await request(app)
                .put(`/api/notifications/${notifId}/read`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.is_read).toBe(true);
        });

        it('should poll for new notifications', async () => {
            const since = new Date(Date.now() - 10000).toISOString();
            const res = await request(app)
                .get('/api/notifications/poll')
                .set('Authorization', `Bearer ${staffToken}`)
                .query({ since });

            expect(res.statusCode).toBe(200);
            expect(res.body.unreadCount).toBeDefined();
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should return unread count', async () => {
            const res = await request(app)
                .get('/api/notifications/unread-count')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBeDefined();
        });
    });
});
