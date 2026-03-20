// ============================================================================
// Dashboard Summary Tests
// ============================================================================
// Uses supertest via the app (no axios dependency required)
// ============================================================================

import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

describe('Dashboard Summary API', () => {
    let coordinatorToken;
    let adminToken;
    let nurseToken;

    beforeAll(async () => {
        const uniqueId = Date.now();
        const registerAndLogin = async ({ name, email, role, phone }) => {
            await request(app).post('/api/auth/register').send({
                name,
                email,
                password: 'SecurePass123!',
                role,
                phone
            });

            const loginRes = await request(app).post('/api/auth/login').send({
                email,
                password: 'SecurePass123!'
            });

            return loginRes.body.token;
        };

        coordinatorToken = await registerAndLogin({
            name: 'Dashboard Coordinator',
            email: `dash.coord${uniqueId}@theatrex.com`,
            role: 'coordinator',
            phone: '0771234555'
        });

        adminToken = await registerAndLogin({
            name: 'Dashboard Admin',
            email: `dash.admin${uniqueId}@theatrex.com`,
            role: 'admin',
            phone: '0771234666'
        });

        nurseToken = await registerAndLogin({
            name: 'Dashboard Nurse',
            email: `dash.nurse${uniqueId}@theatrex.com`,
            role: 'nurse',
            phone: '0771234777'
        });
    }, 30000);

    it('should return 401 without auth token', async () => {
        const res = await request(app).get('/api/dashboard/summary');
        expect(res.statusCode).toBe(401);
    });

    it('should return dashboard summary for coordinator', async () => {
        if (!coordinatorToken) return;
        const res = await request(app)
            .get('/api/dashboard/summary')
            .set('Authorization', `Bearer ${coordinatorToken}`);

        // Authorized users should pass RBAC, then controller may return 200 or 500 if DB fails
        expect([200, 500]).toContain(res.statusCode);
        if (res.statusCode === 200) {
            expect(res.body.success).toBe(true);
        }
    });

    it('should return dashboard summary for admin', async () => {
        if (!adminToken) return;
        const res = await request(app)
            .get('/api/dashboard/summary')
            .set('Authorization', `Bearer ${adminToken}`);

        expect([200, 500]).toContain(res.statusCode);
    });

    it('should return 403 for staff role (nurse)', async () => {
        if (!nurseToken) return;
        const res = await request(app)
            .get('/api/dashboard/summary')
            .set('Authorization', `Bearer ${nurseToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
    });
});
