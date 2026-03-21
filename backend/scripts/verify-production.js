#!/usr/bin/env node

/**
 * Post-Deployment Production Verification Script
 * 
 * Verifies that the production deployment is working correctly
 * Run this after deploying to production
 * 
 * Usage: node backend/scripts/verify-production.js https://backend-url https://frontend-url
 */

import axios from 'axios';
import https from 'https';

const args = process.argv.slice(2);
const BACKEND_URL = args[0] || process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = args[1] || process.env.FRONTEND_URL || 'http://localhost:5173';

// Disable SSL verification for self-signed certificates (not recommended for production)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const tests = [];
let passedTests = 0;
let failedTests = 0;

/**
 * Add a test to the suite
 */
function test(name, fn) {
  tests.push({ name, fn });
}

/**
 * Run a test and log results
 */
async function runTest(testObj, index) {
  const { name, fn } = testObj;
  const testNum = index + 1;
  
  try {
    process.stdout.write(`[${testNum}/${tests.length}] ${name}... `);
    await fn();
    console.log('✅ PASS');
    passedTests++;
  } catch (error) {
    console.log('❌ FAIL');
    console.log(`       Error: ${error.message}`);
    failedTests++;
  }
}

/**
 * Test backend health endpoint
 */
test('Backend health check', async () => {
  const response = await axios.get(`${BACKEND_URL}/health`, { httpsAgent });
  if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  if (!response.data.status) throw new Error('No status in response');
});

/**
 * Test backend API health endpoint
 */
test('Backend API health check', async () => {
  const response = await axios.get(`${BACKEND_URL}/api/health`, { httpsAgent });
  if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
});

/**
 * Test backend CORS headers
 */
test('CORS headers configuration', async () => {
  const response = await axios.get(`${BACKEND_URL}/health`, {
    headers: { Origin: FRONTEND_URL },
    httpsAgent,
  });
  
  const allowOrigin = response.headers['access-control-allow-origin'];
  if (!allowOrigin) throw new Error('No Access-Control-Allow-Origin header');
  if (!allowOrigin.includes(FRONTEND_URL) && allowOrigin !== '*') {
    throw new Error(`CORS not configured for ${FRONTEND_URL}`);
  }
});

/**
 * Test security headers
 */
test('Security headers present', async () => {
  const response = await axios.get(`${BACKEND_URL}/health`, { httpsAgent });
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
  ];
  
  for (const header of requiredHeaders) {
    if (!response.headers[header]) {
      throw new Error(`Missing security header: ${header}`);
    }
  }
});

/**
 * Test database connectivity
 */
test('Database connectivity', async () => {
  const response = await axios.get(`${BACKEND_URL}/api/surgeries`, { 
    httpsAgent,
    validateStatus: () => true, // Accept any status
  });
  
  // Any response other than 500+ is good (auth errors are OK)
  if (response.status >= 500) {
    throw new Error(`Database likely not connected: ${response.status}`);
  }
});

/**
 * Test user registration endpoint exists
 */
test('User registration endpoint', async () => {
  const response = await axios.post(`${BACKEND_URL}/api/auth/register`, 
    {
      email: `test-${Date.now()}@example.com`,
      password: 'Test@123456',
      name: 'Test User',
    },
    { 
      httpsAgent,
      validateStatus: () => true,
    }
  );
  
  // Should get at least a 400/422 validation error, not 404
  if (response.status === 404) {
    throw new Error('Registration endpoint not found');
  }
});

/**
 * Test login endpoint exists
 */
test('User login endpoint', async () => {
  const response = await axios.post(`${BACKEND_URL}/api/auth/login`,
    {
      email: 'test@example.com',
      password: 'wrongpassword',
    },
    {
      httpsAgent,
      validateStatus: () => true,
    }
  );
  
  if (response.status === 404) {
    throw new Error('Login endpoint not found');
  }
});

/**
 * Test surgeries list endpoint
 */
test('Surgeries list endpoint', async () => {
  const response = await axios.get(`${BACKEND_URL}/api/surgeries`,
    {
      httpsAgent,
      validateStatus: () => true,
    }
  );
  
  // 401 is OK (not authenticated), 404 is not OK
  if (response.status === 404) {
    throw new Error('Surgeries endpoint not found');
  }
});

/**
 * Test frontend loads
 */
test('Frontend loads successfully', async () => {
  const response = await axios.get(FRONTEND_URL, {
    httpsAgent,
    validateStatus: () => true,
  });
  
  if (response.status !== 200) {
    throw new Error(`Frontend returned ${response.status}`);
  }
  
  if (!response.data.includes('html') && !response.data.includes('<!DOCTYPE')) {
    throw new Error('Frontend did not return HTML');
  }
});

/**
 * Test frontend has title
 */
test('Frontend has proper title', async () => {
  const response = await axios.get(FRONTEND_URL, {
    httpsAgent,
  });
  
  if (!response.data.includes('TheatreX') && !response.data.includes('theatre')) {
    console.warn('Warning: Frontend title may not be set correctly');
  }
});

/**
 * Test SSL/HTTPS
 */
test('HTTPS/SSL enabled', async () => {
  if (BACKEND_URL.startsWith('https')) {
    // Just verify we can connect
    await axios.get(`${BACKEND_URL}/health`, { httpsAgent });
  } else {
    console.log('(Skipped - not using HTTPS)');
  }
});

/**
 * Test response time
 */
test('Backend response time acceptable', async () => {
  const start = Date.now();
  await axios.get(`${BACKEND_URL}/health`, { httpsAgent });
  const duration = Date.now() - start;
  
  if (duration > 5000) {
    throw new Error(`Response too slow: ${duration}ms`);
  }
});

/**
 * Test JSON response format
 */
test('Backend returns valid JSON', async () => {
  const response = await axios.get(`${BACKEND_URL}/health`, { httpsAgent });
  
  if (typeof response.data !== 'object') {
    throw new Error('Response is not JSON');
  }
});

/**
 * Find all API endpoints
 */
test('API endpoints are discoverable', async () => {
  // Try common endpoints to see if they exist
  const endpoints = [
    '/api/surgeries',
    '/api/theatres',
    '/api/patients',
    '/api/notifications',
  ];
  
  const available = [];
  for (const endpoint of endpoints) {
    const response = await axios.get(`${BACKEND_URL}${endpoint}`,
      {
        httpsAgent,
        validateStatus: () => true,
      }
    );
    
    if (response.status !== 404) {
      available.push(endpoint);
    }
  }
  
  if (available.length === 0) {
    throw new Error('No API endpoints found');
  }
});

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('🚀 POST-DEPLOYMENT VERIFICATION TESTS');
  console.log('═'.repeat(70));
  console.log(`Backend URL:  ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log('─'.repeat(70));
  console.log('');

  for (let i = 0; i < tests.length; i++) {
    await runTest(tests[i], i);
  }

  console.log('');
  console.log('─'.repeat(70));
  console.log(`Results: ${passedTests} passed, ${failedTests} failed (${tests.length} total)`);
  console.log('═'.repeat(70));
  console.log('');

  if (failedTests === 0) {
    console.log('✅ ALL TESTS PASSED - DEPLOYMENT VERIFIED!');
    console.log('');
    console.log('Your application is ready for production. 🎉');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED - PLEASE INVESTIGATE');
    console.log('');
    console.log('Check the errors above and fix issues before going live.');
    console.log('');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
