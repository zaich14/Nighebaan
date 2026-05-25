// Test script to check backend connectivity
const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend connection...');

    // Test health check
    const healthResponse = await axios.get('http://localhost:5000/api/health-check');
    console.log('✓ Health check:', healthResponse.data);

    // Test login with test credentials
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john@example.com',
      password: 'password123'
    });
    console.log('✓ Login successful:', loginResponse.data.user.name);

    console.log('✓ Backend is working correctly!');
  } catch (error) {
    console.error('✗ Backend test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('Backend server is not running. Please start it with: cd backend && npm run dev');
    }
  }
}

testBackend();