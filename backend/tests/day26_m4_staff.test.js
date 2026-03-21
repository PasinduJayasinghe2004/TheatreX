// ============================================================================
// Day 26 – M4 (Oneli) – Staff Unit Tests
// ============================================================================
// Covers:
//   - Nurse CRUD (Create, Read, Update, Delete)
//   - Technician CRUD (Create, Read, Update, Delete)
//   - Role-Based Access Control for Staff management
//   - Filtering and Searching for Staff
//
// Run: cd backend && npx jest tests/day26_m4_staff.test.js --no-coverage
// ============================================================================

import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

jest.setTimeout(30000);

// ─── Shared state ─────────────────────────────────────────────────────────────
let coordinatorToken;
let nurseToken;
const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 9999)}`;

const coordinatorUser = {
    name: 'M4 Staff Tester (Coord)',
    email: `m4_coord_${uniqueId}@theatrex.com`,
    password: 'SecurePass123!',
    role: 'coordinator',
    phone: '0774000001'
};

const nurseUser = {
    name: 'M4 Staff Tester (Nurse)',
    email: `m4_nurse_${uniqueId}@theatrex.com`,
    password: 'SecurePass123!',
    role: 'nurse',
    phone: '0774000002'
};

// ─── Setup ────────────────────────────────────────────────────────────────────
beforeAll(async () => {
    // Register and Login Coordinator
    await request(app).post('/api/auth/register').send(coordinatorUser);
    const coordLogin = await request(app).post('/api/auth/login').send({
        email: coordinatorUser.email,
        password: coordinatorUser.password
    });
    coordinatorToken = coordLogin.body.token;

    // Register and Login Nurse
    await request(app).post('/api/auth/register').send(nurseUser);
    const nurseLogin = await request(app).post('/api/auth/login').send({
        email: nurseUser.email,
        password: nurseUser.password
    });
    nurseToken = nurseLogin.body.token;
});

// ─── 1. Nurse CRUD ────────────────────────────────────────────────────────────
describe('M4 Day 26 – Nurse CRUD Tasks', () => {
    let testNurseId;
    const newNurse = {
        name: `Test Nurse ${uniqueId}`,
        specialization: 'ICU',
        license_number: `LIC-N-${uniqueId}`,
        phone: '0774111222',
        email: `nurse_test_${uniqueId}@theatrex.com`,
        years_of_experience: 5,
        shift_preference: 'morning'
    };

    it('should allow coordinator to create a nurse (201)', async () => {
        const res = await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send(newNurse)
            .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(newNurse.name);
        expect(res.body.data.email).toBe(newNurse.email);
        testNurseId = res.body.data.id;
    });

    it('should reject nurse creation by another nurse (403)', async () => {
        await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${nurseToken}`)
            .send({ ...newNurse, email: 'fail@test.com', license_number: 'FAIL1' })
            .expect(403);
    });

    it('should return 400 for missing required fields in nurse creation', async () => {
        const res = await request(app)
            .post('/api/nurses')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ name: 'Incomplete' })
            .expect(400);
        
        expect(res.body.success).toBe(false);
    });

    it('should fetch all active nurses (200)', async () => {
        const res = await request(app)
            .get('/api/nurses')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        const nurse = res.body.data.find(n => n.id === testNurseId);
        expect(nurse).toBeDefined();
    });

    it('should fetch single nurse by ID (200)', async () => {
        const res = await request(app)
            .get(`/api/nurses/${testNurseId}`)
            .set('Authorization', `Bearer ${nurseToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(testNurseId);
        expect(res.body.data.name).toBe(newNurse.name);
    });

    it('should allow coordinator to update a nurse (200)', async () => {
        const updatedData = { specialization: 'Pediatrics', years_of_experience: 6 };
        const res = await request(app)
            .put(`/api/nurses/${testNurseId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send(updatedData)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.specialization).toBe('Pediatrics');
        expect(res.body.data.years_of_experience).toBe(6);
    });

    it('should search for nurses by name/email (200)', async () => {
        const res = await request(app)
            .get('/api/nurses')
            .query({ search: newNurse.name })
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].name).toBe(newNurse.name);
    });

    it('should soft-delete a nurse (200)', async () => {
        const res = await request(app)
            .delete(`/api/nurses/${testNurseId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);

        // Verify it's no longer in active list
        const listRes = await request(app)
            .get('/api/nurses')
            .set('Authorization', `Bearer ${coordinatorToken}`);
        const nurse = listRes.body.data.find(n => n.id === testNurseId);
        expect(nurse).toBeUndefined();
    });
});

// ─── 2. Technician CRUD ───────────────────────────────────────────────────────
describe('M4 Day 26 – Technician CRUD Tasks', () => {
    let testTechId;
    const newTech = {
        name: `Test Tech ${uniqueId}`,
        specialization: 'Surgical Equipment',
        email: `tech_test_${uniqueId}@theatrex.com`,
        phone: '0774222333',
        license_number: `LIC-T-${uniqueId}`,
        years_of_experience: 3,
        shift_preference: 'afternoon'
    };

    it('should allow coordinator to create a technician (201)', async () => {
        const res = await request(app)
            .post('/api/technicians')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send(newTech)
            .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(newTech.name);
        testTechId = res.body.data.id;
    });

    it('should reject technician creation by unauthorized user (403)', async () => {
        await request(app)
            .post('/api/technicians')
            .set('Authorization', `Bearer ${nurseToken}`)
            .send({ ...newTech, email: 'fail_tech@test.com' })
            .expect(403);
    });

    it('should fetch all active technicians (200)', async () => {
        const res = await request(app)
            .get('/api/technicians')
            .set('Authorization', `Bearer ${nurseToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        const tech = res.body.data.find(t => t.id === testTechId);
        expect(tech).toBeDefined();
    });

    it('should filter technicians by specialization (200)', async () => {
        const res = await request(app)
            .get('/api/technicians')
            .query({ specialization: 'Equipment' })
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.data.every(t => t.specialization.includes('Equipment'))).toBe(true);
    });

    it('should allow coordinator to update a technician (200)', async () => {
        const res = await request(app)
            .put(`/api/technicians/${testTechId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ is_available: false })
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.is_available).toBe(false);
    });

    it('should soft-delete a technician (200)', async () => {
        const res = await request(app)
            .delete(`/api/technicians/${testTechId}`)
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);

        // Verify it's no longer in active list
        const listRes = await request(app)
            .get('/api/technicians')
            .set('Authorization', `Bearer ${coordinatorToken}`);
        const tech = listRes.body.data.find(t => t.id === testTechId);
        expect(tech).toBeUndefined();
    });
});
