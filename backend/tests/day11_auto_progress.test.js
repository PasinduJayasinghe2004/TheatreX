// ============================================================================
// Auto-Progress Calculator Tests (Backend + Integration)
// ============================================================================
// Created by: M2 (Chandeepa) - Day 11
//
// Tests for:
// 1. progressCalculator.js utility (unit tests)
//    - calculateAutoProgress()
//    - enrichSurgeryWithProgress()
// 2. GET /api/theatres/:id/auto-progress endpoint (integration)
// 3. Auto-progress enrichment in GET /api/theatres (integration)
//
// Run with: npm test -- --testPathPattern=day11_auto_progress
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import {
    calculateAutoProgress,
    enrichSurgeryWithProgress
} from '../utils/progressCalculator.js';

jest.setTimeout(30000);

// ============================================================================
// UNIT TESTS: progressCalculator.js
// ============================================================================

describe('Auto-Progress Calculator - Unit Tests', () => {

    // ──────────────────────────────────────────────────────────────────────
    // calculateAutoProgress()
    // ──────────────────────────────────────────────────────────────────────

    describe('calculateAutoProgress()', () => {
        it('should return 0% progress for missing inputs', () => {
            const result = calculateAutoProgress(null, 60);
            expect(result.auto_progress).toBe(0);
            expect(result.elapsed_minutes).toBe(0);

            const result2 = calculateAutoProgress('10:00', null);
            expect(result2.auto_progress).toBe(0);

            const result3 = calculateAutoProgress('10:00', 0);
            expect(result3.auto_progress).toBe(0);
        });

        it('should calculate 50% progress when half the time has elapsed', () => {
            // Surgery started 30 mins ago, estimated 60 mins
            const now = new Date();
            const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
            const startTime = `${thirtyMinsAgo.getHours().toString().padStart(2, '0')}:${thirtyMinsAgo.getMinutes().toString().padStart(2, '0')}:00`;

            const result = calculateAutoProgress(startTime, 60, now);
            expect(result.auto_progress).toBe(50);
            expect(result.elapsed_minutes).toBe(30);
            expect(result.remaining_minutes).toBe(30);
            expect(result.is_overdue).toBe(false);
        });

        it('should cap progress at 100% when surgery exceeds duration', () => {
            // Surgery started 90 mins ago, estimated 60 mins
            const now = new Date();
            const ninetyMinsAgo = new Date(now.getTime() - 90 * 60 * 1000);
            const startTime = `${ninetyMinsAgo.getHours().toString().padStart(2, '0')}:${ninetyMinsAgo.getMinutes().toString().padStart(2, '0')}:00`;

            const result = calculateAutoProgress(startTime, 60, now);
            expect(result.auto_progress).toBe(100);
            expect(result.is_overdue).toBe(true);
            expect(result.remaining_minutes).toBe(0);
        });

        it('should return 0% when surgery has not started yet', () => {
            // Surgery starts in 30 mins
            const now = new Date();
            const thirtyMinsLater = new Date(now.getTime() + 30 * 60 * 1000);
            const startTime = `${thirtyMinsLater.getHours().toString().padStart(2, '0')}:${thirtyMinsLater.getMinutes().toString().padStart(2, '0')}:00`;

            const result = calculateAutoProgress(startTime, 60, now);
            expect(result.auto_progress).toBe(0);
            expect(result.elapsed_minutes).toBe(0);
            expect(result.is_overdue).toBe(false);
        });

        it('should calculate 100% when surgery just completed on time', () => {
            // Surgery started 60 mins ago, estimated 60 mins
            const now = new Date();
            const sixtyMinsAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const startTime = `${sixtyMinsAgo.getHours().toString().padStart(2, '0')}:${sixtyMinsAgo.getMinutes().toString().padStart(2, '0')}:00`;

            const result = calculateAutoProgress(startTime, 60, now);
            expect(result.auto_progress).toBe(100);
            expect(result.remaining_minutes).toBe(0);
        });

        it('should return a valid estimated_end_time', () => {
            const now = new Date();
            const startTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

            const result = calculateAutoProgress(startTime, 120, now);
            expect(result.estimated_end_time).toBeTruthy();
            expect(result.estimated_end_time).toMatch(/^\d{2}:\d{2}$/);
        });

        it('should handle HH:mm:ss format correctly', () => {
            const now = new Date();
            const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000);
            const startTime = `${tenMinsAgo.getHours().toString().padStart(2, '0')}:${tenMinsAgo.getMinutes().toString().padStart(2, '0')}:00`;

            const result = calculateAutoProgress(startTime, 100, now);
            expect(result.auto_progress).toBe(10);
            expect(result.elapsed_minutes).toBe(10);
        });

        it('should handle HH:mm format (no seconds)', () => {
            const now = new Date();
            const twentyMinsAgo = new Date(now.getTime() - 20 * 60 * 1000);
            const startTime = `${twentyMinsAgo.getHours().toString().padStart(2, '0')}:${twentyMinsAgo.getMinutes().toString().padStart(2, '0')}`;

            const result = calculateAutoProgress(startTime, 40, now);
            expect(result.auto_progress).toBe(50);
        });
    });

    // ──────────────────────────────────────────────────────────────────────
    // enrichSurgeryWithProgress()
    // ──────────────────────────────────────────────────────────────────────

    describe('enrichSurgeryWithProgress()', () => {
        it('should return surgery unchanged if status is not in_progress', () => {
            const surgery = {
                id: 1,
                status: 'scheduled',
                scheduled_time: '10:00',
                duration_minutes: 60
            };
            const result = enrichSurgeryWithProgress(surgery);
            expect(result).toEqual(surgery);
            expect(result.auto_progress).toBeUndefined();
        });

        it('should return null/undefined unchanged', () => {
            expect(enrichSurgeryWithProgress(null)).toBeNull();
            expect(enrichSurgeryWithProgress(undefined)).toBeUndefined();
        });

        it('should enrich in_progress surgery with auto_progress fields', () => {
            const now = new Date();
            const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
            const startTime = `${fifteenMinsAgo.getHours().toString().padStart(2, '0')}:${fifteenMinsAgo.getMinutes().toString().padStart(2, '0')}:00`;

            const surgery = {
                id: 1,
                status: 'in_progress',
                scheduled_time: startTime,
                duration_minutes: 30,
                progress_percent: 20
            };

            const result = enrichSurgeryWithProgress(surgery, now);
            expect(result.auto_progress).toBe(50);
            expect(result.elapsed_minutes).toBe(15);
            expect(result.remaining_minutes).toBe(15);
            expect(result.is_overdue).toBe(false);
            expect(result.estimated_end_time).toBeTruthy();
            // Original fields preserved
            expect(result.id).toBe(1);
            expect(result.progress_percent).toBe(20);
        });
    });
});

// ============================================================================
// INTEGRATION TESTS: Auto-progress API endpoint
// ============================================================================

describe('Auto-Progress API - Integration Tests', () => {
    let coordinatorToken;
    let staffToken;

    const uniqueId = Date.now();

    const coordinatorUser = {
        name: 'AutoProg Test Coordinator',
        email: `autoprog.coord${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234567'
    };

    const staffUser = {
        name: 'AutoProg Test Staff',
        email: `autoprog.staff${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'staff',
        phone: '0771234568'
    };

    // ========================================================================
    // Setup
    // ========================================================================
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

    // ========================================================================
    // GET /api/theatres/:id/auto-progress
    // ========================================================================

    describe('GET /api/theatres/:id/auto-progress', () => {
        it('should return 404 for non-existent theatre', async () => {
            const res = await request(app)
                .get('/api/theatres/99999/auto-progress')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .get('/api/theatres/1/auto-progress');

            expect(res.status).toBe(401);
        });

        it('should allow staff users to access auto-progress', async () => {
            // Get a real theatre ID first
            const theatresRes = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(theatresRes.status).toBe(200);
            expect(Array.isArray(theatresRes.body.data)).toBe(true);
            expect(theatresRes.body.data.length).toBeGreaterThan(0);

            const theatreId = theatresRes.body.data[0].id;

            const res = await request(app)
                .get(`/api/theatres/${theatreId}/auto-progress`)
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    // ========================================================================
    // GET /api/theatres - Auto-progress enrichment
    // ========================================================================

    describe('GET /api/theatres (auto-progress enrichment)', () => {
        it('should return theatres with auto-progress fields for in_use theatres', async () => {
            const res = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            // Check that theatres with current surgeries have auto_progress fields
            res.body.data.forEach(theatre => {
                if (theatre.current_surgery_id) {
                    expect(theatre).toHaveProperty('auto_progress');
                    expect(theatre).toHaveProperty('elapsed_minutes');
                    expect(theatre).toHaveProperty('remaining_minutes');
                    expect(theatre).toHaveProperty('is_overdue');
                    expect(theatre).toHaveProperty('estimated_end_time');
                }
            });
        });
    });

    // ========================================================================
    // GET /api/theatres/:id - Auto-progress enrichment  
    // ========================================================================

    describe('GET /api/theatres/:id (auto-progress enrichment)', () => {
        it('should include auto-progress fields in theatre detail', async () => {
            // Get a real theatre ID
            const theatresRes = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(theatresRes.status).toBe(200);
            expect(theatresRes.body.success).toBe(true);
            expect(Array.isArray(theatresRes.body.data)).toBe(true);
            expect(theatresRes.body.data.length).toBeGreaterThan(0);

            const theatreId = theatresRes.body.data[0].id;

            const res = await request(app)
                .get(`/api/theatres/${theatreId}`)
                .set('Authorization', `Bearer ${coordinatorToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('auto_progress');
            expect(res.body.data).toHaveProperty('elapsed_minutes');
            expect(res.body.data).toHaveProperty('remaining_minutes');
            expect(res.body.data).toHaveProperty('is_overdue');
            expect(res.body.data).toHaveProperty('estimated_end_time');
        });
    });
});
