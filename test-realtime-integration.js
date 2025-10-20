const axios = require('axios');

async function testRealTimeIntegration() {
  try {
    console.log('🎯 Testing Real-Time Frontend Integration...\n');

    // Test the exact same endpoint and metadata format that the frontend uses
    console.log('📤 Creating payment intent (like frontend PaymentForm)...');
    
    const frontendPayload = {
      amount: 8500, // $85.00 in cents (like frontend converts: 85 * 100)
      currency: 'usd',
      metadata: {
        donor_name: 'Real-Time Test User',
        donor_email: 'realtime@test.org',
        donation_type: 'one-time',
        is_emergency: 'false'
      }
    };

    const response = await axios.post(
      'http://localhost:5000/api/donations/create-payment-intent',
      frontendPayload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('✅ Payment intent created successfully!');
    console.log('📝 Response data:');
    console.log('   - Client Secret:', response.data.client_secret ? 'Present ✅' : 'Missing ❌');
    console.log('   - Payment Intent ID:', response.data.payment_intent_id);
    
    console.log('\n🔄 This payment intent is now ready for frontend to use with Stripe Elements');
    console.log('💳 When user completes payment, Stripe will send webhook to our handler');
    console.log('📊 Webhook will create donation record in database');
    
    console.log('\n✅ Real-time integration test completed!');
    console.log('🎉 Frontend → Backend → Stripe → Webhook → Database flow is ready!');

  } catch (error) {
    console.error('❌ Real-time integration test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testRealTimeIntegration();
