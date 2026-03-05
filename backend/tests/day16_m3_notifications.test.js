// ============================================================================
// Notification API Tests - M3 Day 16
// ============================================================================
// Created by: M3 (Janani) - Day 16
//
// Tests for:
//   GET  /api/notifications             - getUserNotifications
//   GET  /api/notifications/unread-count - getUnreadCount
//   POST /api/notifications             - createNotification
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
 * Get current user from token
 */
const getCurrentUser = async (token) => {
    const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
    return res.body?.data || res.body?.user || null;
};

// ─────────────────────────────────────────────────────────────────────────────
describe('Notification API - M3 Day 16', () => {

    // ── Verify routes are mounted ─────────────────────────────────────────────
    describe('Route mounting verification', () => {

        it('GET /api/notifications should return 401 without token (route is mounted)', async () => {
            const res = await request(app).get('/api/notifications');
            expect(res.statusCode).toBe(401);
        });

        it('GET /api/notifications/unread-count should return 401 without token', async () => {
            const res = await request(app).get('/api/notifications/unread-count');
            expect(res.statusCode).toBe(401);
        });

        it('POST /api/notifications should return 401 without token', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .send({ user_id: 1, title: 'Test', message: 'Test' });
            expect(res.statusCode).toBe(401);
        });
    });

    // ── GET /api/notifications ────────────────────────────────────────────────
    describe('GET /api/notifications', () => {

        it('should return 200 and an array of notifications for authenticated user', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.pagination).toBeDefined();
            expect(typeof res.body.pagination.total).toBe('number');
            expect(typeof res.body.pagination.hasMore).toBe('boolean');
        });

        it('should support ?type= filter', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/notifications?type=info')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            // If there are results, all should have type 'info'
            if (res.body.data.length > 0) {
                res.body.data.forEach((n) => {
                    expect(n.type).toBe('info');
                });
            }
        });

        it('should support ?is_read= filter', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/notifications?is_read=false')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            if (res.body.data.length > 0) {
                res.body.data.forEach((n) => {
                    expect(n.is_read).toBe(false);
                });
            }
        });

        it('should support ?limit= and ?offset= pagination', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/notifications?limit=5&offset=0')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeLessThanOrEqual(5);
            expect(res.body.pagination.limit).toBe(5);
            expect(res.body.pagination.offset).toBe(0);
        });
    });

    // ── GET /api/notifications/unread-count ───────────────────────────────────
    describe('GET /api/notifications/unread-count', () => {

        it('should return 200 and an unread_count number', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .get('/api/notifications/unread-count')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(typeof res.body.data.unread_count).toBe('number');
            expect(res.body.data.unread_count).toBeGreaterThanOrEqual(0);
        });
    });

    // ── POST /api/notifications ───────────────────────────────────────────────
    describe('POST /api/notifications', () => {

        it('should return 403 for non-coordinator/admin users', async () => {
            const token = await getToken('nurse');
            if (!token) return;

            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${token}`)
                .send({ user_id: 1, title: 'Test', message: 'Test message' });

            expect(res.statusCode).toBe(403);
        });

        it('should return 400 if required fields are missing', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Missing user_id and message' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for invalid notification type', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user_id: 1,
                    type: 'invalid_type',
                    title: 'Test',
                    message: 'Test message'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 if target user does not exist', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user_id: 999999999,
                    title: 'Test',
                    message: 'No such user'
                });

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should create a notification successfully as coordinator', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            // Get current user to create notification for them
            const user = await getCurrentUser(token);
            if (!user) return;

            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user_id: user.id,
                    type: 'info',
                    title: 'Test Notification M3 Day 16',
                    message: 'This is a test notification created by M3 Day 16 tests'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
            expect(res.body.data.title).toBe('Test Notification M3 Day 16');
            expect(res.body.data.type).toBe('info');
            expect(res.body.data.is_read).toBe(false);
        });

        it('should create notification with surgery_id if provided', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const user = await getCurrentUser(token);
            if (!user) return;

            // Get a surgery ID if one exists
            const surgeriesRes = await request(app)
                .get('/api/surgeries')
                .set('Authorization', `Bearer ${token}`);

            const surgeryId = surgeriesRes.body?.data?.[0]?.id;

            const payload = {
                user_id: user.id,
                type: 'reminder',
                title: 'Surgery Reminder',
                message: 'Your surgery is starting soon'
            };

            if (surgeryId) {
                payload.surgery_id = surgeryId;
            }

            const res = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${token}`)
                .send(payload);

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.type).toBe('reminder');
        });
    });

    // ── End-to-End: Create → Fetch → Verify ──────────────────────────────────
    describe('E2E: Create notification, then fetch it', () => {

        it('should show created notification in user list', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const user = await getCurrentUser(token);
            if (!user) return;

            // Create a unique notification
            const uniqueTitle = `E2E Test ${Date.now()}`;
            const createRes = await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user_id: user.id,
                    type: 'warning',
                    title: uniqueTitle,
                    message: 'E2E test notification for M3 Day 16'
                });

            expect(createRes.statusCode).toBe(201);

            // Fetch notifications and find the one we just created
            const listRes = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${token}`);

            expect(listRes.statusCode).toBe(200);
            const found = listRes.body.data.find((n) => n.title === uniqueTitle);
            expect(found).toBeDefined();
            expect(found.type).toBe('warning');
            expect(found.is_read).toBe(false);
        });

        it('unread count should increase after creating an unread notification', async () => {
            const token = await getToken('coordinator');
            if (!token) return;

            const user = await getCurrentUser(token);
            if (!user) return;

            // Get initial unread count
            const beforeRes = await request(app)
                .get('/api/notifications/unread-count')
                .set('Authorization', `Bearer ${token}`);
            const beforeCount = beforeRes.body.data.unread_count;

            // Create a new notification
            await request(app)
                .post('/api/notifications')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    user_id: user.id,
                    type: 'success',
                    title: `Unread Count Test ${Date.now()}`,
                    message: 'Testing unread count increment'
                });

            // Get updated unread count
            const afterRes = await request(app)
                .get('/api/notifications/unread-count')
                .set('Authorization', `Bearer ${token}`);
            const afterCount = afterRes.body.data.unread_count;

            expect(afterCount).toBe(beforeCount + 1);
        });
    });
});
