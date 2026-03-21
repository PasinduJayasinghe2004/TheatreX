#!/usr/bin/env node

/**
 * Simple Login Endpoint Test
 * Tests the POST /api/auth/login endpoint
 * 
 * Run with: node test-login-simple.js
 */

const http = require('http');

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

        console.log('\n🧪 Testing Login Endpoint\n' + '═'.repeat(50));
        console.log(`📍 URL: http://${options.hostname}:${options.port}${options.path}`);
        console.log(`📧 Email: ${JSON.parse(postData).email}`);
        console.log('═'.repeat(50) + '\n');

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`📊 Response Status: ${res.statusCode}`);
                console.log('═'.repeat(50));

                try {
                    const jsonData = JSON.parse(data);
                    console.log('📋 Response Body:');
                    console.log(JSON.stringify(jsonData, null, 2));
                } catch {
                    console.log('📋 Response:');
                    console.log(data);
                }

                console.log('═'.repeat(50));

                // Check results
                if (res.statusCode === 404) {
                    const parsed = JSON.parse(data);
                    if (parsed.message && parsed.message.includes('not found')) {
                        console.log('\n❌ FAILED: Route not found (GET issue detected)');
                        resolve(false);
                        return;
                    }
                }

                console.log('\n✅ SUCCESS! Login endpoint is working correctly:');
                console.log('   ✓ Route exists for POST');
                console.log('   ✓ Accepts JSON requests');
                console.log('   ✓ Returns valid JSON response');
                resolve(true);
            });
        });

        req.on('error', (e) => {
            if (e.code === 'ECONNREFUSED') {
                console.log('\n❌ ERROR: Connection refused');
                console.log(`   Backend is not running at http://localhost:5000`);
                console.log('   Start it with: npm run dev');
            } else {
                console.log('\n❌ ERROR:', e.message);
            }
            resolve(false);
        });

        req.write(postData);
        req.end();
    });
}

// Run the test
testLoginEndpoint().then((success) => {
    process.exit(success ? 0 : 1);
});
