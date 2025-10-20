require('dotenv').config();
const axios = require('axios');

console.log('Testing webhook endpoint...');

// Simple test to see if endpoint is working
axios.post('http://localhost:5000/api/webhooks', JSON.stringify({ test: 'data' }), {
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': 'invalid_signature_for_testing'
  }
}).then(response => {
  console.log('✅ Response:', response.status, response.data);
}).catch(error => {
  console.log('Expected error (no valid signature):', error.response?.status, error.response?.data);
});
