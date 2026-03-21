#!/usr/bin/env node

/**
 * Test Login Endpoint Script
 * 
 * This script tests the POST /api/auth/login endpoint locally
 * Run with: node test-login-endpoint.js
 */

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const ENDPOINT = '/api/auth/login';

// Test credentials - adjust these based on your test user
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

async function testLoginEndpoint() {
  console.log('🧪 Testing Login Endpoint');
  console.log('═'.repeat(50));
  console.log(`📍 URL: ${BASE_URL}${ENDPOINT}`);
  console.log(`📧 Email: ${testCredentials.email}`);
  console.log('═'.repeat(50));
  console.log('');

  try {
    console.log('📤 Sending POST request...');
    
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials)
    });

    const responseData = await response.json();
    
    console.log(`\n📊 Response Status: ${response.status}`);
    console.log('═'.repeat(50));
    console.log('📋 Response Body:');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('═'.repeat(50));

    // Validate response
    if (response.ok && responseData.success) {
      console.log('\n✅ SUCCESS! Login endpoint responded correctly');
      if (responseData.token) {
        console.log(`🔐 Access Token: ${responseData.token.substring(0, 20)}...`);
      }
      if (responseData.user) {
        console.log(`👤 User: ${responseData.user.name || responseData.user.email}`);
      }
      return true;
    } else if (responseData.message === 'Invalid credentials') {
      console.log('\n⚠️  User credentials are incorrect');
      console.log('   The endpoint is working correctly, but the test user doesn\'t exist');
      console.log('   or the password is wrong. You should:');
      console.log('   1. Register a test user first');
      console.log('   2. Update the credentials in this script');
      return false;
    } else {
      console.log('\n❌ ERROR! Unexpected response');
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('\n❌ ERROR: Connection refused');
      console.log(`   Is the backend running at ${BASE_URL}?`);
      console.log('   Try running: npm run dev');
    } else {
      console.log('\n❌ ERROR:', error.message);
    }
    return false;
  }
}

// Run test
const success = await testLoginEndpoint();
process.exit(success ? 0 : 1);
