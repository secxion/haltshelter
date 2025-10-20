
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');

// Create a mock webhook payload similar to what Stripe sends
const mockWebhookPayload = {
  "id": "evt_test_webhook",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_test_payment_intent",
      "object": "payment_intent",
      "amount": 2000,
      "currency": "usd",
      "metadata": {},
      "shipping": {
        "name": "Jenny Rosen",
        "address": {
          "city": "San Francisco",
          "country": "US",
          "line1": "510 Townsend St",
          "postal_code": "94103",
          "state": "CA"
        }
      },
      "receipt_email": null,
      "status": "succeeded"
    }
  }
};

// Create the signature using our webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const payload = JSON.stringify(mockWebhookPayload);
const signature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret: webhookSecret
});

console.log('Testing webhook handler with mock data...');
console.log('Webhook secret:', webhookSecret);
console.log('Signature:', signature);

// Send the webhook to our local server
axios.post('http://localhost:5000/api/webhooks', payload, {

  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': signature
  }
}).then(response => {
  console.log('✅ Webhook test successful:', response.status);
  console.log('Response data:', response.data);
  
  // Wait a moment then check donations
  setTimeout(async () => {
    try {


const mongoose = require('mongoose');
      const Donation = require('./server/models/Donation');
      
      await mongoose.connect(process.env.MONGODB_URI);
      const donations = await Donation.find().sort({ createdAt: -1 }).limit(1);
      console.log('Recent donations after webhook:', donations.length);
      if (donations.length > 0) {
        console.log('Latest donation:', {
          id: donations[0]._id,
          amount: donations[0].amount,
          donorName: donations[0].donorInfo?.name,
          receiptId: donations[0].receiptId
     });
      }
      await mongoose.disconnect();
    } catch (error) {
      console.error('Error checking donations:', error);
    }
  }, 2000);
  
}).catch(error => {
  console.error('❌ Webhook test failed:', error.response?.data || error.message);
});
