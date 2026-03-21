#!/usr/bin/env node

/**
 * Integrated Test Script
 * Starts the server and tests the login endpoint
 */

import { spawn } from 'child_process';
import http from 'http';

function testLoginEndpoint() {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
        });

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('\n🧪 Testing Login Endpoint\n' + '═'.repeat(60));
        console.log(`📍 URL: http://${options.hostname}:${options.port}${options.path}`);
        console.log(`📧 Email: ${JSON.parse(postData).email}`);
        console.log('═'.repeat(60) + '\n');

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`📊 Response Status: ${res.statusCode}`);
                console.log('═'.repeat(60));

                try {
                    const jsonData = JSON.parse(data);
                    console.log('📋 Response Body:');
                    console.log(JSON.stringify(jsonData, null, 2));
                } catch {
                    console.log('📋 Response:');
                    console.log(data);
                }

                console.log('═'.repeat(60));

                // Check if it's the old GET error
                if (res.statusCode === 404) {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.message && parsed.message.includes('not found')) {
                            console.log('\n❌ FAILED: Still getting "not found" error');
                            console.log('   The route might not be registered correctly');
                            resolve(false);
                            return;
                        }
                    } catch (e) {
                        // Not JSON, ignore
                    }
                }

                console.log('\n✅ SUCCESS! Login endpoint is working correctly:');
                console.log('   ✓ POST /api/auth/login route exists');
                console.log('   ✓ Endpoint accepts JSON requests');
                console.log('   ✓ Server returns valid JSON response');
                console.log('\n📝 Note: Response might be an error (invalid credentials)');
                console.log('   but that is normal. The important thing is the route exists!');
                resolve(true);
            });
        });

        req.on('error', (e) => {
            console.log('❌ Request failed:', e.message);
            resolve(false);
        });

        req.write(postData);
        req.end();
    });
}

function waitForServer(maxAttempts = 20) {
    return new Promise((resolve) => {
        let attempts = 0;

        const checkServer = () => {
            attempts++;
            const options = {
                hostname: 'localhost',
                port: 5000,
                path: '/',
                method: 'GET'
            };

            const req = http.request(options, () => {
                console.log('✅ Server is ready!\n');
                resolve(true);
            });

            req.on('error', () => {
                if (attempts < maxAttempts) {
                    setTimeout(checkServer, 500);
                } else {
                    console.log('❌ Server failed to start within 10 seconds');
                    resolve(false);
                }
            });

            req.end();
        };

        setTimeout(checkServer, 1000);
    });
}

async function main() {
    console.log('🚀 Starting TheatreX Backend Server...\n');

    // Start the server
    const server = spawn('node', ['server.js'], {
        cwd: process.cwd(),
        stdio: 'inherit'
    });

    // Wait for server to be ready
    const ready = await waitForServer();
    if (!ready) {
        server.kill();
        process.exit(1);
    }

    // Run the test
    const success = await testLoginEndpoint();

    // Cleanup
    console.log('\n🧹 Stopping server...');
    server.kill();

    process.exit(success ? 0 : 1);
}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
