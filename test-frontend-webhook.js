const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Mock payment intent data that matches what frontend would send
const mockPaymentIntent = {
  id: 'pi_test_frontend_' + Date.now(),
  object: 'payment_intent',
  amount: 5000, // $50.00 in cents
  currency: 'usd',
  status: 'succeeded',
  metadata: {
    donor_name: 'John Frontend Donor',
    donor_email: 'john@frontend.test',
    donation_type: 'one-time',
    is_emergency: 'false'
  },
  receipt_email: null,
  shipping: null
};

const mockEvent = {
  id: 'evt_test_frontend_webhook',
  object: 'event',
  type: 'payment_intent.succeeded',
  data: {
    object: mockPaymentIntent
  },
  created: Math.floor(Date.now() / 1000)
};

// Generate Stripe signature
const payload = JSON.stringify(mockEvent, null, 2);
const secret = process.env.STRIPE_WEBHOOK_SECRET;
const timestamp = Math.floor(Date.now() / 1000);
const signature = crypto
  .createHmac('sha256', secret)
  .update(`${timestamp}.${payload}`)
  .digest('hex');

const stripeSignature = `t=${timestamp},v1=${signature}`;

async function testFrontendWebhook() {
  try {
    console.log('Testing webhook with frontend-style metadata...');
    console.log('Webhook secret:', secret);
    console.log('Signature:', stripeSignature);
    console.log('Payment Intent metadata:', mockPaymentIntent.metadata);
    
    const response = await axios.post('http://localhost:5000/api/webhooks', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': stripeSignature
      }
    });
    
    console.log('✅ Webhook test successful:', response.status);
    console.log('Response data:', response.data);
    
    // Check for new donations
    console.log('\nChecking for new donations...');
    const { spawn } = require('child_process');
    spawn('node', ['check-donations.js'], { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Webhook test failed:', error.response?.status, error.response?.data || error.message);
  }
}

testFrontendWebhook();
