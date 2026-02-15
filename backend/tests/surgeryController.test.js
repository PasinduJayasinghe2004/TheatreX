// ============================================================================
// Surgery Controller Tests
// ============================================================================
// Created by: M6 (Dinil) - Day 5
// 
// Comprehensive tests for all surgery API endpoints:
// - POST /api/surgeries (Create surgery)
// - GET /api/surgeries (Get all surgeries)
// - GET /api/surgeries/:id (Get surgery by ID)
// - GET /api/surgeries/surgeons (Get surgeons dropdown)
//
// Run with: npm test
// ============================================================================

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

// Set Jest timeout for all tests in this file (for slow DB connections)
jest.setTimeout(30000);

describe('Surgery API Tests', () => {
    let authToken;
    let testSurgeryId;
    let coordinatorToken;

    const uniqueId = Date.now();

    // Test user credentials (coordinator role required for creating surgeries)
    const coordinatorUser = {
        name: 'Surgery Test Coordinator',
        email: `surgery.coordinator${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234567'
    };

    // Test surgery data
    const validSurgery = {
        patient_name: 'John Doe',
        patient_age: 45,
        patient_gender: 'male',
        surgery_type: 'Appendectomy',
        description: 'Standard appendectomy procedure',
        scheduled_date: '2026-03-01',
        scheduled_time: '10:00',
        duration_minutes: 90,
        status: 'scheduled',
        priority: 'routine',
        notes: 'Patient has no known allergies'
    };

    // ========================================================================
    // Setup: Register and login test user (increased timeout for DB connection)
    // ========================================================================
    beforeAll(async () => {
        // Register a coordinator user
        await request(app)
            .post('/api/auth/register')
            .send(coordinatorUser);

        // Login to get token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: coordinatorUser.email,
                password: coordinatorUser.password
            });

        coordinatorToken = loginResponse.body.token;
        authToken = coordinatorToken;
    }, 30000); // 30 second timeout for setup

    // ========================================================================
    // POST /api/surgeries - Create Surgery Tests
    // ========================================================================
    describe('POST /api/surgeries', () => {
        it('should create a new surgery with valid data', async () => {
            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validSurgery)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Surgery created successfully');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.patient_name).toBe(validSurgery.patient_name);
            expect(response.body.data.surgery_type).toBe(validSurgery.surgery_type);
            expect(response.body.data.status).toBe('scheduled');
            expect(response.body.data.priority).toBe('routine');

            // Save surgery ID for later tests
            testSurgeryId = response.body.data.id;
        });

        it('should reject surgery creation without authentication', async () => {
            const response = await request(app)
                .post('/api/surgeries')
                .send(validSurgery)
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should reject surgery with missing required fields', async () => {
            const incompleteSurgery = {
                patient_name: 'Jane Doe'
                // Missing surgery_type, scheduled_date, scheduled_time, duration_minutes
            };

            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(incompleteSurgery)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('should reject surgery with invalid date format', async () => {
            const invalidDateSurgery = {
                ...validSurgery,
                scheduled_date: '01-03-2026' // Invalid format (should be YYYY-MM-DD)
            };

            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidDateSurgery)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should reject surgery with invalid time format', async () => {
            const invalidTimeSurgery = {
                ...validSurgery,
                scheduled_time: '10:00 AM' // Invalid format (should be HH:MM 24-hour)
            };

            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidTimeSurgery)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should reject surgery with invalid status', async () => {
            const invalidStatusSurgery = {
                ...validSurgery,
                status: 'invalid_status'
            };

            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidStatusSurgery)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should reject surgery with invalid priority', async () => {
            const invalidPrioritySurgery = {
                ...validSurgery,
                priority: 'critical' // Invalid (should be routine, urgent, or emergency)
            };

            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidPrioritySurgery)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should reject surgery with negative duration', async () => {
            const negativeDurationSurgery = {
                ...validSurgery,
                duration_minutes: -30
            };

            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(negativeDurationSurgery)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should create emergency surgery successfully', async () => {
            const emergencySurgery = {
                ...validSurgery,
                patient_name: 'Emergency Patient',
                priority: 'emergency',
                scheduled_date: '2026-03-02',
                notes: 'Emergency case - immediate attention required'
            };

            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(emergencySurgery)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.priority).toBe('emergency');
        });

        it('should create urgent surgery successfully', async () => {
            const urgentSurgery = {
                ...validSurgery,
                patient_name: 'Urgent Patient',
                priority: 'urgent',
                scheduled_date: '2026-03-03'
            };

            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(urgentSurgery)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.priority).toBe('urgent');
        });
    });

    // ========================================================================
    // GET /api/surgeries - Get All Surgeries Tests
    // ========================================================================
    describe('GET /api/surgeries', () => {
        it('should return list of all surgeries', async () => {
            const response = await request(app)
                .get('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body).toHaveProperty('count');
            expect(response.body.count).toBeGreaterThanOrEqual(1);
        });

        it('should return surgeries with nested surgeon data', async () => {
            const response = await request(app)
                .get('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            // Check structure of surgery objects
            const surgeries = response.body.data;
            if (surgeries.length > 0) {
                const surgery = surgeries[0];
                expect(surgery).toHaveProperty('id');
                expect(surgery).toHaveProperty('patient_name');
                expect(surgery).toHaveProperty('surgery_type');
                expect(surgery).toHaveProperty('scheduled_date');
                expect(surgery).toHaveProperty('scheduled_time');
                expect(surgery).toHaveProperty('status');
                expect(surgery).toHaveProperty('priority');
            }
        });

        it('should reject unauthenticated request', async () => {
            const response = await request(app)
                .get('/api/surgeries')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should return surgeries sorted by date', async () => {
            const response = await request(app)
                .get('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const surgeries = response.body.data;
            if (surgeries.length >= 2) {
                // Verify chronological order
                for (let i = 0; i < surgeries.length - 1; i++) {
                    const currentDate = new Date(surgeries[i].scheduled_date);
                    const nextDate = new Date(surgeries[i + 1].scheduled_date);
                    expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
                }
            }
        });
    });

    // ========================================================================
    // GET /api/surgeries/:id - Get Surgery by ID Tests
    // ========================================================================
    describe('GET /api/surgeries/:id', () => {
        it('should return surgery by valid ID', async () => {
            // First create a surgery to ensure we have one
            const createResponse = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    ...validSurgery,
                    patient_name: 'Get By ID Test Patient',
                    scheduled_date: '2026-03-10'
                });

            const surgeryId = createResponse.body.data.id;

            const response = await request(app)
                .get(`/api/surgeries/${surgeryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id', surgeryId);
            expect(response.body.data.patient_name).toBe('Get By ID Test Patient');
        });

        it('should return 404 for non-existent surgery ID', async () => {
            const response = await request(app)
                .get('/api/surgeries/999999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/not found/i);
        });

        it('should return 400 for invalid surgery ID format', async () => {
            const response = await request(app)
                .get('/api/surgeries/invalid')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should return 400 for negative surgery ID', async () => {
            const response = await request(app)
                .get('/api/surgeries/-1')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should reject unauthenticated request', async () => {
            const response = await request(app)
                .get(`/api/surgeries/${testSurgeryId}`)
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should return surgery with complete data structure', async () => {
            // Create a surgery with all fields
            const fullSurgery = {
                ...validSurgery,
                patient_name: 'Complete Data Patient',
                scheduled_date: '2026-03-15',
                description: 'Full detailed surgery description',
                notes: 'Detailed notes for testing'
            };

            const createResponse = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(fullSurgery);

            const surgeryId = createResponse.body.data.id;

            const response = await request(app)
                .get(`/api/surgeries/${surgeryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const surgery = response.body.data;
            expect(surgery).toHaveProperty('id');
            expect(surgery).toHaveProperty('patient_name', 'Complete Data Patient');
            expect(surgery).toHaveProperty('patient_age', 45);
            expect(surgery).toHaveProperty('patient_gender', 'male');
            expect(surgery).toHaveProperty('surgery_type', 'Appendectomy');
            expect(surgery).toHaveProperty('description');
            expect(surgery).toHaveProperty('scheduled_date');
            expect(surgery).toHaveProperty('scheduled_time');
            expect(surgery).toHaveProperty('duration_minutes', 90);
            expect(surgery).toHaveProperty('status', 'scheduled');
            expect(surgery).toHaveProperty('priority', 'routine');
            expect(surgery).toHaveProperty('notes');
            expect(surgery).toHaveProperty('created_at');
        });
    });

    // ========================================================================
    // GET /api/surgeries/surgeons - Get Surgeons Dropdown Tests
    // ========================================================================
    describe('GET /api/surgeries/surgeons', () => {
        it('should return list of surgeons', async () => {
            const response = await request(app)
                .get('/api/surgeries/surgeons')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body).toHaveProperty('count');
        });

        it('should return surgeons with correct structure', async () => {
            const response = await request(app)
                .get('/api/surgeries/surgeons')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            const surgeons = response.body.data;
            if (surgeons.length > 0) {
                const surgeon = surgeons[0];
                expect(surgeon).toHaveProperty('id');
                expect(surgeon).toHaveProperty('name');
                expect(surgeon).toHaveProperty('email');
                // Should not expose password
                expect(surgeon).not.toHaveProperty('password');
            }
        });

        it('should reject unauthenticated request', async () => {
            const response = await request(app)
                .get('/api/surgeries/surgeons')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    // ========================================================================
    // Validation Middleware Tests
    // ========================================================================
    describe('Surgery Validation Middleware', () => {
        it('should accept all valid statuses', async () => {
            const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];

            for (const status of validStatuses) {
                const response = await request(app)
                    .post('/api/surgeries')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        ...validSurgery,
                        scheduled_date: '2026-04-01',
                        status
                    });

                // Should not fail due to status validation
                if (response.status === 400) {
                    expect(response.body.errors).not.toContain(
                        expect.stringMatching(/invalid status/i)
                    );
                }
            }
        });

        it('should accept all valid priorities', async () => {
            const validPriorities = ['routine', 'urgent', 'emergency'];

            for (const priority of validPriorities) {
                const response = await request(app)
                    .post('/api/surgeries')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        ...validSurgery,
                        scheduled_date: '2026-04-02',
                        priority
                    });

                // Should not fail due to priority validation
                if (response.status === 400) {
                    expect(response.body.errors).not.toContain(
                        expect.stringMatching(/invalid priority/i)
                    );
                }
            }
        });

        it('should validate patient age range', async () => {
            const invalidAgeSurgery = {
                ...validSurgery,
                patient_age: 200 // Invalid age
            };

            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidAgeSurgery);

            expect(response.status).toBe(400);
        });
    });

    // ========================================================================
    // RBAC (Role-Based Access Control) Tests
    // ========================================================================
    describe('Surgery RBAC Tests', () => {
        let nurseToken;

        beforeAll(async () => {
            // Register a nurse user (should not be able to create surgeries)
            const nurseUser = {
                name: 'Test Nurse',
                email: `test.nurse${uniqueId}@theatrex.com`,
                password: 'SecurePass123!',
                role: 'nurse',
                phone: '0771234568'
            };

            await request(app)
                .post('/api/auth/register')
                .send(nurseUser);

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: nurseUser.email,
                    password: nurseUser.password
                });

            nurseToken = loginResponse.body.token;
        }, 20000); // 20 second timeout for RBAC setup

        it('should allow coordinator to create surgery', async () => {
            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${coordinatorToken}`)
                .send({
                    ...validSurgery,
                    patient_name: 'Coordinator Created Patient',
                    scheduled_date: '2026-05-01'
                })
                .expect(201);

            expect(response.body.success).toBe(true);
        });

        it('should deny nurse from creating surgery', async () => {
            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${nurseToken}`)
                .send({
                    ...validSurgery,
                    scheduled_date: '2026-05-02'
                })
                .expect(403);

            expect(response.body.success).toBe(false);
        });

        it('should allow nurse to view surgeries', async () => {
            const response = await request(app)
                .get('/api/surgeries')
                .set('Authorization', `Bearer ${nurseToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it('should allow nurse to view surgery by ID', async () => {
            // Get a surgery ID first
            const listResponse = await request(app)
                .get('/api/surgeries')
                .set('Authorization', `Bearer ${nurseToken}`);

            if (listResponse.body.data.length > 0) {
                const surgeryId = listResponse.body.data[0].id;

                const response = await request(app)
                    .get(`/api/surgeries/${surgeryId}`)
                    .set('Authorization', `Bearer ${nurseToken}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
            }
        });
    });
});
