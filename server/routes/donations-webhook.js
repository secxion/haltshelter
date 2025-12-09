const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Donation } = require('../models');
const { sendReceiptEmail } = require('../utils/email');
const { logToFile } = require('../utils/fileLogger');

/**
 * Fresh Stripe Webhook Handler for Donations
 * Handles payment_intent.succeeded events and sends receipt emails via SendGrid
 */
module.exports = async function donationsWebhookHandler(req, res) {
  const timestamp = new Date().toISOString();
  
  // ===== WEBHOOK ENTRY LOGGING =====
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[WEBHOOK] ENTRY AT ${timestamp}`);
  console.log(`${'='.repeat(80)}`);
  console.log('[WEBHOOK] Request Details:');
  console.log(`  • Method: ${req.method}`);
  console.log(`  • URL: ${req.url}`);
  console.log(`  • Content-Type: ${req.headers['content-type']}`);
  console.log(`  • Body Length: ${req.body?.length || 0} bytes`);
  console.log(`  • Stripe-Signature Present: ${!!req.headers['stripe-signature']}`);
  console.log(`  • Webhook Secret Configured: ${!!process.env.STRIPE_WEBHOOK_SECRET}`);
  
  logToFile(`[WEBHOOK-ENTRY] ${timestamp} - Webhook handler invoked`);

  // ===== VERIFY SIGNATURE =====
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    console.error('[WEBHOOK] ❌ ERROR: Missing stripe-signature header');
    logToFile('[WEBHOOK-ERROR] Missing stripe-signature header');
    return res.status(400).json({ 
      error: 'Missing stripe-signature header',
      received: false 
    });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[WEBHOOK] ❌ ERROR: STRIPE_WEBHOOK_SECRET not configured in environment');
    logToFile('[WEBHOOK-ERROR] STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ 
      error: 'Webhook secret not configured',
      received: false 
    });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(`[WEBHOOK] ✅ Signature verified successfully`);
  } catch (err) {
    console.error('[WEBHOOK] ❌ Signature verification failed:');
    console.error(`  • Error: ${err.message}`);
    console.error(`  • Type: ${err.type}`);
    logToFile(`[WEBHOOK-ERROR] Signature verification failed: ${err.message}`);
    return res.status(400).json({ 
      error: `Webhook error: ${err.message}`,
      received: false 
    });
  }

  // ===== LOG EVENT DETAILS =====
  console.log(`[WEBHOOK] ✅ Event received`);
  console.log(`  • Event ID: ${event.id}`);
  console.log(`  • Event Type: ${event.type}`);
  console.log(`  • Created: ${new Date(event.created * 1000).toISOString()}`);
  logToFile(`[WEBHOOK-EVENT] id=${event.id} type=${event.type} created=${event.created}`);

  // ===== ROUTE EVENT =====
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event, res);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event, res);
      break;

    case 'charge.refunded':
      console.log(`[WEBHOOK] 💬 Refund event received (no action taken)`, event.data.object.id);
      res.json({ received: true });
      break;

    default:
      console.log(`[WEBHOOK] ⚠️  Unhandled event type: ${event.type}`);
      logToFile(`[WEBHOOK-UNHANDLED] Event type: ${event.type}`);
      res.json({ received: true });
  }
};

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(event, res) {
  const paymentIntent = event.data.object;
  
  console.log(`\n[PAYMENT-SUCCESS] Processing payment_intent.succeeded`);
  console.log(`  • Payment Intent ID: ${paymentIntent.id}`);
  console.log(`  • Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`);
  console.log(`  • Status: ${paymentIntent.status}`);
  console.log(`  • Client: ${paymentIntent.customer || 'N/A'}`);
  
  logToFile(`[PAYMENT-SUCCESS] Payment intent=${paymentIntent.id} amount=${paymentIntent.amount / 100}`);

  try {
    // ===== EXTRACT DONOR INFO =====
    const metadata = paymentIntent.metadata || {};
    let donorName = metadata.donor_name || metadata.donorName || 'Supporter';
    let donorEmail = metadata.donor_email || metadata.donorEmail || paymentIntent.receipt_email;
    const donationType = metadata.donation_type || metadata.donationType || 'one-time';
    const amount = paymentIntent.amount / 100;
    const currency = paymentIntent.currency.toUpperCase();
    const transactionId = paymentIntent.id;

    console.log(`\n[DONOR-INFO] Extracted from payment intent:`);
    console.log(`  • Name: ${donorName}`);
    console.log(`  • Email: ${donorEmail}`);
    console.log(`  • Donation Type: ${donationType}`);
    console.log(`  • Amount: $${amount} ${currency}`);

    // Fallback: retrieve customer email if missing
    if ((!donorEmail || donorEmail === 'null' || donorEmail === 'undefined') && paymentIntent.customer) {
      console.log(`[DONOR-INFO] Email missing, fetching from Stripe customer...`);
      try {
        const customer = await stripe.customers.retrieve(paymentIntent.customer);
        if (customer?.email) {
          donorEmail = customer.email;
          if (customer.name) donorName = customer.name;
          console.log(`[DONOR-INFO] ✅ Retrieved from Stripe: ${donorEmail}`);
          logToFile(`[DONOR-FETCH] Retrieved customer email: ${donorEmail}`);
        }
      } catch (custErr) {
        console.warn(`[DONOR-INFO] ⚠️  Could not fetch customer:`, custErr.message);
        logToFile(`[DONOR-FETCH-ERROR] ${custErr.message}`);
      }
    }

    // Validate email
    if (!donorEmail || !donorEmail.includes('@')) {
      console.error(`[PAYMENT-SUCCESS] ❌ Invalid or missing donor email: ${donorEmail}`);
      logToFile(`[DONATION-ERROR] Invalid donor email: ${donorEmail}`);
      return res.status(400).json({ 
        error: 'Cannot process: no valid donor email',
        received: false 
      });
    }

    // ===== CHECK FOR DUPLICATE =====
    console.log(`\n[DEDUP] Checking for existing donation...`);
    let existingDonation = await Donation.findOne({ transactionId });
    
    if (existingDonation) {
      console.log(`[DEDUP] ⚠️  Donation already exists: ${existingDonation._id}`);
      logToFile(`[DEDUP] Found existing donation: ${existingDonation._id}`);
      
      if (existingDonation.receiptSent) {
        console.log(`[DEDUP] ✅ Receipt already sent, skipping...`);
        logToFile(`[DEDUP] Receipt already sent, skipping email`);
        return res.json({ received: true, status: 'duplicate_processed' });
      }
      
      console.log(`[DEDUP] 📧 Receipt not sent yet, will proceed to send...`);
      logToFile(`[DEDUP] Receipt pending, will send email`);
    } else {
      console.log(`[DEDUP] ✅ No duplicate found, creating new donation...`);
    }

    // ===== CREATE OR UPDATE DONATION =====
    console.log(`\n[DONATION] Creating/updating donation record...`);
    
    let donation = existingDonation || new Donation({
      donorInfo: { name: donorName, email: donorEmail },
      amount,
      currency,
      donationType,
      paymentMethod: 'stripe',
      paymentStatus: 'completed',
      transactionId,
      stripeCustomerId: paymentIntent.customer || undefined,
      source: 'website',
      isRecurring: donationType !== 'one-time',
      completedAt: new Date()
    });

    try {
      await donation.save();
      console.log(`[DONATION] ✅ Saved successfully: ${donation._id}`);
      logToFile(`[DONATION-SAVED] id=${donation._id} email=${donorEmail}`);
    } catch (saveErr) {
      if (saveErr.code === 11000) {
        console.log(`[DONATION] ℹ️  Duplicate key (concurrent webhook), refetching...`);
        donation = await Donation.findOne({ transactionId });
      } else {
        throw saveErr;
      }
    }

    // ===== SEND RECEIPT EMAIL =====
    console.log(`\n[EMAIL] Preparing receipt email...`);
    
    const emailSubject = 'Thank you for your donation to HALT!';
    const emailHtml = generateEmailHtml({
      donorName,
      donorEmail,
      amount,
      currency,
      donationType,
      transactionId,
      timestamp: new Date(paymentIntent.created * 1000)
    });

    const emailText = generateEmailText({
      donorName,
      donorEmail,
      amount,
      currency,
      donationType,
      transactionId,
      timestamp: new Date(paymentIntent.created * 1000)
    });

    try {
      console.log(`[EMAIL] 📧 Sending to ${donorEmail}...`);
      const emailResult = await sendReceiptEmail({
        to: donorEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText
      });

      console.log(`[EMAIL] ✅ Email sent successfully`);
      console.log(`  • Response Status: ${emailResult[0]?.statusCode || 'unknown'}`);
      console.log(`  • Message ID: ${emailResult[0]?.headers?.['x-message-id'] || 'N/A'}`);
      logToFile(`[EMAIL-SENT] to=${donorEmail} statusCode=${emailResult[0]?.statusCode}`);

      // Mark receipt as sent
      donation.receiptSent = true;
      donation.receiptSentAt = new Date();
      await donation.save();
      
      console.log(`[EMAIL] 💾 Donation record updated with receiptSent=true`);
      logToFile(`[EMAIL-MARKED] Donation updated: receiptSent=true receiptSentAt=${donation.receiptSentAt}`);

      console.log(`\n[PAYMENT-SUCCESS] ✅ COMPLETE - Donation ${donation._id} processed and email sent`);
      logToFile(`[PAYMENT-SUCCESS-COMPLETE] donation=${donation._id}`);
      
      return res.json({ received: true, status: 'success', donationId: donation._id });
    } catch (emailErr) {
      console.error(`[EMAIL] ❌ Failed to send receipt email`);
      console.error(`  • Error: ${emailErr.message}`);
      console.error(`  • Code: ${emailErr.code}`);
      if (emailErr.response?.body) {
        console.error(`  • Details: ${JSON.stringify(emailErr.response.body)}`);
      }
      logToFile(`[EMAIL-ERROR] Failed: ${emailErr.message} code=${emailErr.code}`);

      // Still consider the webhook successful since donation was saved
      // Email can be retried manually
      return res.json({ 
        received: true, 
        status: 'saved_but_email_failed',
        donationId: donation._id,
        emailError: emailErr.message
      });
    }
  } catch (error) {
    console.error(`\n[PAYMENT-SUCCESS] ❌ Unexpected error:`);
    console.error(`  • ${error.message}`);
    console.error(`  • Stack: ${error.stack?.split('\n').slice(0, 3).join('\n')}`);
    logToFile(`[PAYMENT-SUCCESS-ERROR] ${error.message}`);
    
    return res.status(500).json({ 
      error: error.message,
      received: false 
    });
  }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(event, res) {
  const paymentIntent = event.data.object;
  
  console.log(`\n[PAYMENT-FAILED] Processing payment_intent.payment_failed`);
  console.log(`  • Payment Intent ID: ${paymentIntent.id}`);
  console.log(`  • Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
  console.log(`  • Reason: ${paymentIntent.last_payment_error?.message || 'Unknown'}`);
  
  logToFile(`[PAYMENT-FAILED] intent=${paymentIntent.id} reason=${paymentIntent.last_payment_error?.message}`);

  try {
    const donation = await Donation.findOne({ transactionId: paymentIntent.id });
    if (donation) {
      donation.paymentStatus = 'failed';
      donation.failureReason = paymentIntent.last_payment_error?.message;
      await donation.save();
      console.log(`[PAYMENT-FAILED] ✅ Donation updated: ${donation._id}`);
    }
  } catch (error) {
    console.error(`[PAYMENT-FAILED] Error updating donation:`, error.message);
    logToFile(`[PAYMENT-FAILED-ERROR] ${error.message}`);
  }

  res.json({ received: true });
}

/**
 * Generate HTML email content
 */
function generateEmailHtml({
  donorName,
  donorEmail,
  amount,
  currency,
  donationType,
  transactionId,
  timestamp
}) {
  const dateStr = timestamp.toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table td { padding: 10px; border-bottom: 1px solid #eee; }
    .details-table td:first-child { font-weight: bold; width: 150px; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Thank You for Your Donation!</h1>
    </div>
    <div class="content">
      <p>Dear ${donorName},</p>
      
      <p>Thank you for your generous donation to HALT. Your support helps us continue our mission to provide shelter, care, and rescue for animals in need.</p>
      
      <h3 style="color: #667eea;">Donation Details</h3>
      <table class="details-table">
        <tr>
          <td>Donor Name:</td>
          <td>${donorName}</td>
        </tr>
        <tr>
          <td>Email:</td>
          <td>${donorEmail}</td>
        </tr>
        <tr>
          <td>Amount:</td>
          <td>$${amount.toFixed(2)} ${currency}</td>
        </tr>
        <tr>
          <td>Donation Type:</td>
          <td>${donationType.charAt(0).toUpperCase() + donationType.slice(1)}</td>
        </tr>
        <tr>
          <td>Transaction ID:</td>
          <td>${transactionId}</td>
        </tr>
        <tr>
          <td>Date (UTC):</td>
          <td>${dateStr}</td>
        </tr>
      </table>
      
      <p>Your donation is 100% secure and has been processed through Stripe. A copy of this receipt has been saved for your records.</p>
      
      <p><strong>How Your Donation Helps:</strong><br/>
      Every dollar you contribute goes directly to animal rescue, medical care, and sanctuary operations. Whether it's emergency veterinary care, food and shelter, or rehabilitation programs, your support makes a real difference in the lives of animals.</p>
      
      <div class="footer">
        <p style="margin: 0;">With gratitude,<br/><strong>The HALT Team</strong></p>
        <p style="margin: 10px 0 0 0;">HALT - Animal Rescue & Sanctuary<br/>
        <a href="https://haltshelter.onrender.com">haltshelter.onrender.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email content
 */
function generateEmailText({
  donorName,
  donorEmail,
  amount,
  currency,
  donationType,
  transactionId,
  timestamp
}) {
  const dateStr = timestamp.toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
Thank You for Your Donation to HALT!

Dear ${donorName},

Thank you for your generous donation to HALT. Your support helps us continue our mission to provide shelter, care, and rescue for animals in need.

DONATION DETAILS
================
Donor Name:   ${donorName}
Email:        ${donorEmail}
Amount:       $${amount.toFixed(2)} ${currency}
Donation Type: ${donationType.charAt(0).toUpperCase() + donationType.slice(1)}
Transaction ID: ${transactionId}
Date (UTC):   ${dateStr}

Your donation is 100% secure and has been processed. A copy of this receipt has been saved for your records.

HOW YOUR DONATION HELPS
=======================
Every dollar you contribute goes directly to animal rescue, medical care, and sanctuary operations. Whether it's emergency veterinary care, food and shelter, or rehabilitation programs, your support makes a real difference in the lives of animals.

With gratitude,
The HALT Team

HALT - Animal Rescue & Sanctuary
https://haltshelter.onrender.com
  `.trim();
}
