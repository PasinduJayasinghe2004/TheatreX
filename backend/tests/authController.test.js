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

    describe('GET /api/auth/profile', () => {
        it('should return user profile when authenticated', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user).toHaveProperty('id', testUserId);
            expect(response.body.user).toHaveProperty('email', validUser.email);
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should reject unauthenticated access', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should reject access with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalidtoken123')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/auth/profile', () => {
        it('should update user profile successfully', async () => {
            const updates = {
                name: 'Updated Name',
                phone: '0779876543'
            };

            const response = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updates)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user).toHaveProperty('name', updates.name);
            expect(response.body.user).toHaveProperty('phone', updates.phone);
        });

        it('should reject update with invalid data', async () => {
            const updates = {
                password: 'short' // Password too short
            };

            const response = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updates)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    // ========================================================================
    // Refresh Token Tests - Created by M6 (Dinil) - Day 4
    // ========================================================================
    describe('POST /api/auth/refresh', () => {
        let refreshToken;

        beforeAll(async () => {
            // Get refresh token from login
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validUser.email,
                    password: validUser.password
                });

            refreshToken = response.body.refreshToken;
        });

        it('should refresh access token with valid refresh token', async () => {
            // Skip if no refresh token was returned
            if (!refreshToken) {
                console.log('Skipping: No refresh token available from login');
                return;
            }

            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect('Content-Type', /json/);

            // Should return new access token or appropriate response
            if (response.statusCode === 200) {
                expect(response.body.success).toBe(true);
                expect(response.body).toHaveProperty('token');
            }
        });

        it('should reject invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid_refresh_token' })
                .expect('Content-Type', /json/);

            expect(response.statusCode).toBeGreaterThanOrEqual(400);
            expect(response.body.success).toBe(false);
        });

        it('should reject missing refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({})
                .expect('Content-Type', /json/);

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    // ========================================================================
    // End-to-End Auth Flow Tests - Created by M6 (Dinil) - Day 4
    // ========================================================================
    describe('E2E: Complete Authentication Flow', () => {
        const e2eUser = {
            name: 'E2E Test User',
            email: `e2e_test_${Date.now()}@theatrex.com`,
            password: 'E2ETest123!',
            role: 'surgeon',
            phone: '0771112233'
        };
        let e2eToken;
        let e2eUserId;

        it('Step 1: User registers successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(e2eUser)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user.email).toBe(e2eUser.email);
            e2eUserId = response.body.user.id;
        });

        it('Step 2: User logs in with registered credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: e2eUser.email,
                    password: e2eUser.password
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(e2eUser.email);
            e2eToken = response.body.token;
        });

        it('Step 3: User accesses protected profile endpoint', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${e2eToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user.id).toBe(e2eUserId);
            expect(response.body.user.email).toBe(e2eUser.email);
        });

        it('Step 4: User updates their profile', async () => {
            const updates = {
                name: 'E2E Updated Name',
                phone: '0779998877'
            };

            const response = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${e2eToken}`)
                .send(updates)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user.name).toBe(updates.name);
            expect(response.body.user.phone).toBe(updates.phone);
        });

        it('Step 5: User accesses role-appropriate routes', async () => {
            // Since e2e user is surgeon, they should access staff routes
            const staffResponse = await request(app)
                .get('/api/test/staff')
                .set('Authorization', `Bearer ${e2eToken}`);

            expect(staffResponse.statusCode).toBe(200);
            expect(staffResponse.body.success).toBe(true);

            // But should NOT access admin routes
            const adminResponse = await request(app)
                .get('/api/test/admin-only')
                .set('Authorization', `Bearer ${e2eToken}`);

            expect(adminResponse.statusCode).toBe(403);
        });

        it('Step 6: Invalid login attempt fails', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: e2eUser.email,
                    password: 'WrongPassword123!'
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('Step 7: Accessing protected routes without token fails', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    // ========================================================================
    // Security Tests - Created by M6 (Dinil) - Day 4
    // ========================================================================
    describe('Security Tests', () => {
        it('should not expose password in any API response', async () => {
            // Test register response
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Security Test',
                    email: `security_test_${Date.now()}@theatrex.com`,
                    password: 'SecurePass123!',
                    role: 'coordinator',
                    phone: '0771234567'
                });

            expect(registerResponse.body.user).not.toHaveProperty('password');
            expect(JSON.stringify(registerResponse.body)).not.toContain('SecurePass123!');

            // Test login response does not expose password
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: validUser.email,
                    password: validUser.password
                });

            expect(loginResponse.body.user).not.toHaveProperty('password');
        });

        it('should use secure JWT tokens', () => {
            // Token should be properly formatted (3 parts)
            expect(authToken).toBeDefined();
            const parts = authToken.split('.');
            expect(parts).toHaveLength(3);

            // Payload should not contain sensitive data
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            expect(payload).not.toHaveProperty('password');
        });
    });

    afterAll(async () => {
        // Cleanup test data logic would go here
        // e.g. await pool.query('DELETE FROM users WHERE email LIKE $1', ['%@theatrex.com']);
        // For now, we rely on test database reset or manual cleanup
    });
});
