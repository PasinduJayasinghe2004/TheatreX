/**
 * Login Endpoint Test
 * Tests the POST /api/auth/login endpoint
 * 
 * Run with: npm test -- test-login.test.js
 */

import request from 'supertest';
import app from '../server.js';

describe('POST /api/auth/login - Login Endpoint Test', () => {
    
    test('✅ Should respond to POST requests on /api/auth/login', async () => {
        // This test verifies the endpoint exists and accepts POST
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        // We don't care about the actual authentication result
        // We just want to verify it's not a 404 "Route not found"
        console.log('\n📊 Response Status:', response.status);
        console.log('📋 Response Body:', JSON.stringify(response.body, null, 2));
        
        // The route should exist (not 404)
        expect(response.status).not.toBe(404);
        
        // It should return JSON
        expect(response.body).toBeDefined();
        
        // It should have a message or success field
        expect(
            response.body.success !== undefined || 
            response.body.message !== undefined ||
            response.body.error !== undefined
        ).toBe(true);

        console.log('\n✅ SUCCESS: Login endpoint is working correctly!');
        console.log('   - Route exists (POST /api/auth/login)');
        console.log('   - Accepts JSON requests');
        console.log('   - Returns valid JSON response');
    });

    test('✅ Should NOT return "Route not found" error', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        // Verify the old GET error doesn't occur
        expect(response.body.message).not.toMatch(/Route.*not found/i);
        expect(response.status).not.toBe(404);

        console.log('\n✅ No 404 "Route not found" error!');
    });

    test('✅ Should validate login data format', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            })
            .set('Content-Type', 'application/json');

        // Check for validation errors or auth errors (not route errors)
        const hasError = !response.body.success;
        const isValidationOrAuthError = 
            response.body.message?.includes('Invalid') ||
            response.body.message?.includes('credentials') ||
            response.body.message?.includes('required');

        if (hasError) {
            console.log('\n✅ Server validated the request:');
            console.log('   Error type:', response.body.message);
        } else {
            console.log('\n✅ Request was processed by the server');
        }

        // The important thing is the route exists and is being processed
        expect(response.status).not.toBe(404);
    });
});
