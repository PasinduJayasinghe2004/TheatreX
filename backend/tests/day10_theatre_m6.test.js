// ============================================================================
// Theatre API Tests – M6 (Dinil) – Day 10
// ============================================================================
// Comprehensive QA test suite for all theatre endpoints.
//
// Endpoints tested:
//   GET  /api/theatres                        - List theatres (filters)
//   GET  /api/theatres/availability           - Check availability
//   GET  /api/theatres/:id                    - Theatre detail
//   PUT  /api/theatres/:id/status             - Status update (RBAC + transitions)
//   GET  /api/theatres/:id/current-surgery    - Current in-progress surgery
//
// Run with: npm test -- --testPathPattern=day10_theatre_m6
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

// ============================================================================
// SETUP
// ============================================================================
describe('M6 Theatre API Tests – Day 10', () => {
    let coordinatorToken;
    let staffToken;
    let testTheatreId;

    const uniqueId = Date.now();

    const coordinator = {
        name: 'M6 Coord User',
        email: `m6.coord.${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0779000001'
    };

    const staffMember = {
        name: 'M6 Staff User',
        email: `m6.staff.${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'nurse',
        phone: '0779000002'
    };

    beforeAll(async () => {
        // Register and login coordinator
        await request(app).post('/api/auth/register').send(coordinator);
        const coordRes = await request(app).post('/api/auth/login').send({
            email: coordinator.email,
            password: coordinator.password
        });
        coordinatorToken = coordRes.body.token;

        // Register and login staff member
        await request(app).post('/api/auth/register').send(staffMember);
        const staffRes = await request(app).post('/api/auth/login').send({
            email: staffMember.email,
            password: staffMember.password
        });
        staffToken = staffRes.body.token;

        // Fetch a real theatre ID for subsequent tests
        const theatreRes = await request(app)
            .get('/api/theatres')
            .set('Authorization', `Bearer ${coordinatorToken}`);
        if (theatreRes.body.data && theatreRes.body.data.length > 0) {
            testTheatreId = theatreRes.body.data[0].id;
        }
    });

    // ==========================================================================
    // BLOCK 1 – Authentication guard (no token)
    // ==========================================================================
    describe('Auth guard – all endpoints require token', () => {
        it('GET /api/theatres → 401 without token', async () => {
            const res = await request(app).get('/api/theatres');
            expect(res.statusCode).toBe(401);
        });

        it('GET /api/theatres/availability → 401 without token', async () => {
            const res = await request(app)
                .get('/api/theatres/availability?date=2025-01-01&time=09:00&duration=60');
            expect(res.statusCode).toBe(401);
        });

        it('GET /api/theatres/:id → 401 without token', async () => {
            const res = await request(app).get('/api/theatres/1');
            expect(res.statusCode).toBe(401);
        });

        it('PUT /api/theatres/:id/status → 401 without token', async () => {
            const res = await request(app)
                .put('/api/theatres/1/status')
                .send({ status: 'maintenance' });
            expect(res.statusCode).toBe(401);
        });

        it('GET /api/theatres/:id/current-surgery → 401 without token', async () => {
            const res = await request(app).get('/api/theatres/1/current-surgery');
            expect(res.statusCode).toBe(401);
        });
    });

    // ==========================================================================
    // BLOCK 2 – GET /api/theatres (list)
    // ==========================================================================
    describe('GET /api/theatres – list theatres', () => {
        it('should return success + array + count with valid token', async () => {
            const res = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(typeof res.body.count).toBe('number');
            expect(res.body.count).toBe(res.body.data.length);
        });

        it('should allow staff users to view the list', async () => {
            const res = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should reject an invalid status filter with 400', async () => {
            const res = await request(app)
                .get('/api/theatres?status=bogus')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject an invalid type filter with 400', async () => {
            const res = await request(app)
                .get('/api/theatres?type=invalid_type')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should accept ?status=available filter and return only matching theatres', async () => {
            const res = await request(app)
                .get('/api/theatres?status=available')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            res.body.data.forEach(t => {
                expect(t.status).toBe('available');
            });
        });

        it('should accept ?type=general filter and return only matching theatres', async () => {
            const res = await request(app)
                .get('/api/theatres?type=general')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            res.body.data.forEach(t => {
                expect(t.theatre_type).toBe('general');
            });
        });

        it('should accept combined status + type filters', async () => {
            const res = await request(app)
                .get('/api/theatres?status=available&type=general')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            res.body.data.forEach(t => {
                expect(t.status).toBe('available');
                expect(t.theatre_type).toBe('general');
            });
        });

        it('each theatre in the list should have required fields', async () => {
            const res = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            res.body.data.forEach(t => {
                expect(t).toHaveProperty('id');
                expect(t).toHaveProperty('name');
                expect(t).toHaveProperty('status');
                expect(t).toHaveProperty('theatre_type');
                expect(t).toHaveProperty('is_active');
            });
        });
    });

    // ==========================================================================
    // BLOCK 3 – GET /api/theatres/availability
    // ==========================================================================
    describe('GET /api/theatres/availability – check availability', () => {
        it('should return 400 when all query params are missing', async () => {
            const res = await request(app)
                .get('/api/theatres/availability')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when date is missing', async () => {
            const res = await request(app)
                .get('/api/theatres/availability?time=09:00&duration=60')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when time is missing', async () => {
            const res = await request(app)
                .get('/api/theatres/availability?date=2025-06-01&duration=60')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when duration is missing', async () => {
            const res = await request(app)
                .get('/api/theatres/availability?date=2025-06-01&time=09:00')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for non-numeric duration', async () => {
            const res = await request(app)
                .get('/api/theatres/availability?date=2025-06-01&time=09:00&duration=abc')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for zero or negative duration', async () => {
            const res = await request(app)
                .get('/api/theatres/availability?date=2025-06-01&time=09:00&duration=0')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return success with all required params', async () => {
            const res = await request(app)
                .get('/api/theatres/availability?date=2025-06-01&time=09:00&duration=60')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body).toHaveProperty('available_count');
            expect(res.body).toHaveProperty('count');
        });

        it('each theatre in availability response should have an "available" boolean field', async () => {
            const res = await request(app)
                .get('/api/theatres/availability?date=2025-06-01&time=09:00&duration=60')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            res.body.data.forEach(t => {
                expect(typeof t.available).toBe('boolean');
            });
        });

        it('should allow staff to check availability', async () => {
            const res = await request(app)
                .get('/api/theatres/availability?date=2025-06-01&time=09:00&duration=60')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('response should echo back the query params', async () => {
            const res = await request(app)
                .get('/api/theatres/availability?date=2025-06-01&time=09:00&duration=90')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.query).toMatchObject({
                date: '2025-06-01',
                time: '09:00',
                duration: 90
            });
        });
    });

    // ==========================================================================
    // BLOCK 4 – GET /api/theatres/:id (detail)
    // ==========================================================================
    describe('GET /api/theatres/:id – theatre detail', () => {
        it('should return 404 for a non-existent theatre (id = 999999)', async () => {
            const res = await request(app)
                .get('/api/theatres/999999')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return detail for a real theatre', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id', testTheatreId);
            expect(res.body.data).toHaveProperty('name');
            expect(res.body.data).toHaveProperty('status');
            expect(res.body.data).toHaveProperty('theatre_type');
        });

        it('should include upcoming_surgeries array in detail response', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data.upcoming_surgeries)).toBe(true);
        });

        it('should include surgery_history array in detail response', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body.data.surgery_history)).toBe(true);
        });

        it('should include stats object in detail response', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.stats).toMatchObject({
                completed_this_week: expect.any(Number),
                cancelled_this_week: expect.any(Number),
                upcoming_total: expect.any(Number)
            });
        });

        it('should allow staff to view theatre detail', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ==========================================================================
    // BLOCK 5 – PUT /api/theatres/:id/status (RBAC + validation)
    // ==========================================================================
    describe('PUT /api/theatres/:id/status – update status (RBAC + validation)', () => {
        it('should return 403 when staff user tries to update status', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ status: 'maintenance' });

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when status field is missing', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for an invalid status value', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: 'not_a_real_status' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 for a non-existent theatre', async () => {
            const res = await request(app)
                .put('/api/theatres/999999/status')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: 'maintenance' });

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 for an invalid status transition', async () => {
            if (!testTheatreId) return;

            // First, get the current status of the theatre
            const detailRes = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const currentStatus = detailRes.body.data.status;

            // Try an invalid transition:
            // If the theatre is available, we cannot go directly to 'cleaning'
            // If the theatre is in_use, we cannot go directly to 'maintenance'
            // If the theatre is maintenance or cleaning, we cannot go to 'in_use'
            const invalidTransitions = {
                available: 'cleaning',      // must go available → in_use → cleaning
                in_use: 'maintenance',   // must go in_use → cleaning → available → maintenance
                maintenance: 'in_use',        // must go maintenance → available → in_use
                cleaning: 'maintenance'    // must go cleaning → available → maintenance
            };

            const invalidTarget = invalidTransitions[currentStatus];
            if (!invalidTarget) return; // fallback guard

            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: invalidTarget });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Cannot transition/);
        });

        it('coordinator can update to a valid next status', async () => {
            if (!testTheatreId) return;

            // First, get the current status
            const detailRes = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const currentStatus = detailRes.body.data.status;

            // Pick the first valid transition for the current status
            const validTransitions = {
                available: 'in_use',
                in_use: 'available',
                maintenance: 'available',
                cleaning: 'available'
            };

            const newStatus = validTransitions[currentStatus];
            if (!newStatus) return;

            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: newStatus });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe(newStatus);

            // Restore original status - pick valid path back
            // available → in_use (restore) or in_use → available (restore)
            const restoreMap = {
                in_use: 'available',
                available: 'in_use',
                maintenance: 'available',
                cleaning: 'available'
            };
            const restoreStatus = restoreMap[currentStatus] !== newStatus
                ? currentStatus
                : restoreMap[newStatus];

            // Get current status after our change, then restore
            const afterRes = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);
            const afterStatus = afterRes.body.data.status;

            const validRestoreMap = {
                available: 'in_use',
                in_use: 'available',
                maintenance: 'available',
                cleaning: 'available'
            };
            const finalTarget = validRestoreMap[afterStatus];
            if (finalTarget) {
                await request(app)
                    .put(`/api/theatres/${testTheatreId}/status`)
                    .set('Authorization', `Bearer ${coordinatorToken}`)
                    .send({ status: finalTarget });
            }
        });

        it('successful status update should include previous status in message', async () => {
            if (!testTheatreId) return;

            // Get current status first
            const detailRes = await request(app)
                .get(`/api/theatres/${testTheatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const currentStatus = detailRes.body.data.status;
            const validTransitions = {
                available: 'in_use',
                in_use: 'available',
                maintenance: 'available',
                cleaning: 'available'
            };
            const newStatus = validTransitions[currentStatus];
            if (!newStatus) return;

            const res = await request(app)
                .put(`/api/theatres/${testTheatreId}/status`)
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({ status: newStatus });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toContain(currentStatus);
            expect(res.body.message).toContain(newStatus);
        });
    });

    // ==========================================================================
    // BLOCK 6 – GET /api/theatres/:id/current-surgery
    // ==========================================================================
    describe('GET /api/theatres/:id/current-surgery – current surgery', () => {
        it('should return 404-like 401 without token', async () => {
            const res = await request(app)
                .get('/api/theatres/1/current-surgery');

            expect(res.statusCode).toBe(401);
        });

        it('should return success + null data when no surgery is in progress', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}/current-surgery`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            // Either a real surgery is found (200 + data object) or none (200 + null)
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('current surgery endpoint should work for staff users', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}/current-surgery`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('response data (when present) should have surgery fields', async () => {
            if (!testTheatreId) return;

            const res = await request(app)
                .get(`/api/theatres/${testTheatreId}/current-surgery`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.statusCode).toBe(200);
            if (res.body.data !== null) {
                expect(res.body.data).toHaveProperty('id');
                expect(res.body.data).toHaveProperty('surgery_type');
                expect(res.body.data).toHaveProperty('status');
                expect(res.body.data.status).toBe('in_progress');
            } else {
                // Null is a valid response when no surgery is running
                expect(res.body.data).toBeNull();
            }
        });
    });
});
