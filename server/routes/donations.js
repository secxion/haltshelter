const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Donation } = require('../models');
const { authenticate, authorize,  } = require('../middleware/auth');
const { logToFile } = require('../utils/fileLogger');

const router = express.Router();

// Get count of completed donations (admin/staff only)
router.get('/count', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const count = await Donation.countDocuments({ paymentStatus: 'completed' });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

// NOTE: Webhook handler moved to separate file (donations-webhook.js) and mounted
// directly in app.js before JSON parser to preserve raw body for signature verification

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
