// ============================================================================
// Day 26 – M1 (Pasindu) – Auth Unit Tests
// ============================================================================
// Covers:
//   - Auth JWT utility (token format, payload, tamper detection)
//   - protect / authorize middleware (via integration routes)
//   - Full E2E auth flow: register → login → profile → update → RBAC
//
// Run: cd backend && npx jest tests/day26_m1_auth.test.js --no-coverage
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

// ─── Shared state ─────────────────────────────────────────────────────────────
let authToken;
let testUserId;

const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 9999)}`;

const testUser = {
    name: 'M1 Auth Tester',
    email: `m1_auth_${uniqueId}@theatrex.com`,
    password: 'SecurePass123!',
    role: 'coordinator',
    phone: '0771234500'
};

// ─── 1. Registration ───────────────────────────────────────────────────────────
describe('M1 Day 26 – Registration', () => {
    it('should register a new user successfully (201)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.user).not.toHaveProperty('password');
        testUserId = res.body.user.id;
    });

    it('should reject duplicate email with 409', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser)
            .expect(409);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject missing required fields (400)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Only Name' })
            .expect(400);

        expect(res.body.success).toBe(false);
    });

    it('should reject invalid email format (400)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...testUser, email: 'not-an-email', phone: '0771234501' })
            .expect(400);

        expect(res.body.success).toBe(false);
    });

    it('should reject weak password (400)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ ...testUser, email: `m1_weak_${uniqueId}@theatrex.com`, password: '123' })
            .expect(400);

        expect(res.body.success).toBe(false);
    });

    it('should never return password in response body', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'No Password Test',
                email: `m1_nopwd_${uniqueId}@theatrex.com`,
                password: 'SecurePass123!',
                role: 'surgeon',
                phone: '0771234502'
            });

        expect(res.body.user).not.toHaveProperty('password');
        expect(JSON.stringify(res.body)).not.toContain('SecurePass123!');
    });
});

// ─── 2. Login ─────────────────────────────────────────────────────────────────
describe('M1 Day 26 – Login', () => {
    it('should login with valid credentials (200)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.user).not.toHaveProperty('password');

        authToken = res.body.token;
    });

    it('should reject wrong password (401)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'WrongPassword!' })
            .expect(401);

        expect(res.body.success).toBe(false);
    });

    it('should reject unknown email (401)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@theatrex.com', password: 'SomePass123!' })
            .expect(401);

        expect(res.body.success).toBe(false);
    });

    it('should reject missing password (400)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email })
            .expect(400);

        expect(res.body.success).toBe(false);
    });
});

// ─── 3. JWT Token Validation ──────────────────────────────────────────────────
describe('M1 Day 26 – JWT Token Validation', () => {
    it('token should be a properly-formatted JWT (3 parts)', () => {
        expect(authToken).toBeDefined();
        expect(typeof authToken).toBe('string');
        expect(authToken.split('.')).toHaveLength(3);
    });

    it('token payload should contain user id and email', () => {
        const payload = JSON.parse(
            Buffer.from(authToken.split('.')[1], 'base64').toString()
        );
        expect(payload).toHaveProperty('id');
        expect(payload).toHaveProperty('email');
    });

    it('token payload should NOT contain password', () => {
        const payload = JSON.parse(
            Buffer.from(authToken.split('.')[1], 'base64').toString()
        );
        expect(payload).not.toHaveProperty('password');
    });

    it('tampered token should be rejected (401)', async () => {
        const parts = authToken.split('.');
        // Modify the payload
        const tamperedPayload = Buffer.from(
            JSON.stringify({ id: 99999, email: 'hacker@evil.com', role: 'admin' })
        ).toString('base64');
        const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${tamperedToken}`)
            .expect(401);

        expect(res.body.success).toBe(false);
    });
});

// ─── 4. Auth Middleware – protect ────────────────────────────────────────────
describe('M1 Day 26 – protect Middleware', () => {
    it('should return 401 when no token provided', async () => {
        const res = await request(app).get('/api/auth/profile');
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should return 401 for a completely invalid token', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', 'Bearer totally.invalid.token');
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should return 401 for malformed Authorization header', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', 'Token abc123');
        expect(res.statusCode).toBe(401);
    });

    it('should pass through with a valid token (200)', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// ─── 5. Auth Middleware – authorize (RBAC) ────────────────────────────────────
describe('M1 Day 26 – authorize Middleware (RBAC)', () => {
    let nurseToken;

    beforeAll(async () => {
        // Register a nurse – should be blocked from coordinator-only routes
        const nurseEmail = `m1_nurse_${uniqueId}@theatrex.com`;
        await request(app).post('/api/auth/register').send({
            name: 'M1 Nurse',
            email: nurseEmail,
            password: 'SecurePass123!',
            role: 'nurse',
            phone: '0771234503'
        });
        const loginRes = await request(app).post('/api/auth/login')
            .send({ email: nurseEmail, password: 'SecurePass123!' });
        nurseToken = loginRes.body.token;
    }, 20000);

    it('coordinator can access coordinator-only routes', async () => {
        // Theatre status update is coordinator-only
        const res = await request(app)
            .get('/api/theatres')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toBe(200);
    });

    it('nurse is rejected from coordinator-only routes (403)', async () => {
        if (!nurseToken) return;
        // PUT /api/theatres/:id/status requires coordinator role
        const res = await request(app)
            .put('/api/theatres/1/status')
            .set('Authorization', `Bearer ${nurseToken}`)
            .send({ status: 'maintenance' });
        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });
});

// ─── 6. Profile Endpoints ─────────────────────────────────────────────────────
describe('M1 Day 26 – GET /api/auth/profile', () => {
    it('should return user profile for authenticated user', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.user).not.toHaveProperty('password');
    });

    it('should reject unauthenticated access (401)', async () => {
        await request(app).get('/api/auth/profile').expect(401);
    });
});

describe('M1 Day 26 – PUT /api/auth/profile', () => {
    it('should update name and phone successfully', async () => {
        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'M1 Updated Name', phone: '0779999001' })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.user.name).toBe('M1 Updated Name');
        expect(res.body.user.phone).toBe('0779999001');
    });

    it('should reject update with weak password (400)', async () => {
        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ password: 'short' })
            .expect(400);

        expect(res.body.success).toBe(false);
    });

    it('should reject update without token (401)', async () => {
        await request(app)
            .put('/api/auth/profile')
            .send({ name: 'Hacker' })
            .expect(401);
    });
});

// ─── 7. Full E2E Auth Flow ────────────────────────────────────────────────────
describe('M1 Day 26 – E2E: Complete Auth Flow', () => {
    const e2eEmail = `m1_e2e_${uniqueId}@theatrex.com`;
    let e2eToken;
    let e2eUserId;

    it('Step 1 – Register new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'M1 E2E User',
                email: e2eEmail,
                password: 'E2EPass123!',
                role: 'surgeon',
                phone: '0771230001'
            })
            .expect(201);

        expect(res.body.success).toBe(true);
        e2eUserId = res.body.user.id;
    });

    it('Step 2 – Login with registered credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: e2eEmail, password: 'E2EPass123!' })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('token');
        e2eToken = res.body.token;
    });

    it('Step 3 – Access protected profile endpoint', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${e2eToken}`)
            .expect(200);

        expect(res.body.user.id).toBe(e2eUserId);
        expect(res.body.user.email).toBe(e2eEmail);
    });

    it('Step 4 – Update profile successfully', async () => {
        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${e2eToken}`)
            .send({ name: 'M1 E2E Updated', phone: '0779990001' })
            .expect(200);

        expect(res.body.user.name).toBe('M1 E2E Updated');
    });

    it('Step 5 – Wrong password login fails (401)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: e2eEmail, password: 'WrongPass999!' })
            .expect(401);

        expect(res.body.success).toBe(false);
    });

    it('Step 6 – Accessing protected route without token fails (401)', async () => {
        await request(app).get('/api/auth/profile').expect(401);
    });

    it('Step 7 – Surgeon cannot access coordinator-only routes (403)', async () => {
        const res = await request(app)
            .put('/api/theatres/1/status')
            .set('Authorization', `Bearer ${e2eToken}`)
            .send({ status: 'available' });

        expect(res.statusCode).toBe(403);
    });
});
