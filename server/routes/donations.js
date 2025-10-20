const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Donation } = require('../models');
const { authenticate, authorize,  } = require('../middleware/auth');
const { logToFile } = require('../utils/fileLogger');

const router = express.Router();


// Create Stripe subscription for monthly donations
router.post('/create-subscription', [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('name').trim().isLength({ min: 1 }).withMessage('Donor name is required'),
  body('paymentMethodId').isString().withMessage('Payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });

    }

    const { amount, email, name, paymentMethodId } = req.body;
    const amountInCents = Math.round(amount * 100);

    // 1. Find or create Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name
      });
    }

    // 2. Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customer.id });
    await stripe.customers.update(customer.id, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    // 3. Find or create a product for monthly donations
    let product;
    const products = await stripe.products.list({ limit: 100 });
    product = products.data.find(p => p.name === 'HALT Monthly Donation');
    if (!product) {
      product = await stripe.products.create({ name: 'HALT Monthly Donation' });
    }

    // 4. Find or create a price for this amount
    let price;
    const prices = await stripe.prices.list({ product: product.id, limit: 100 });
    price = prices.data.find(p => p.unit_amount === amountInCents && p.recurring && p.recurring.interval === 'month');
    if (!price) {
      price = await stripe.prices.create({
        unit_amount: amountInCents,
        currency: 'usd',
        recurring: { interval: 'month' },
        product: product.id
      });
    }

    // 5. Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        donor_name: name,
        donor_email: email,
        donation_type: 'monthly'
      }
    });

    // 6. Save to Donation model
    const donation = new Donation({
      donorInfo: { name, email },
      amount,
      currency: 'USD',
      donationType: 'monthly',
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      isRecurring: true,
      recurringSchedule: { frequency: 'monthly', isActive: true },
      source: 'website'
    });
    await donation.save();

    res.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      paymentIntentStatus: subscription.latest_invoice.payment_intent.status,
      donationId: donation._id
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription', details: error.message });
  }
});


// NEW: Create payment intent for frontend (matches webhook metadata format)
router.post('/create-payment-intent', [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('metadata.donor_email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('metadata.donor_name').trim().isLength({ min: 1 }).withMessage('Donor name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency = 'usd', metadata } = req.body;

    console.log('🎯 Creating payment intent with frontend metadata:', {
      amount,
      currency,
      metadata
    });
 
    // Create Stripe PaymentIntent with frontend-compatible metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Frontend already sends in cents
      currency: currency.toLowerCase(),
      metadata: {
        donor_name: metadata.donor_name,
        donor_email: metadata.donor_email,
        donation_type: metadata.donation_type || 'one-time',
        is_emergency: metadata.is_emergency || 'false'
      }
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message 
    });
  }
});

// LEGACY: Create donation intent (old endpoint for backward compatibility)
router.post('/create-intent', [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      amount, 
      email, 
      firstName, 
      lastName, 
      isRecurring = false,
      dedicationType,
      dedicationName,
      dedicationMessage
    } = req.body;

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        donorEmail: email,
        donorFirstName: firstName,
        donorLastName: lastName,
        isRecurring: isRecurring.toString(),
        dedicationType: dedicationType || '',
        dedicationName: dedicationName || '',
        dedicationMessage: dedicationMessage || ''
      }
    });

    // Create pending donation record
    const donation = new Donation({
      amount,
      email,
      firstName,
      lastName,
      paymentIntentId: paymentIntent.id,
      status: 'pending',
      isRecurring,
      dedicationType,
      dedicationName,
      dedicationMessage
    });

    await donation.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      donationId: donation._id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Stripe webhook handler
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  logToFile('[DIAG] Webhook handler entered');
  // Deep diagnostic logging: log every event received
  try {
    const eventType = req.headers['stripe-signature'] ? (JSON.parse(req.body.toString('utf8')).type || 'unknown') : 'no-stripe-signature';
    logToFile(`[DIAG] Webhook received: ${eventType}`);
  } catch (e) {
    logToFile(`[DIAG] Webhook received but could not parse event type: ${e}`);
  }
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {


    // Handle all successful payment events that may indicate a completed donation
    case 'payment_intent.succeeded':
    case 'invoice.payment_succeeded':
    case 'invoice.paid':
    case 'invoice_payment.paid': {
      // Normalize event object for all cases
      let paymentIntent, invoice;
      if (event.type === 'payment_intent.succeeded') {
        paymentIntent = event.data.object;
      } else {
        invoice = event.data.object;
        // For invoice events, get PaymentIntent from invoice.payment_intent
        if (invoice.payment_intent) {
          try {
            paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
          } catch (e) {
            logToFile(`[DIAG] Could not retrieve paymentIntent for invoice: ${e}`);
          }
        }
      }

      let donation = null;
      try {
        // Deduplication logic: check for existing donation by transactionId (for all),
        // and for recurring, by both stripeSubscriptionId and transactionId/invoice/charge ID
        let transactionId = '';
        let stripeSubscriptionId = '';
        if (paymentIntent && paymentIntent.id) {
          transactionId = paymentIntent.id;
        } else if (invoice) {
          transactionId = invoice.charge || invoice.id;
        }
        if (invoice && invoice.subscription) {
          stripeSubscriptionId = invoice.subscription;
        } else if (paymentIntent && paymentIntent.metadata && paymentIntent.metadata.stripeSubscriptionId) {
          stripeSubscriptionId = paymentIntent.metadata.stripeSubscriptionId;
        }

        // Try to find an existing donation by transactionId (for all)
        if (transactionId) {
          donation = await Donation.findOne({ transactionId });
          if (donation) {
            logToFile(`[DIAG] Found donation by transactionId: ${donation._id}`);
          }
        }

        // For recurring, also check by stripeSubscriptionId + transactionId (or invoice/charge ID)
        if (!donation && stripeSubscriptionId && transactionId) {
          donation = await Donation.findOne({ stripeSubscriptionId, transactionId });
          if (donation) {
            logToFile(`[DIAG] Found donation by stripeSubscriptionId + transactionId: ${donation._id}`);
          }
        }

        // If donation already exists, only send receipt if not already sent (or just log and skip duplicate event)
        if (donation) {
          logToFile('[DIAG] Duplicate payment event received, donation already exists. Skipping creation.');
          break;
        }

        // If still not found, try to create a new donation using available data
        let donorName = 'Supporter';
        let donorEmail = '';
        let donationType = 'one-time';
        let amount = 0;
        let currency = 'USD';
        let stripeCustomerId = '';
        let isRecurring = false;

        // Force recurring/monthly for all subscription/invoice events (PawPack)
        if (paymentIntent) {
          const meta = paymentIntent.metadata || {};
          donorName = meta.donor_name || meta.donorName || paymentIntent.shipping?.name || 'Supporter';
          donorEmail = meta.donor_email || meta.donorEmail || paymentIntent.receipt_email;
          // If this is a subscription (PawPack), always set as monthly/recurring
          if (invoice && invoice.subscription) {
            donationType = 'monthly';
            isRecurring = true;
          } else {
            donationType = meta.donation_type || 'one-time';
            isRecurring = donationType !== 'one-time';
          }
          amount = paymentIntent.amount / 100;
          currency = paymentIntent.currency ? paymentIntent.currency.toUpperCase() : 'USD';
          stripeCustomerId = paymentIntent.customer;

          // If donorEmail is missing and this is a subscription/invoice event, fetch customer
          if ((!donorEmail || donorEmail === 'null' || donorEmail === 'undefined') && paymentIntent.customer) {
            try {
              const customer = await stripe.customers.retrieve(paymentIntent.customer);
              if (customer && customer.email) {
                donorEmail = customer.email;
                donorName = customer.name || donorName;
                logToFile(`[DIAG] Retrieved donor email from Stripe customer: ${donorEmail}`);
              }
            } catch (custErr) {
              logToFile(`[DIAG] Error fetching Stripe customer for email: ${custErr}`);
            }
          }
        } else if (invoice) {
          // Fallback: create donation from invoice object if paymentIntent is missing
          amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
          currency = invoice.currency ? invoice.currency.toUpperCase() : 'USD';
          stripeCustomerId = invoice.customer;
          if (invoice.subscription) {
            donationType = 'monthly';
            isRecurring = true;
          } else {
            donationType = 'one-time';
            isRecurring = false;
          }

          // Try to get donor email from invoice.customer
          if (invoice.customer) {
            try {
              const customer = await stripe.customers.retrieve(invoice.customer);
              if (customer && customer.email) {
                donorEmail = customer.email;
                donorName = customer.name || donorName;
                logToFile(`[DIAG] Retrieved donor email from Stripe customer (invoice fallback): ${donorEmail}`);
              }
            } catch (custErr) {
              logToFile(`[DIAG] Error fetching Stripe customer for invoice fallback: ${custErr}`);
            }
          }
        }

        let donationJustCreated = false;
        if (donorEmail) {
          donation = new Donation({
            donorInfo: {
              name: donorName,
              email: donorEmail
            },
            amount,
            currency,
            donationType,
            paymentMethod: 'stripe',
            paymentStatus: 'completed',
            transactionId,
            stripeCustomerId,
            stripeSubscriptionId,
            source: 'website',
            isRecurring,
            completedAt: new Date(),
          });
          try {
            await donation.save();
            logToFile(`[DIAG] Donation created and saved (dedup safe): ${donation._id}`);
            donationJustCreated = true;
          } catch (saveErr) {
            logToFile(`[DIAG] Error saving new donation (dedup safe): ${saveErr}`);
            // If duplicate key error, fetch the existing donation and do not send a receipt again
            if (saveErr.code === 11000) {
              donation = await Donation.findOne({ transactionId });
              donationJustCreated = false;
            } else {
              donation = null;
            }
          }
        } else {
          logToFile('[DIAG] Could not create donation: donor email missing in all sources.');
        }

        // Only send a receipt if donation was just created and saved successfully
        if (!donation) {
          const noDonationMsg = '[DIAG] No donation object available for receipt email. Skipping email send.';
          console.log(noDonationMsg);
          logToFile(noDonationMsg);
        } else if (donationJustCreated) {
          try {
            const { sendReceiptEmail } = require('../utils/email');
            const donorEmail = (donation.donorInfo && donation.donorInfo.email) || donation.email || (paymentIntent && paymentIntent.receipt_email);
            if (!donorEmail) {
              const noEmailMsg = '[DIAG] No donor email found for receipt.';
              console.log(noEmailMsg);
              logToFile(noEmailMsg);
            } else {
              const donorName = (donation.donorInfo && donation.donorInfo.name) || donation.firstName || 'Supporter';
              const amount = donation.amount;
              const currency = donation.currency || 'USD';
              const donationType = donation.donationType || 'one-time';
              const category = donation.category || 'general';
              const transactionId = donation.transactionId || (paymentIntent && paymentIntent.id) || (invoice && invoice.charge) || '';
              const dateStr = donation.completedAt ? new Date(donation.completedAt).toLocaleString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              const isRecurring = donation.isRecurring || false;
              let paymentMethodStr = 'Stripe';
              if (paymentIntent && paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
                const charge = paymentIntent.charges.data[0];
                if (charge.payment_method_details && charge.payment_method_details.card) {
                  const brand = charge.payment_method_details.card.brand;
                  const last4 = charge.payment_method_details.card.last4;
                  paymentMethodStr = `${brand.charAt(0).toUpperCase() + brand.slice(1)} •••• ${last4}`;
                } else if (charge.payment_method_details && charge.payment_method_details.type) {
                  paymentMethodStr = charge.payment_method_details.type.charAt(0).toUpperCase() + charge.payment_method_details.type.slice(1);
                }
              }
              const recurringStr = isRecurring ? `Yes (${donationType.charAt(0).toUpperCase() + donationType.slice(1)})` : 'No';
              const prepMsg = `[DIAG] Preparing to send receipt email to ${donorEmail}`;
              console.log(prepMsg);
              logToFile(prepMsg);
              try {
                const subject = `Thank you for your donation to HALT!`;
                const html = `
                  <p>Dear ${donorName},</p>
                  <p>Thank you for your generous donation to HALT. Here are your donation details:</p>
                  <ul>
                    <li><b>Donor Name:</b> ${donorName}</li>
                    <li><b>Donor Email:</b> ${donorEmail}</li>
                    <li><b>Amount:</b> $${amount} ${currency}</li>
                    <li><b>Donation Type:</b> ${donationType.charAt(0).toUpperCase() + donationType.slice(1)}</li>
                    <li><b>Payment Method:</b> ${paymentMethodStr}</li>
                    <li><b>Transaction ID:</b> ${transactionId}</li>
                    <li><b>Date:</b> ${dateStr} UTC</li>
                    <li><b>Category:</b> ${category}</li>
                    <li><b>Recurring:</b> ${recurringStr}</li>
                  </ul>
                  <p>Your support helps us continue our mission to help animals live and thrive.</p>
                  <p>With gratitude,<br/>The HALT Team</p>
                `;
                const text = `Dear ${donorName},\n\nThank you for your generous donation to HALT. Here are your donation details:\n\nDonor Name: ${donorName}\nDonor Email: ${donorEmail}\nAmount: $${amount} ${currency}\nDonation Type: ${donationType.charAt(0).toUpperCase() + donationType.slice(1)}\nPayment Method: ${paymentMethodStr}\nTransaction ID: ${transactionId}\nDate: ${dateStr} UTC\nCategory: ${category}\nRecurring: ${recurringStr}\n\nYour support helps us continue our mission to help animals live and thrive.\n\nWith gratitude,\nThe HALT Team`;
                await sendReceiptEmail({
                  to: donorEmail,
                  subject,
                  html,
                  text
                });
                const sentMsg = `[DIAG] Receipt email sent to ${donorEmail}`;
                console.log(sentMsg);
                logToFile(sentMsg);
              } catch (emailSendErr) {
                const errMsg = `[DIAG] Error sending receipt email: ${emailSendErr}`;
                console.error(errMsg);
                logToFile(errMsg);
              }
            }
            const doneMsg = `Donation completed: ${donation ? donation._id : 'unknown'}`;
            console.log(doneMsg);
            logToFile(doneMsg);
          } catch (err) {
            const errMsg = `[DIAG] Error in receipt email try block: ${err}`;
            console.error(errMsg);
            logToFile(errMsg);
          }
        }
      } catch (error) {
        const errMsg = `Error updating or creating donation: ${error}`;
        console.error(errMsg);
        logToFile(errMsg);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const failedPayment = event.data.object;
      try {
        const donation = await Donation.findOne({ 
          paymentIntentId: failedPayment.id 
        });
        if (donation) {
          donation.status = 'failed';
          await donation.save();
        }
      } catch (error) {
        console.error('Error updating failed donation:', error);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Get public donor wall
router.get('/donors', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donors = await Donation.find({ 
      status: 'completed',
      anonymous: { $ne: true }
    })
      .select('firstName lastName amount createdAt dedicationType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments({ 
      status: 'completed',
      anonymous: { $ne: true }
    });

    res.json({
      success: true,
      donors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get donation statistics (public)
router.get('/stats', async (req, res) => {
  try {
    const totalRaised = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }

  ]);

    const donationCount = await Donation.countDocuments({ status: 'completed' });

    const monthlyStats = await Donation.aggregate([
      {
        $match: { 
          status: 'completed',
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          }
        }
      },
      {
        $group: {
          _id: null,
          monthlyTotal: { $sum: '$amount' },
          monthlyCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalRaised: totalRaised[0]?.total || 0,
        donationCount,
        monthlyTotal: monthlyStats[0]?.monthlyTotal || 0,
        monthlyCount: monthlyStats[0]?.monthlyCount || 0
      }
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all donations (admin only)
router.get('/admin/all', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 25,
      status,
      startDate,
      endDate
    } = req.query;

    const filter = {};
    
    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(filter);

    res.json({
      success: true,
      donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin donations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get detailed donation analytics (admin only)
router.get('/admin/analytics', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Donation.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
