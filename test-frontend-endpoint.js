const axios = require('axios');
require('dotenv').config();

async function testFrontendEndpoint() {
  try {
    console.log('🧪 Testing new frontend payment intent endpoint...');
    
    const testData = {
      amount: 5000, // $50.00 in cents
      currency: 'usd',
      metadata: {
        donor_name: 'Frontend Test User',
        donor_email: 'frontend@realtest.com',
        donation_type: 'one-time',
        is_emergency: 'false'
      }
    };

    console.log('📤 Sending request:', testData);

    const response = await axios.post(
      'http://localhost:5000/api/donations/create-payment-intent',
      testData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );

    console.log('✅ Payment intent created successfully!');
    console.log('📝 Response:', {
      client_secret: response.data.client_secret ? 'Present' : 'Missing',
      payment_intent_id: response.data.payment_intent_id
    });

    return response.data;

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    throw error;
  }
}

testFrontendEndpoint();
