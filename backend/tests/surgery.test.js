import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { pool } from '../config/database.js';

describe('Surgery API Tests', () => {
    let authToken;
    let testSurgeryId;
    let testSurgeonId;
    let testTheatreId;

    // Helper to setup test data
    beforeAll(async () => {
        // 1. Login as coordinator to get token
        // Assuming a test user exists or we create one
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        if (loginRes.body.success) {
            authToken = loginRes.body.token;
        } else {
            // Create user if doesn't exist
            await request(app).post('/api/auth/register').send({
                name: 'Test Admin',
                email: 'test@example.com',
                password: 'password123',
                role: 'coordinator',
                phone: '0770000000'
            });
            const loginRes2 = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });
            authToken = loginRes2.body.token;
        }

        // 2. Get a surgeon and theatre ID for tests
        const surgeonsRes = await request(app)
            .get('/api/surgeries/surgeons')
            .set('Authorization', `Bearer ${authToken}`);

        if (surgeonsRes.body.data && surgeonsRes.body.data.length > 0) {
            testSurgeonId = surgeonsRes.body.data[0].id;
        }

        // Add a mock theatre if needed or use existing
        // For now we'll assume theatre_id can be null or we find one
    });

    describe('POST /api/surgeries', () => {
        it('should create a new surgery with valid data', async () => {
            const surgeryData = {
                patient_name: 'John Doe',
                patient_age: 45,
                patient_gender: 'male',
                surgery_type: 'Appendectomy',
                description: 'Emergency appendectomy',
                scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                scheduled_time: '10:00',
                duration_minutes: 60,
                priority: 'urgent',
                surgeon_id: testSurgeonId
            };

            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(surgeryData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.surgery_type).toBe(surgeryData.surgery_type);
            testSurgeryId = response.body.data.id;
        });

        it('should reject creation with missing required fields', async () => {
            const response = await request(app)
                .post('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .send({}) // Empty body
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.errors).toBeDefined();
        });

        it('should reject creation by unauthorized role', async () => {
            // Login as a nurse (assuming one exists or creating one)
            // But for now, just test missing token
            await request(app)
                .post('/api/surgeries')
                .send({ surgery_type: 'Test' })
                .expect(401);
        });
    });

    describe('GET /api/surgeries', () => {
        it('should return a list of surgeries', async () => {
            const response = await request(app)
                .get('/api/surgeries')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/surgeries/:id', () => {
        it('should return surgery details for a valid ID', async () => {
            const response = await request(app)
                .get(`/api/surgeries/${testSurgeryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(testSurgeryId);
        });

        it('should return 404 for a non-existent surgery ID', async () => {
            await request(app)
                .get('/api/surgeries/999999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
        });
    });

    afterAll(async () => {
        // Cleanup: Ideally delete the test surgery
        if (testSurgeryId) {
            await pool.query('DELETE FROM surgeries WHERE id = $1', [testSurgeryId]);
        }
        // No need to close pool if server.js handles it or it's shared
    });
});
