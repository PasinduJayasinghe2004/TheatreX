// ============================================================================
// Full Notification Flow Tests - M6 Day 17
// ============================================================================
// Created by: M6 (Dinil) - Day 17
//
// End-to-end integration tests for the complete notification lifecycle.
// These tests exercise the full flow rather than individual endpoints
// in isolation, verifying that the system works correctly as a whole.
//
// Flows covered:
//  1. Full lifecycle: create → list → unread-count → mark-read → mark-all-read
//  2. Delta poll:     create → record timestamp → create more → poll → get delta
//  3. Pagination:     create N notifications → paginate through them
//  4. is_read filter: create mix → filter unread-only → filter read-only
//  5. Type filter:    create typed notifications → filter by type
//
// Run: npx jest tests/day17_m6_notification_flow.test.js --no-coverage --verbose
// ============================================================================

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

// ── Shared test state ────────────────────────────────────────────────────────
let coordToken;
let staffToken;
let coordUserId;
const uid = Date.now();

const coordUser = {
    name: 'Flow Test Coordinator',
    email: `flow.coord.${uid}@theatrex.com`,
    password: 'FlowTest123!',
    role: 'coordinator',
    phone: '0771234800'
};

const staffUser = {
    name: 'Flow Test Staff',
    email: `flow.staff.${uid}@theatrex.com`,
    password: 'FlowTest123!',
    role: 'surgeon',
    phone: '0771234801'
};

// ── Shared setup ─────────────────────────────────────────────────────────────
beforeAll(async () => {
    // Register & login coordinator
    const coordRegRes = await request(app)
        .post('/api/auth/register')
        .send(coordUser);
    coordUserId = coordRegRes.body?.user?.id;

    const coordLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: coordUser.email, password: coordUser.password });
    coordToken = coordLoginRes.body.token;
    if (!coordUserId) coordUserId = coordLoginRes.body.user?.id;

    // Register & login staff
    await request(app).post('/api/auth/register').send(staffUser);
    const staffLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: staffUser.email, password: staffUser.password });
    staffToken = staffLoginRes.body.token;
}, 30000);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: create a notification via API
// ─────────────────────────────────────────────────────────────────────────────
const createNotif = (token, userId, overrides = {}) =>
    request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send({
            user_id: userId,
            title: 'Flow Test Notification',
            message: 'Created by M6 Day 17 flow test',
            type: 'info',
            ...overrides
        });

// ============================================================================
// FLOW 1: Full Notification Lifecycle
// create → list → unread-count → mark-single-read → verify → mark-all-read
// ============================================================================
describe('Flow 1 – Full Notification Lifecycle (M6 Day 17)', () => {
    let notifId;

    it('Step 1: coordinator creates a notification for themselves', async () => {
        const res = await createNotif(coordToken, coordUserId, {
            title: 'Lifecycle Flow Notif',
            type: 'reminder'
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.is_read).toBe(false);
        notifId = res.body.data.id;
    });

    it('Step 2: notification appears in the list for current user', async () => {
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);

        // Our newly created notification should be in the list
        const found = res.body.data.find(n => n.id === notifId);
        expect(found).toBeTruthy();
        expect(found.is_read).toBe(false);
    });

    it('Step 3: unread-count reflects the new notification', async () => {
        const res = await request(app)
            .get('/api/notifications/unread-count')
            .set('Authorization', `Bearer ${coordToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        // count should be at least 1 (may be more from other tests)
        expect(typeof res.body.count).toBe('number');
        expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('Step 4: mark the notification as read', async () => {
        expect(notifId).toBeTruthy();
        const res = await request(app)
            .put(`/api/notifications/${notifId}/read`)
            .set('Authorization', `Bearer ${coordToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.is_read).toBe(true);
        expect(res.body.data.id).toBe(notifId);
    });

    it('Step 5: the notification no longer appears as unread after mark-read', async () => {
        // Fetch notifications and check this one is now marked read
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`);

        expect(res.statusCode).toBe(200);
        const found = res.body.data.find(n => n.id === notifId);
        if (found) {
            expect(found.is_read).toBe(true);
        }
    });

    it('Step 6: mark-all-read returns count 0 when called again', async () => {
        // First call: mark all as read (clears any remaining unread)
        const res1 = await request(app)
            .put('/api/notifications/read-all')
            .set('Authorization', `Bearer ${coordToken}`);
        expect(res1.statusCode).toBe(200);
        expect(res1.body.success).toBe(true);
        expect(typeof res1.body.count).toBe('number');

        // Second call: should return 0 (nothing left to mark read)
        const res2 = await request(app)
            .put('/api/notifications/read-all')
            .set('Authorization', `Bearer ${coordToken}`);
        expect(res2.statusCode).toBe(200);
        expect(res2.body.count).toBe(0);
    });

    it('Step 7: unread-count is 0 after mark-all-read', async () => {
        const res = await request(app)
            .get('/api/notifications/unread-count')
            .set('Authorization', `Bearer ${coordToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(0);
    });
});

// ============================================================================
// FLOW 2: Polling Delta Flow
// Record timestamp → create notifications → poll → only new ones returned
// ============================================================================
describe('Flow 2 – Polling Delta Flow (M6 Day 17)', () => {
    let sinceTimestamp;
    let polledNotifId;

    it('Step 1: record a timestamp (before creating new notifications)', () => {
        sinceTimestamp = new Date().toISOString();
        expect(sinceTimestamp).toBeTruthy();
    });

    it('Step 2: create a new notification after the timestamp', async () => {
        // Small delay to ensure created_at > sinceTimestamp
        await new Promise(r => setTimeout(r, 150));

        const res = await createNotif(coordToken, coordUserId, {
            title: 'Poll Delta Test',
            type: 'alert'
        });
        expect(res.statusCode).toBe(201);
        polledNotifId = res.body.data.id;
    });

    it('Step 3: poll returns only notifications created after sinceTimestamp', async () => {
        expect(sinceTimestamp).toBeTruthy();
        const res = await request(app)
            .get('/api/notifications/poll')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ since: sinceTimestamp });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.count).toBeGreaterThanOrEqual(1);
        expect(res.body.polledAt).toBeTruthy();
        expect(typeof res.body.unreadCount).toBe('number');

        // Our notification must be in the poll result
        const found = res.body.data.find(n => n.id === polledNotifId);
        expect(found).toBeTruthy();
        expect(found.title).toBe('Poll Delta Test');
    });

    it('Step 4: poll with a future timestamp returns empty array', async () => {
        const futureTs = new Date(Date.now() + 86400000).toISOString();
        const res = await request(app)
            .get('/api/notifications/poll')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ since: futureTs });

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveLength(0);
        expect(res.body.count).toBe(0);
    });

    it('Step 5: staff user cannot see coordinator notifications via poll', async () => {
        expect(sinceTimestamp).toBeTruthy();
        const res = await request(app)
            .get('/api/notifications/poll')
            .set('Authorization', `Bearer ${staffToken}`)
            .query({ since: sinceTimestamp });

        expect(res.statusCode).toBe(200);
        const found = res.body.data.find(n => n.id === polledNotifId);
        expect(found).toBeFalsy();
    });

    it('Step 6: poll without since param returns 400', async () => {
        const res = await request(app)
            .get('/api/notifications/poll')
            .set('Authorization', `Bearer ${coordToken}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/since/i);
    });

    it('Step 7: poll with invalid timestamp returns 400', async () => {
        const res = await request(app)
            .get('/api/notifications/poll')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ since: 'not-a-real-date' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/invalid/i);
    });
});

// ============================================================================
// FLOW 3: Pagination Flow
// Create several notifications → paginate → verify offset + limit work
// ============================================================================
describe('Flow 3 – Pagination Flow (M6 Day 17)', () => {
    const createdIds = [];

    beforeAll(async () => {
        // Create 5 notifications
        for (let i = 1; i <= 5; i++) {
            const res = await createNotif(coordToken, coordUserId, {
                title: `Pagination Test ${i}`,
                message: `Message ${i}`,
                type: 'info'
            });
            if (res.body.data?.id) createdIds.push(res.body.data.id);
        }
    }, 30000);

    it('page 1 (limit=2, offset=0) returns 2 notifications', async () => {
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ limit: 2, offset: 0 });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(2);
        expect(res.body.pagination).toBeTruthy();
        expect(res.body.pagination.limit).toBe(2);
        expect(res.body.pagination.offset).toBe(0);
        expect(res.body.pagination.total).toBeGreaterThanOrEqual(5);
    });

    it('page 2 (limit=2, offset=2) returns a different page', async () => {
        const page1Res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ limit: 2, offset: 0 });

        const page2Res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ limit: 2, offset: 2 });

        expect(page2Res.statusCode).toBe(200);
        expect(page2Res.body.data.length).toBe(2);

        // IDs on page 2 should differ from page 1
        const page1Ids = page1Res.body.data.map(n => n.id);
        const page2Ids = page2Res.body.data.map(n => n.id);
        const overlap = page1Ids.filter(id => page2Ids.includes(id));
        expect(overlap).toHaveLength(0);
    });

    it('hasMore is true when more pages exist', async () => {
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ limit: 2, offset: 0 });

        expect(res.body.pagination.hasMore).toBe(true);
    });

    it('hasMore is false on the last page', async () => {
        // Get total count first
        const countRes = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`);
        const total = countRes.body.pagination.total;

        // Go to the last page
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ limit: 100, offset: 0 });

        expect(res.statusCode).toBe(200);
        expect(res.body.pagination.hasMore).toBe(false);
    });
});

// ============================================================================
// FLOW 4: is_read Filter Flow
// Create mix of read + unread → filter each → verify returned subset
// ============================================================================
describe('Flow 4 – is_read Filter Flow (M6 Day 17)', () => {
    let unreadId;
    let readId;

    beforeAll(async () => {
        // Create an unread notification
        const unreadRes = await createNotif(coordToken, coordUserId, {
            title: 'Filter Test – Unread',
            type: 'info'
        });
        unreadId = unreadRes.body.data?.id;

        // Create a notification and immediately mark it read
        const readRes = await createNotif(coordToken, coordUserId, {
            title: 'Filter Test – Read',
            type: 'info'
        });
        readId = readRes.body.data?.id;
        if (readId) {
            await request(app)
                .put(`/api/notifications/${readId}/read`)
                .set('Authorization', `Bearer ${coordToken}`);
        }
    }, 30000);

    it('?is_read=false returns only unread notifications', async () => {
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ is_read: 'false' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        // Every returned notification should be unread
        res.body.data.forEach(n => {
            expect(n.is_read).toBe(false);
        });

        if (unreadId) {
            const found = res.body.data.find(n => n.id === unreadId);
            expect(found).toBeTruthy();
        }
    });

    it('?is_read=true returns only read notifications', async () => {
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ is_read: 'true' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        res.body.data.forEach(n => {
            expect(n.is_read).toBe(true);
        });

        if (readId) {
            const found = res.body.data.find(n => n.id === readId);
            expect(found).toBeTruthy();
        }
    });

    it('?is_read=false does NOT include the read notification', async () => {
        if (!readId) return;
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ is_read: 'false' });

        const found = res.body.data.find(n => n.id === readId);
        expect(found).toBeFalsy();
    });
});

// ============================================================================
// FLOW 5: Notification Types Enumeration Flow
// GET /types → validate all 5 types exist → create by type → filter by type
// ============================================================================
describe('Flow 5 – Notification Types Flow (M6 Day 17)', () => {
    const EXPECTED_TYPES = ['reminder', 'alert', 'info', 'warning', 'success'];

    it('GET /types returns all 5 valid types with labels', async () => {
        const res = await request(app)
            .get('/api/notifications/types')
            .set('Authorization', `Bearer ${coordToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(5);

        const returnedValues = res.body.data.map(t => t.value);
        EXPECTED_TYPES.forEach(type => {
            expect(returnedValues).toContain(type);
        });

        // Each type must have a label
        res.body.data.forEach(t => {
            expect(typeof t.label).toBe('string');
            expect(t.label.length).toBeGreaterThan(0);
        });
    });

    it('can create a notification for each valid type', async () => {
        for (const type of EXPECTED_TYPES) {
            const res = await createNotif(coordToken, coordUserId, {
                title: `Type Test – ${type}`,
                type
            });
            expect(res.statusCode).toBe(201);
            expect(res.body.data.type).toBe(type);
        }
    });

    it('creating with an invalid type returns 400', async () => {
        const res = await createNotif(coordToken, coordUserId, {
            title: 'Bad Type Test',
            type: 'unknown_type'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('GET /notifications?type=reminder returns only reminder type', async () => {
        // Ensure at least one reminder exists
        await createNotif(coordToken, coordUserId, {
            title: 'Type Filter Reminder',
            type: 'reminder'
        });

        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ type: 'reminder' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        res.body.data.forEach(n => {
            expect(n.type).toBe('reminder');
        });
    });

    it('GET /notifications?type=invalid_type returns 400', async () => {
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${coordToken}`)
            .query({ type: 'invalid_xyz' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

// ============================================================================
// FLOW 6: Cleanup Flow
// Coordinator can cleanup, staff gets 403, cleanup returns a count
// ============================================================================
describe('Flow 6 – Cleanup Flow (M6 Day 17)', () => {
    it('staff gets 403 when attempting cleanup', async () => {
        const res = await request(app)
            .put('/api/notifications/cleanup')
            .set('Authorization', `Bearer ${staffToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });

    it('coordinator can perform cleanup and receives a count', async () => {
        const res = await request(app)
            .put('/api/notifications/cleanup')
            .set('Authorization', `Bearer ${coordToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/cleanup successful/i);
        expect(typeof res.body.count).toBe('number');
        expect(res.body.count).toBeGreaterThanOrEqual(0);
    });

    it('unauthenticated request to cleanup returns 401', async () => {
        const res = await request(app).put('/api/notifications/cleanup');
        expect(res.statusCode).toBe(401);
    });
});

// ============================================================================
// FLOW 7: Security / Isolation Flow
// Staff cannot see coordinator's notifications or mark them as read
// ============================================================================
describe('Flow 7 – User Isolation Flow (M6 Day 17)', () => {
    let coordNotifId;

    beforeAll(async () => {
        const res = await createNotif(coordToken, coordUserId, {
            title: 'Isolation Test Notification',
            type: 'info'
        });
        coordNotifId = res.body.data?.id;
    }, 15000);

    it('staff user list does NOT include coordinator notifications', async () => {
        if (!coordNotifId) return;
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${staffToken}`);

        expect(res.statusCode).toBe(200);
        const found = res.body.data.find(n => n.id === coordNotifId);
        expect(found).toBeFalsy();
    });

    it('staff cannot mark coordinator notification as read (404)', async () => {
        if (!coordNotifId) return;
        const res = await request(app)
            .put(`/api/notifications/${coordNotifId}/read`)
            .set('Authorization', `Bearer ${staffToken}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('GET /api/notifications returns 401 for unauthenticated request', async () => {
        const res = await request(app).get('/api/notifications');
        expect(res.statusCode).toBe(401);
    });

    it('PUT /api/notifications/read-all returns 401 for unauthenticated request', async () => {
        const res = await request(app).put('/api/notifications/read-all');
        expect(res.statusCode).toBe(401);
    });
});
