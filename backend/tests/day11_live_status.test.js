// ============================================================================
// Live Status Polling Tests (Backend + Integration)
// ============================================================================
// Created by: M3 (Janani) - Day 11
//
// Tests for:
// 1. GET /api/theatres/live-status endpoint (integration)
//    - Authentication requirement
//    - Response structure (summary, data, polled_at)
//    - Current surgery enrichment with auto-progress
//    - Accessible by any authenticated role
// 2. usePolling hook behaviour (frontend unit - see frontend tests)
//
// Run with: npm test -- --testPathPattern=day11_live_status
// ============================================================================

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

// ============================================================================
// INTEGRATION TESTS: GET /api/theatres/live-status
// ============================================================================

describe('Live Status Polling API - Integration Tests', () => {
    let coordinatorToken;
    let staffToken;

    const uniqueId = Date.now();

    const coordinatorUser = {
        name: 'LivePoll Test Coordinator',
        email: `livepoll.coord${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234570'
    };

    const staffUser = {
        name: 'LivePoll Test Staff',
        email: `livepoll.staff${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'staff',
        phone: '0771234571'
    };

    // ====================================================================
    // Setup
    // ====================================================================
    beforeAll(async () => {
        // Register coordinator
        await request(app).post('/api/auth/register').send(coordinatorUser);
        const coordLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: coordinatorUser.email, password: coordinatorUser.password });
        coordinatorToken = coordLogin.body.token;

        // Register staff
        await request(app).post('/api/auth/register').send(staffUser);
        const staffLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: staffUser.email, password: staffUser.password });
        staffToken = staffLogin.body.token;
    });

    // ====================================================================
    // Authentication
    // ====================================================================

    describe('Authentication', () => {
        it('should return 401 when no token is provided', async () => {
            const res = await request(app).get('/api/theatres/live-status');
            expect(res.status).toBe(401);
        });

        it('should accept a valid coordinator token', async () => {
            const res = await request(app)
                .get('/api/theatres/live-status')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should accept a valid staff token', async () => {
            const res = await request(app)
                .get('/api/theatres/live-status')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ====================================================================
    // Response Structure
    // ====================================================================

    describe('Response structure', () => {
        it('should return success, polled_at, summary and data', async () => {
            const res = await request(app)
                .get('/api/theatres/live-status')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('polled_at');
            expect(res.body).toHaveProperty('summary');
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should include polled_at as a valid ISO date string', async () => {
            const res = await request(app)
                .get('/api/theatres/live-status')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const polledAt = new Date(res.body.polled_at);
            expect(polledAt.toISOString()).toBe(res.body.polled_at);
        });

        it('should return summary with counts for each status', async () => {
            const res = await request(app)
                .get('/api/theatres/live-status')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            const { summary } = res.body;
            expect(summary).toHaveProperty('total');
            expect(summary).toHaveProperty('available');
            expect(summary).toHaveProperty('in_use');
            expect(summary).toHaveProperty('maintenance');
            expect(summary).toHaveProperty('cleaning');
            expect(summary).toHaveProperty('overdue');

            // Total should equal sum of individual statuses
            expect(summary.total).toBe(
                summary.available + summary.in_use + summary.maintenance + summary.cleaning
            );
        });
    });

    // ====================================================================
    // Theatre Data Shape
    // ====================================================================

    describe('Theatre data shape', () => {
        it('should return theatres with expected fields', async () => {
            const res = await request(app)
                .get('/api/theatres/live-status')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);

            const theatre = res.body.data[0];
            expect(theatre).toHaveProperty('id');
            expect(theatre).toHaveProperty('name');
            expect(theatre).toHaveProperty('status');
            expect(theatre).toHaveProperty('theatre_type');
            expect(theatre).toHaveProperty('current_surgery');
        });

        it('theatre.current_surgery should be null when no surgery is in progress', async () => {
            const res = await request(app)
                .get('/api/theatres/live-status')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            // Find a theatre with status = available (likely no current surgery)
            const freeTheatre = res.body.data.find(t => t.status === 'available');
            if (freeTheatre) {
                expect(freeTheatre.current_surgery).toBeNull();
            }
        });

        it('theatre.current_surgery should include auto-progress fields when in_use', async () => {
            const res = await request(app)
                .get('/api/theatres/live-status')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            // Find a theatre that has a current surgery
            const busyTheatre = res.body.data.find(t => t.current_surgery !== null);
            if (busyTheatre) {
                const s = busyTheatre.current_surgery;
                expect(s).toHaveProperty('id');
                expect(s).toHaveProperty('surgery_type');
                expect(s).toHaveProperty('patient_name');
                expect(s).toHaveProperty('scheduled_time');
                expect(s).toHaveProperty('duration_minutes');
                expect(s).toHaveProperty('manual_progress');
                expect(s).toHaveProperty('auto_progress');
                expect(s).toHaveProperty('elapsed_minutes');
                expect(s).toHaveProperty('remaining_minutes');
                expect(s).toHaveProperty('is_overdue');
                expect(s).toHaveProperty('estimated_end_time');
                expect(typeof s.auto_progress).toBe('number');
                expect(s.auto_progress).toBeGreaterThanOrEqual(0);
                expect(s.auto_progress).toBeLessThanOrEqual(100);
            }
        });
    });

    // ====================================================================
    // Consistency Check
    // ====================================================================

    describe('Consistency', () => {
        it('theatres count should equal summary.total', async () => {
            const res = await request(app)
                .get('/api/theatres/live-status')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.body.data.length).toBe(res.body.summary.total);
        });

        it('should only return active theatres', async () => {
            const res = await request(app)
                .get('/api/theatres/live-status')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            // Cross-check with the main theatres list
            const mainRes = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.body.data.length).toBe(mainRes.body.data.length);
        });
    });
});
