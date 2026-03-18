import request from 'supertest';
import app from './server.js';

async function testLogin() {
    console.log('Testing login...');
    try {
        const cred = { email: 'coordinator@test.com', password: 'Test1234!' };
        const res = await request(app).post('/api/auth/login').send(cred);
        console.log('Status:', res.statusCode);
        console.log('Body:', res.body);
    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}

testLogin();
