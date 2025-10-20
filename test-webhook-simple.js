const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Simple webhook test without spawning processes
async function simpleWebhookTest() {
  try {
    const mockPaymentIntent = {
      id: 'pi_webhook_test_' + Date.now(),
      object: 'payment_intent',
      amount: 3500, // $35.00
      currency: 'usd',
      status: 'succeeded',
      metadata: {
        donor_name: 'Webhook Test User',
        donor_email: 'webhook@test.com',
        donation_type: 'one-time',
        is_emergency: 'false'
      },
      receipt_email: null,
      shipping: null
    };

    const mockEvent = {
      id: 'evt_webhook_test',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: { object: mockPaymentIntent },
      created: Math.floor(Date.now() / 1000)
    };

    // Generate signature
    const payload = JSON.stringify(mockEvent, null, 2);
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');

    console.log('🧪 Testing webhook processing...');
    console.log('📧 Donor email:', mockPaymentIntent.metadata.donor_email);
    console.log('💰 Amount:', mockPaymentIntent.amount / 100);
    
    const response = await axios.post('http://localhost:5000/api/webhooks', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': `t=${timestamp},v1=${signature}`
      },
      timeout: 10000
    });
    
    console.log('✅ Webhook response:', response.status);
    console.log('📝 Response data:', response.data);
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('⏱️  Waited 2 seconds for processing...');
    
  } catch (error) {
    console.error('❌ Webhook test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Data:', error.response?.data);
  }
}

simpleWebhookTest();
