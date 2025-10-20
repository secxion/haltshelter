const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/Donation');

// Webhook secret from your Stripe dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('🎯 Webhook endpoint hit!');
  console.log('Headers:', req.headers['stripe-signature'] ? 'Has stripe signature' : 'No stripe signature');
  
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  console.log('🎯 Processing event type:', event.type);
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ PaymentIntent was successful!', paymentIntent);
      
      // Fulfill the purchase
      try {
        const { amount, currency, metadata, shipping } = paymentIntent;
        
        // Extract metadata or use defaults for test events
        // Frontend sends donor_name, donor_email, donation_type
        const donorName = metadata?.donor_name || 
                         metadata?.donorName || 
                         shipping?.name || 
                         'Test Donor';
        const donorEmail = metadata?.donor_email || 
                          metadata?.donorEmail || 
                          paymentIntent.receipt_email ||
                          'test@haltshelter.org';
        const donationType = metadata?.donation_type || 
                            metadata?.donationType || 
                            'one-time';
        const category = metadata?.category || 
                        (metadata?.is_emergency === 'true' ? 'emergency' : 'general');

        console.log('🔍 Raw values from paymentIntent:', {
          metadata: metadata,
          shipping: shipping,
          receipt_email: paymentIntent.receipt_email,
          currency: currency
        });

        console.log('🔍 Extracted values:', {
          donorName,
          donorEmail,
          donationType,
          category
        });

        console.log('🔍 About to create donation with data:', {
          donorName,
          donorEmail,
          donationType,
          currency: currency.toUpperCase(),
          amount: amount / 100
        });

        // Create a new donation record in the database
        const newDonation = new Donation({
          // Donor Information (required structure)
          donorInfo: {
            name: donorName,
            email: donorEmail,
            phone: metadata?.donorPhone || shipping?.phone,
            address: shipping?.address ? {
              street: shipping.address.line1,
              city: shipping.address.city,
              state: shipping.address.state,
              zipCode: shipping.address.postal_code,
              country: shipping.address.country || 'US'
            } : undefined,
            isAnonymous: metadata?.isAnonymous === 'true'
          },
          amount: amount / 100, // Convert from cents to dollars
          currency: currency.toUpperCase(), // Ensure uppercase for enum validation
          donationType: donationType,
          category: category,
          paymentMethod: 'stripe',
          paymentStatus: 'completed', // Set status to completed since payment succeeded
          transactionId: paymentIntent.id,
          stripePaymentIntentId: paymentIntent.id
        });

        const savedDonation = await newDonation.save();
        console.log('✅ Donation saved successfully:', savedDonation.receiptId);
        
      } catch (error) {
        console.error('❌ Error saving donation to database:', error);
      }
      break;

    // ... handle other event types
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      console.log('❌ PaymentIntent failed:', paymentIntentFailed.last_payment_error?.message);
      // Notify the user, log the failure, etc.
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = router;
