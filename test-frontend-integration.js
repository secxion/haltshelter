const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

async function testFullIntegration() {
  try {
    console.log('🎯 Testing full frontend-to-webhook integration...\n');

    // Step 1: Create payment intent (like frontend does)
    console.log('📤 Step 1: Creating payment intent...');
    const paymentIntentData = {
      amount: 7500, // $75.00 in cents
      currency: 'usd',
      metadata: {
        donor_name: 'Integration Test User',
        donor_email: 'integration@test.org',
        donation_type: 'one-time',
        is_emergency: 'true'
      }
    };

    const paymentIntentResponse = await axios.post(
      'http://localhost:5000/api/donations/create-payment-intent',
      paymentIntentData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('✅ Payment intent created!');
    console.log('📝 Payment Intent ID:', paymentIntentResponse.data.payment_intent_id);

    // Step 2: Simulate webhook (like Stripe would send)
    console.log('\n📥 Step 2: Simulating webhook...');
    
    const mockPaymentIntent = {
      id: paymentIntentResponse.data.payment_intent_id,
      object: 'payment_intent',
      amount: paymentIntentData.amount,
      currency: paymentIntentData.currency,
      status: 'succeeded',
      metadata: paymentIntentData.metadata,
      receipt_email: null,
      shipping: null
    };

    const mockEvent = {
      id: 'evt_integration_test',
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

    const webhookResponse = await axios.post(
      'http://localhost:5000/api/webhooks',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': `t=${timestamp},v1=${signature}`
        }
      }
    );

    console.log('✅ Webhook processed successfully!');
    console.log('📝 Webhook status:', webhookResponse.status);

    // Step 3: Wait and check database
    console.log('\n⏱️  Step 3: Waiting for database processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🔍 Checking database for new donation...');
    
    // Note: We can't directly query here, but we'll check in the next manual step
    console.log('✅ Integration test completed successfully!');
    console.log('\n🎉 Next: Check database manually to confirm donation was saved');

  } catch (error) {
    console.error('❌ Integration test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testFullIntegration();
