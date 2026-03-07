// ============================================================================
// Notification Controller Tests
// ============================================================================
// Created by: M4 (Oneli) - Day 16
//
// Tests for notification API endpoints:
// - POST  /api/notifications           (Create notification)
// - GET   /api/notifications           (Get my notifications)
// - GET   /api/notifications/unread-count (Get unread count)
//
// Run with: npm test -- --testPathPattern=notificationController
// ============================================================================

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

describe('Notification API Tests - Day 16', () => {
    let coordinatorToken;
    let staffToken;
    let coordinatorUserId;

    const uniqueId = Date.now();

    const coordinatorUser = {
        name: 'Notif Test Coordinator',
        email: `notif.coord${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234570'
    };

    const staffUser = {
        name: 'Notif Test Staff',
        email: `notif.staff${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'surgeon',
        phone: '0771234571'
    };

    // ========================================================================
    // Setup: Register and login test users
    // ========================================================================
    beforeAll(async () => {
        // Register + login coordinator
        const regRes = await request(app).post('/api/auth/register').send(coordinatorUser);
        coordinatorUserId = regRes.body?.user?.id;

        const coordLogin = await request(app).post('/api/auth/login').send({
            email: coordinatorUser.email,
            password: coordinatorUser.password
        });
        coordinatorToken = coordLogin.body.token;
        if (!coordinatorUserId) {
            coordinatorUserId = coordLogin.body.user?.id;
        }

        // Register + login staff
        await request(app).post('/api/auth/register').send(staffUser);
        const staffLogin = await request(app).post('/api/auth/login').send({
            email: staffUser.email,
            password: staffUser.password
        });
        staffToken = staffLogin.body.token;
    }, 30000);

    // ========================================================================
    // POST /api/notifications - Create Notification
    // ========================================================================
    describe('POST /api/notifications', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .send({ user_id: 1, title: 'Test', message: 'Hello' });

            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for non-coordinator users (RBAC)', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ user_id: 1, title: 'Test', message: 'Hello' });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when user_id is missing', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ title: 'Test', message: 'Hello' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/user_id/i);
        });

        it('should return 400 when title is missing', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ user_id: 1, message: 'Hello' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/title/i);
        });

        it('should return 400 when message is missing', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ user_id: 1, title: 'Test' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/message/i);
        });

        it('should create a notification for coordinator', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({
                    user_id: coordinatorUserId || 1,
                    title: 'Surgery Reminder',
                    message: 'Your surgery starts in 15 minutes',
                    type: 'reminder'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.title).toBe('Surgery Reminder');
            expect(res.body.data.type).toBe('reminder');
            expect(res.body.data.is_read).toBe(false);
        });
    });

    // ========================================================================
    // GET /api/notifications - Get My Notifications
    // ========================================================================
    describe('GET /api/notifications', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/notifications');
            expect(res.statusCode).toBe(401);
        });

        it('should return notifications for authenticated user', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('count');
        });

        it('should allow staff users to view their notifications', async () => {
            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    // ========================================================================
    // GET /api/notifications/unread-count - Get Unread Count
    // ========================================================================
    describe('GET /api/notifications/unread-count', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/api/notifications/unread-count');
            expect(res.statusCode).toBe(401);
        });

        it('should return unread count as a number', async () => {
            const res = await request(app)
                .get('/api/notifications/unread-count')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(typeof res.body.count).toBe('number');
            expect(res.body.count).toBeGreaterThanOrEqual(0);
        });

        it('should return count for staff users', async () => {
            const res = await request(app)
                .get('/api/notifications/unread-count')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(typeof res.body.count).toBe('number');
        });
    });

    // ========================================================================
    // PUT /api/notifications/:id/read - Mark Single As Read (Day 17)
    // ========================================================================
    describe('PUT /api/notifications/:id/read', () => {
        let notificationId;

        // Create a notification to mark as read
        beforeAll(async () => {
            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({
                    user_id: coordinatorUserId || 1,
                    title: 'Read Test Notification',
                    message: 'This will be marked as read',
                    type: 'info'
                });
            notificationId = res.body.data?.id;
        }, 15000);

        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .put(`/api/notifications/${notificationId}/read`);
            expect(res.statusCode).toBe(401);
        });

        it('should mark a notification as read', async () => {
            const res = await request(app)
                .put(`/api/notifications/${notificationId}/read`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.is_read).toBe(true);
            expect(res.body.data.read_at).toBeTruthy();
        });

        it('should return 404 for non-existent notification', async () => {
            const res = await request(app)
                .put('/api/notifications/99999/read')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 when staff tries to mark another user\'s notification', async () => {
            // The notification belongs to coordinator, not staff
            if (!notificationId) return;
            const res = await request(app)
                .put(`/api/notifications/${notificationId}/read`)
                .set('Authorization', `Bearer ${staffToken}`);

            // Should be 404 because the notification doesn't belong to staff user
            expect(res.statusCode).toBe(404);
        });
    });

    // ========================================================================
    // PUT /api/notifications/read-all - Mark All As Read (Day 17)
    // ========================================================================
    describe('PUT /api/notifications/read-all', () => {
        // Create a couple of unread notifications
        beforeAll(async () => {
            await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({
                    user_id: coordinatorUserId || 1,
                    title: 'Unread Bulk Test 1',
                    message: 'This should be marked read in bulk',
                    type: 'info'
                });
            await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({
                    user_id: coordinatorUserId || 1,
                    title: 'Unread Bulk Test 2',
                    message: 'This should also be marked read in bulk',
                    type: 'alert'
                });
        }, 15000);

        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .put('/api/notifications/read-all');
            expect(res.statusCode).toBe(401);
        });

        it('should mark all notifications as read', async () => {
            const res = await request(app)
                .put('/api/notifications/read-all')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(typeof res.body.count).toBe('number');
            expect(res.body.count).toBeGreaterThanOrEqual(0);
        });

        it('should return count 0 when no unread notifications remain', async () => {
            const res = await request(app)
                .put('/api/notifications/read-all')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(0);
        });
    });

    // ========================================================================
    // GET /api/notifications/poll - Poll New Notifications (Day 17 - M3)
    // ========================================================================
    describe('GET /api/notifications/poll', () => {
        let sinceTimestamp;

        // Record a timestamp, then create a notification after it
        beforeAll(async () => {
            sinceTimestamp = new Date().toISOString();
            // Wait a tiny bit to ensure the new notification's created_at > since
            await new Promise(r => setTimeout(r, 100));
            await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({
                    user_id: coordinatorUserId || 1,
                    title: 'Poll Test Notification',
                    message: 'Created after the since timestamp',
                    type: 'info'
                });
        }, 15000);

        it('should return 401 without auth token', async () => {
            const res = await request(app)
                .get('/api/notifications/poll')
                .query({ since: sinceTimestamp });
            expect(res.statusCode).toBe(401);
        });

        it('should return 400 when since parameter is missing', async () => {
            const res = await request(app)
                .get('/api/notifications/poll')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/since/i);
        });

        it('should return 400 for invalid since timestamp', async () => {
            const res = await request(app)
                .get('/api/notifications/poll')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .query({ since: 'not-a-date' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/invalid/i);
        });

        it('should return new notifications since timestamp', async () => {
            const res = await request(app)
                .get('/api/notifications/poll')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .query({ since: sinceTimestamp });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.count).toBeGreaterThanOrEqual(1);
            expect(typeof res.body.unreadCount).toBe('number');
            expect(res.body.polledAt).toBeTruthy();

            // Verify the notification we just created is included
            const found = res.body.data.find(n => n.title === 'Poll Test Notification');
            expect(found).toBeTruthy();
        });

        it('should return empty array for future since timestamp', async () => {
            const futureDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
            const res = await request(app)
                .get('/api/notifications/poll')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .query({ since: futureDate });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(0);
            expect(res.body.count).toBe(0);
        });

        it('should not return other users\' notifications when polling', async () => {
            const res = await request(app)
                .get('/api/notifications/poll')
                .set('Authorization', `Bearer ${staffToken}`)
                .query({ since: sinceTimestamp });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            // Staff user shouldn't see coordinator's "Poll Test Notification"
            const found = res.body.data.find(n => n.title === 'Poll Test Notification');
            expect(found).toBeFalsy();
        });
    });
});
