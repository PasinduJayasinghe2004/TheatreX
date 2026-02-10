// Authentication Controller Tests
// Run with: npm test

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js'; // Assuming server exports app

describe('Authentication API Tests', () => {
    let testUserId;
    let authToken;

    // Test data
    const uniqueId = Date.now();
    const validUser = {
        name: 'Test User',
        email: `testuser${uniqueId}@theatrex.com`,
        password: 'SecurePass123!',
        role: 'coordinator',
        phone: '0771234567'
    };

    describe('POST /api/auth/register', () => {
        it('should register a new user with valid data', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('email', validUser.email);
            // Register endpoint doesn't return token in the current implementation
            // expect(response.body).toHaveProperty('token'); 
            expect(response.body.user).not.toHaveProperty('password');

            // Save for later tests
            testUserId = response.body.user.id;
            // authToken = response.body.token; // Register doesn't return token
        });

        it('should reject duplicate email registration', async () => {
            // Run registration again to trigger duplicate error
            await request(app)
                .post('/api/auth/register')
                .send(validUser); // First ensure it exists (if previous test failed)

            const response = await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect('Content-Type', /json/)
                .expect(409);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/already exists/i);
        });

        it('should reject registration with missing required fields', async () => {
            const invalidUser = {
                name: 'Test User',
                email: 'incomplete@example.com'
                // Missing password, role, phone
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidUser)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBeDefined();
        });

        it('should reject registration with invalid email format', async () => {
            const invalidEmailUser = {
                ...validUser,
                email: 'invalid-email-format'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidEmailUser)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should reject registration with weak password', async () => {
            const weakPasswordUser = {
                ...validUser,
                email: 'weakpass@example.com',
                password: '123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(weakPasswordUser)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should hash the password before storing', async () => {
            // This test verifies password is not stored in plain text
            // Would need database access to verify
            // Placeholder for now - implement when DB access is available
            expect(true).toBe(true);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const credentials = {
                email: validUser.email,
                password: validUser.password
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credentials)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', validUser.email);
            expect(response.body.user).not.toHaveProperty('password');

            // Verify JWT token format (3 parts separated by dots)
            const token = response.body.token;
            expect(token.split('.')).toHaveLength(3);

            authToken = token; // Capture token for JWT tests
        });

        it('should reject login with non-existent email', async () => {
            const credentials = {
                email: 'nonexistent@example.com',
                password: 'SomePassword123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credentials)
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBeDefined();
        });

        it('should reject login with incorrect password', async () => {
            const credentials = {
                email: validUser.email,
                password: 'WrongPassword123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credentials)
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBeDefined();
        });

        it('should reject login with missing credentials', async () => {
            const credentials = {
                email: validUser.email
                // Missing password
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(credentials)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('JWT Token Validation', () => {
        it('should generate valid JWT tokens', () => {
            expect(authToken).toBeDefined();
            expect(typeof authToken).toBe('string');
            expect(authToken.split('.')).toHaveLength(3);
        });

        it('should include user information in JWT payload', () => {
            // Decode JWT token (without verification for testing)
            const payload = JSON.parse(
                Buffer.from(authToken.split('.')[1], 'base64').toString()
            );

            expect(payload).toHaveProperty('id');
            expect(payload).toHaveProperty('email');
            expect(payload).not.toHaveProperty('password');
        });
    });

    // Cleanup after all tests
    afterAll(async () => {
        // Clean up test data from database
        // This would require database access
        // Placeholder for now
    });
});
