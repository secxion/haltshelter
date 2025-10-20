const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Test multiple donation scenarios
async function testMultipleDonations() {
  const testCases = [
    {
      name: 'Large Donor Alpha',
      email: 'alpha@bigdonor.com',
      amount: 143000, // $1430.00
      type: 'one-time',
      emergency: 'false'
    },
    {
      name: 'Emergency Donor Beta',
      email: 'beta@emergency.org',
      amount: 25000, // $250.00
      type: 'one-time',
      emergency: 'true'
    },
    {
      name: 'Monthly Donor Gamma',
      email: 'gamma@monthly.net',
      amount: 5000, // $50.00
      type: 'monthly',
      emergency: 'false'
    },
    {
      name: 'Small Donor Delta',
      email: 'delta@small.co',
      amount: 1500, // $15.00
      type: 'one-time',
      emergency: 'false'
    }
  ];

  console.log('🧪 Testing multiple donation scenarios...\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`--- Test ${i + 1}: ${testCase.name} ---`);
    console.log(`💰 Amount: $${testCase.amount / 100}`);
    console.log(`📧 Email: ${testCase.email}`);
    console.log(`🎯 Type: ${testCase.type}`);
    console.log(`🚨 Emergency: ${testCase.emergency}`);

    try {
      const mockPaymentIntent = {
        id: `pi_test_${Date.now()}_${i}`,
        object: 'payment_intent',
        amount: testCase.amount,
        currency: 'usd',
        status: 'succeeded',
        metadata: {
          donor_name: testCase.name,
          donor_email: testCase.email,
          donation_type: testCase.type,
          is_emergency: testCase.emergency
        },
        receipt_email: null,
        shipping: null
      };

      const mockEvent = {
        id: `evt_test_${Date.now()}_${i}`,
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

      const response = await axios.post('http://localhost:5000/api/webhooks', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': `t=${timestamp},v1=${signature}`
        },
        timeout: 10000
      });

      if (response.status === 200) {
        console.log('✅ Webhook successful');
      } else {
        console.log(`❌ Webhook failed: ${response.status}`);
      }

      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Test ${i + 1} failed:`, error.message);
    }

    console.log(''); // Empty line for readability
  }

  console.log('⏱️  Waiting 3 seconds for all processing to complete...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('✅ All tests completed!');
}

testMultipleDonations();
