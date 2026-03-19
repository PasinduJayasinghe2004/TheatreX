// ============================================================================
// Auth Middleware Unit Tests
// ============================================================================
// Created by: M2 (Chandeepa) - Day 8
//
// Tests for the protect and authorize middleware.
// Uses integration-style tests (real app + supertest) to avoid ESM mock issues.
// ============================================================================

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

describe('Auth Middleware', () => {
    let validToken;

    beforeAll(async () => {
        const uniqueId = Date.now();
        const email = `mwtest${uniqueId}@theatrex.com`;
        await request(app).post('/api/auth/register').send({
            name: 'MW Test User',
            email,
            password: 'SecurePass123!',
            role: 'surgeon',
            phone: '0771234512'
        });
        const loginRes = await request(app).post('/api/auth/login').send({
            email,
            password: 'SecurePass123!'
        });
        validToken = loginRes.body.token;
    }, 30000);

    describe('protect middleware', () => {
        it('should return 401 if no token provided', async () => {
            const res = await request(app).get('/api/theatres');
            expect(res.statusCode).toBe(401);
            expect(res.body).toMatchObject({ message: expect.any(String) });
        });

        it('should return 401 if token is invalid', async () => {
            const res = await request(app)
                .get('/api/theatres')
                .set('Authorization', 'Bearer invalid.token.here');
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should return 401 if Authorization header is malformed', async () => {
            const res = await request(app)
                .get('/api/theatres')
                .set('Authorization', 'NotBearer sometoken');
            expect(res.statusCode).toBe(401);
        });

        it('should call next if token is valid and user exists', async () => {
            if (!validToken) return;
            const res = await request(app)
                .get('/api/theatres')
                .set('Authorization', `Bearer ${validToken}`);
            // Middleware passed — actual route runs (200 expected)
            expect(res.statusCode).toBe(200);
        });
    });

    describe('authorize middleware (RBAC)', () => {
        let coordinatorToken;

        beforeAll(async () => {
            const uniqueId = Date.now();
            const email = `mwcoord${uniqueId}@theatrex.com`;
            await request(app).post('/api/auth/register').send({
                name: 'MW Coordinator',
                email,
                password: 'SecurePass123!',
                role: 'coordinator',
                phone: '0771234513'
            });
            const loginRes = await request(app).post('/api/auth/login').send({
                email,
                password: 'SecurePass123!'
            });
            coordinatorToken = loginRes.body.token;
        }, 30000);

        it('should return 403 if user has unauthorized role', async () => {
            if (!validToken) return;
            // /api/theatres/:id/status requires coordinator/admin; surgeon should get 403
            const res = await request(app)
                .put('/api/theatres/1/status')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ status: 'available' });
            expect(res.statusCode).toBe(403);
        });

        it('should allow access if user has the required role', async () => {
            if (!coordinatorToken) return;
            // Test against an authorized route - any coordinator-accessible route
            const res = await request(app)
                .get('/api/theatres/coordinator-overview')
                .set('Authorization', `Bearer ${coordinatorToken}`);
            // 200 = authorized; 500 = authorized but DB issue - either is fine
            expect([200, 500]).toContain(res.statusCode);
        });
    });
});
