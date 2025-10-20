const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const mockPaymentIntent = {
  id: 'pi_test_simple_' + Date.now(),
  object: 'payment_intent',
  amount: 2500, // $25.00
  currency: 'usd',
  status: 'succeeded',
  metadata: {
    donor_name: 'Jane Simple Donor',
    donor_email: 'jane@simple.test',
    donation_type: 'one-time',
    is_emergency: 'false'
  },
  receipt_email: null,
  shipping: null
};

const mockEvent = {
  id: 'evt_simple_test',
  object: 'event',
  type: 'payment_intent.succeeded',
  data: { object: mockPaymentIntent },
  created: Math.floor(Date.now() / 1000)
};

async function testSimpleWebhook() {
  try {
    const payload = JSON.stringify(mockEvent, null, 2);
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(timestamp + '.' + payload)
      .digest('hex');

    console.log('🧪 Testing simple webhook...');
    console.log('Payload:', mockPaymentIntent.metadata);
    
    const response = await axios.post('http://localhost:5000/api/webhooks', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${signature}`
      }
    });
    
    console.log('✅ Response:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.status || error.message);
    if (error.response?.data) {
      console.error('Error data:', error.response.data);
    }
  }
}

testSimpleWebhook();
