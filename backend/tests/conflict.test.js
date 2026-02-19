
// ============================================================================
// Conflict Detection & Emergency Booking Tests
// ============================================================================
// Created by: M6 (Dinil) - Day 8
// 
// Tests for:
// - POST /api/surgeries/check-conflicts (Detects scheduling overlaps)
// - POST /api/surgeries (Verifies emergency override logic)
//
// Run with: npm test tests/conflict.test.js
// ============================================================================

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { pool } from '../config/database.js';

// 30s timeout for slow DB/network
jest.setTimeout(30000);

describe('Surgery Conflict & Emergency Tests', () => {
    let authToken;
    let theatreId;
    let surgeonId;

    const uniqueId = Date.now();
    const testDate = '2026-06-15'; // Future date to avoid interference

    // User credentials
    const coordinatorUser = {
        name: 'Conflict Test Coordinator',
        email: `conflict.test${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator'
    };

    // ========================================================================
    // SETUP
    // ========================================================================
    beforeAll(async () => {
        // 1. Register & Login
        await request(app).post('/api/auth/register').send(coordinatorUser);
        const loginRes = await request(app).post('/api/auth/login').send({
            email: coordinatorUser.email,
            password: coordinatorUser.password
        });
        authToken = loginRes.body.token;

        // 2. Get a Surgeon ID (assume one exists or create one if possible, 
        //    but for now we'll fetch from existing users to be safe)
        const surgeonRes = await request(app)
            .get('/api/surgeries/surgeons')
            .set('Authorization', `Bearer ${authToken}`);

        if (surgeonRes.body.data.length > 0) {
            surgeonId = surgeonRes.body.data[0].id;
        } else {
            // Fallback: Register a surgeon if none exist
            const newSurgeon = {
                name: 'Conflict Surgeon',
                email: `surgeon.conflict${uniqueId}@theatrex.com`,
                password: 'Password123!',
                role: 'surgeon'
            };
            const regRes = await request(app).post('/api/auth/register').send(newSurgeon);
            surgeonId = regRes.body.user.id;
        }

        // 3. Get a Theatre ID
        const theatreRes = await request(app)
            .get('/api/theatres')
            .set('Authorization', `Bearer ${authToken}`);

        if (theatreRes.body.data.length > 0) {
            theatreId = theatreRes.body.data[0].id;
        } else {
            // If no theatres, we might fail unless we seed one. 
            // Assuming seed data exists or we can create via SQL if needed.
            // For now, let's hope theatres exist or tests will fail gracefully.
            throw new Error('No theatres found for conflict testing');
        }

        // 4. Create a "Base" Surgery to conflict with
        //    Schedule: 10:00 - 12:00 (120 mins)
        await request(app)
            .post('/api/surgeries')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                patient_name: 'Base Patient',
                surgery_type: 'Base Surgery',
                scheduled_date: testDate,
                scheduled_time: '10:00',
                duration_minutes: 120,
                theatre_id: theatreId,
                surgeon_id: surgeonId,
                status: 'scheduled',
                priority: 'routine'
            });
    });

    // ========================================================================
    // TESTS
    // ========================================================================

    describe('POST /api/surgeries/check-conflicts', () => {
        it('should return NO conflicts for a non-overlapping slot', async () => {
            // 08:00 - 09:30 (Before base surgery 10:00 - 12:00)
            const response = await request(app)
                .post('/api/surgeries/check-conflicts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    scheduled_date: testDate,
                    scheduled_time: '08:00',
                    duration_minutes: 90,
                    theatre_id: theatreId,
                    surgeon_id: surgeonId
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.has_conflicts).toBe(false);
            expect(response.body.conflict_count).toBe(0);
        });

        it('should detect THEATRE conflict (Overlapping time)', async () => {
            // 11:00 - 12:30 (Overlaps with 10:00 - 12:00)
            const response = await request(app)
                .post('/api/surgeries/check-conflicts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    scheduled_date: testDate,
                    scheduled_time: '11:00',
                    duration_minutes: 90,
                    theatre_id: theatreId,
                    surgeon_id: null // Different surgeon (or none) to isolate theatre check
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.has_conflicts).toBe(true);
            const theatreConflict = response.body.conflicts.find(c => c.type === 'theatre');
            expect(theatreConflict).toBeDefined();
            expect(theatreConflict.resource_id).toBe(theatreId);
        });

        it('should detect SURGEON conflict (Same time, different theatre)', async () => {
            // 10:30 - 11:30 (Inside 10:00 - 12:00)
            // Use a made-up theatre ID or just check surgeon conflict
            const response = await request(app)
                .post('/api/surgeries/check-conflicts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    scheduled_date: testDate,
                    scheduled_time: '10:30',
                    duration_minutes: 60,
                    theatre_id: null, // No theatre specified
                    surgeon_id: surgeonId
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.has_conflicts).toBe(true);
            const surgeonConflict = response.body.conflicts.find(c => c.type === 'surgeon');
            expect(surgeonConflict).toBeDefined();
            expect(surgeonConflict.resource_id).toBe(surgeonId);
        });
    });

    describe('Emergency Override Logic (POST /api/surgeries)', () => {
        it('should ALLOW creating an EMERGENCY surgery despite conflicts', async () => {
            // Attempt to book 10:00 - 11:00 (Direct conflict with Base Surgery)
            // BUT with priority = 'emergency'
            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    patient_name: 'Emergency Override Patient',
                    surgery_type: 'Emergency Section',
                    scheduled_date: testDate,
                    scheduled_time: '10:00',
                    duration_minutes: 60,
                    theatre_id: theatreId,
                    surgeon_id: surgeonId,
                    status: 'scheduled',
                    priority: 'emergency', // KEY: Emergency priority
                    notes: 'This should override conflicts'
                })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.priority).toBe('emergency');

            // Clean up: Delete this emergency surgery
            if (response.body.data.id) {
                await request(app)
                    .delete(`/api/surgeries/${response.body.data.id}`)
                    .set('Authorization', `Bearer ${authToken}`);
            }
        });

        // Note: Currently the controller DOES NOT block routine surgeries with conflicts
        // It detects them but returns 409 only for DB constraints (unique keys)
        // or if we explicitly enforced soft conflict checking.
        // Based on current surgeryController code inspected, it relies on client to check.
        // If we want to enforce it backend-side for routine, we'd need to add logic.
        // For now, we test that it *allows* emergency (verified above).
    });
});
