const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { NewsletterSubscriber } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { sendReceiptEmail } = require('../utils/email');
const { 
  newsletterConfirmationHtml, 
  newsletterConfirmationText, 
  newsletterWelcomeHtml, 
  newsletterWelcomeText,
  newsletterBroadcastHtml,
  newsletterBroadcastText
} = require('../utils/emailTemplates');

const router = express.Router();

/**
 * Generate newsletter confirmation email template
 * @param {string} email - Subscriber email
 * @param {string} token - Confirmation token
 * @param {string} firstName - Subscriber first name (optional)
 * @returns {Object} - { subject, html, text }
 */
const generateConfirmationEmail = (email, token, firstName = 'Supporter') => {
  return {
    subject: '✅ Confirm Your HALT Newsletter Subscription',
    html: newsletterConfirmationHtml(email, token, firstName),
    text: newsletterConfirmationText(email, token, firstName)
  };
};

/**
 * Send newsletter confirmation email
 * Integrates with the email utility for SMTP delivery
 */
const sendConfirmationEmail = async (email, token, firstName = 'Supporter') => {
  try {
    console.log(`\n[NEWSLETTER] ========== CONFIRMATION EMAIL FLOW ==========`);
    console.log(`[NEWSLETTER] 📧 Preparing confirmation email`);
    console.log(`[NEWSLETTER] Email: ${email}`);
    console.log(`[NEWSLETTER] Name: ${firstName}`);
    console.log(`[NEWSLETTER] Token: ${token.substring(0, 10)}...`);
    
    const emailTemplate = generateConfirmationEmail(email, token, firstName);
    console.log(`[NEWSLETTER] ✓ Email template generated`);
    console.log(`[NEWSLETTER] Subject: ${emailTemplate.subject}`);
    console.log(`[NEWSLETTER] HTML length: ${emailTemplate.html.length} chars`);
    
    console.log(`[NEWSLETTER] 📤 Calling email service...`);
    const result = await sendReceiptEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });
    
    console.log(`[NEWSLETTER] ✅ Confirmation email sent successfully`);
    console.log(`[NEWSLETTER] Message ID: ${result.messageId}`);
    console.log(`[NEWSLETTER] Accepted: ${result.accepted?.length} recipient(s)`);
    return result;
  } catch (error) {
    console.error(`[NEWSLETTER] ❌ Failed to send confirmation email:`, error.message);
    console.error(`[NEWSLETTER] Stack:`, error.stack);
    throw error;
  }
};

// Subscribe to newsletter with direct confirmation email
router.post('/subscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('gdprConsent').isBoolean().toBoolean().custom((value) => value === true).withMessage('GDPR consent is required'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim()
], async (req, res) => {
  try {
    console.log(`\n[NEWSLETTER] ========== SUBSCRIBE REQUEST ==========`);
    console.log(`[NEWSLETTER] [1/7] Received subscription request`);
    console.log(`[NEWSLETTER] Remote IP: ${req.ip}`);
    
    // Validate input
    console.log(`[NEWSLETTER] [2/7] Validating input...`);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn(`[NEWSLETTER] ❌ Validation failed:`, errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(`[NEWSLETTER] ✓ Input validation passed`);

    const { email, firstName, lastName, gdprConsent, preferences } = req.body;
    console.log(`[NEWSLETTER] Email: ${email}`);
    console.log(`[NEWSLETTER] Name: ${firstName || 'Not provided'} ${lastName || ''}`);
    console.log(`[NEWSLETTER] GDPR Consent: ${gdprConsent}`);
    console.log(`[NEWSLETTER] Preferences: ${JSON.stringify(preferences || {})}`);

    // Check if already subscribed and confirmed
    console.log(`[NEWSLETTER] [3/7] Checking existing subscription...`);
    let subscriber = await NewsletterSubscriber.findOne({ email });
    if (subscriber) {
      console.log(`[NEWSLETTER] Found existing subscriber (${subscriber._id})`);
      console.log(`[NEWSLETTER] Current status: ${subscriber.status}`);
      
      if (subscriber.status === 'confirmed') {
        console.warn(`[NEWSLETTER] ❌ Email already confirmed`);
        return res.status(409).json({ 
          error: 'Email already subscribed',
          message: 'This email is already confirmed for our newsletter'
        });
      }
      console.log(`[NEWSLETTER] Status is not confirmed, will update...`);
    } else {
      console.log(`[NEWSLETTER] ✓ No existing subscription found`);
    }

    // Generate confirmation token
    console.log(`[NEWSLETTER] [4/7] Generating confirmation token...`);
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    console.log(`[NEWSLETTER] Token generated: ${confirmationToken.substring(0, 10)}...`);
    console.log(`[NEWSLETTER] Token length: ${confirmationToken.length} chars`);
    
    if (subscriber) {
      // Update existing pending subscription
      console.log(`[NEWSLETTER] [5/7] Updating existing subscriber...`);
      subscriber.firstName = firstName || subscriber.firstName;
      subscriber.lastName = lastName || subscriber.lastName;
      subscriber.gdprConsent = gdprConsent;
      subscriber.consentDate = new Date();
      subscriber.consentIp = req.ip;
      subscriber.confirmationToken = confirmationToken;
      subscriber.status = 'pending';
      subscriber.preferences = preferences || subscriber.preferences;
      console.log(`[NEWSLETTER] Updated fields: firstName, lastName, gdprConsent, token, status=pending`);
    } else {
      // Create new subscription
      console.log(`[NEWSLETTER] [5/7] Creating new subscriber...`);
      subscriber = new NewsletterSubscriber({
        email,
        firstName: firstName || 'Supporter',
        lastName: lastName || '',
        gdprConsent,
        consentDate: new Date(),
        consentIp: req.ip,
        confirmationToken,
        status: 'pending',
        preferences: preferences || {}
      });
      console.log(`[NEWSLETTER] New subscriber created (status=pending)`);
    }

    console.log(`[NEWSLETTER] [6/7] Saving to database...`);
    await subscriber.save();
    console.log(`[NEWSLETTER] ✓ Subscriber saved (${subscriber._id})`);
    
    // Send confirmation email
    console.log(`[NEWSLETTER] [7/7] Sending confirmation email...`);
    try {
      await sendConfirmationEmail(email, confirmationToken, firstName || 'Supporter');
      console.log(`[NEWSLETTER] ✅ Newsletter subscription complete (CONFIRMED FLOW)`);
      
      res.status(201).json({
        success: true,
        message: `Confirmation email sent to ${email}. Please check your inbox and confirm your subscription.`,
        email
      });
    } catch (emailError) {
      // Even if email fails, the subscription is in the database
      console.error('[NEWSLETTER] ❌ Email send failed but subscriber saved:', emailError.message);
      console.error('[NEWSLETTER] Email Error Stack:', emailError.stack);
      res.status(201).json({
        success: true,
        message: `Subscription created but confirmation email could not be sent. Please try again or contact support.`,
        email,
        emailError: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }
  } catch (error) {
    console.error('[NEWSLETTER] ❌ Subscribe error:', error.message);
    console.error('[NEWSLETTER] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to process subscription. Please try again later.'
    });
  }
});

/**
 * Generate welcome email for confirmed subscribers
 * Sent after email confirmation
 */
const generateWelcomeEmail = (firstName = 'Supporter') => {
  return {
    subject: '🎉 Welcome to HALT Newsletter - Subscription Confirmed!',
    html: newsletterWelcomeHtml(firstName),
    text: newsletterWelcomeText(firstName)
  };
};

// Confirm email subscription
router.get('/confirm/:token', async (req, res) => {
  try {
    console.log(`\n[NEWSLETTER] ========== EMAIL CONFIRMATION FLOW ==========`);
    console.log(`[NEWSLETTER] [1/4] Received confirmation request`);
    console.log(`[NEWSLETTER] Token: ${req.params.token.substring(0, 10)}...`);
    
    console.log(`[NEWSLETTER] [2/4] Looking up subscriber by token...`);
    const subscriber = await NewsletterSubscriber.findOne({
      confirmationToken: req.params.token
    });

    if (!subscriber) {
      console.warn(`[NEWSLETTER] ❌ Token not found or expired`);
      return res.status(404).json({ error: 'Invalid confirmation link' });
    }

    console.log(`[NEWSLETTER] ✓ Subscriber found: ${subscriber.email}`);
    console.log(`[NEWSLETTER] Current status: ${subscriber.status}`);
    
    console.log(`[NEWSLETTER] [3/4] Updating status to confirmed...`);
    subscriber.status = 'confirmed';
    subscriber.confirmedAt = new Date();
    subscriber.confirmationToken = null;
    await subscriber.save();
    console.log(`[NEWSLETTER] ✓ Status updated to confirmed`);
    console.log(`[NEWSLETTER] Confirmed at: ${subscriber.confirmedAt.toISOString()}`);

    // Send welcome email after confirmation
    console.log(`[NEWSLETTER] [4/4] Sending welcome email...`);
    try {
      const welcomeTemplate = generateWelcomeEmail(subscriber.firstName || 'Supporter');
      console.log(`[NEWSLETTER] Email subject: ${welcomeTemplate.subject}`);
      
      await sendReceiptEmail({
        to: subscriber.email,
        subject: welcomeTemplate.subject,
        html: welcomeTemplate.html,
        text: welcomeTemplate.text
      });
      console.log(`[NEWSLETTER] ✅ Welcome email sent successfully`);
      console.log(`[NEWSLETTER] ✅ NEWSLETTER CONFIRMATION COMPLETE`);
    } catch (emailError) {
      console.error(`[NEWSLETTER] ⚠️  Welcome email failed for ${subscriber.email}:`, emailError.message);
      console.error(`[NEWSLETTER] Will continue confirmation (email failure non-critical)`);
      // Don't fail the confirmation if welcome email fails
    }

    // Redirect to success page
    console.log(`[NEWSLETTER] Redirecting to success page...`);
    res.redirect(`${process.env.REACT_APP_URL || 'https://haltshelter.onrender.com'}?newsletter=confirmed`);
  } catch (error) {
    console.error('[NEWSLETTER] ❌ Confirmation error:', error.message);
    console.error('[NEWSLETTER] Stack:', error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail(),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, reason } = req.body;

    const subscriber = await NewsletterSubscriber.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ error: 'Email not found' });
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    subscriber.unsubscribeReason = reason;
    await subscriber.save();

    res.json({
      success: true,
      message: 'Unsubscribed successfully'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manage preferences
router.post('/preferences', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, preferences } = req.body;

    const subscriber = await NewsletterSubscriber.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ error: 'Email not found' });
    }

    if (preferences) {
      subscriber.preferences = { ...subscriber.preferences, ...preferences };
    }
    await subscriber.save();

    res.json({
      success: true,
      message: 'Preferences updated',
      subscriber
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get subscriber by email
router.get('/subscriber/:email', async (req, res) => {
  try {
    const subscriber = await NewsletterSubscriber.findOne({ email: req.params.email })
      .select('status preferences subscribedAt confirmedAt gdprConsent');

    if (!subscriber) {
      return res.status(404).json({ error: 'Email not found' });
    }

    res.json({ success: true, subscriber });
  } catch (error) {
    console.error('Get subscriber error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get stats (admin)
router.get('/stats', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const totalPending = await NewsletterSubscriber.countDocuments({ status: 'pending' });
    const totalConfirmed = await NewsletterSubscriber.countDocuments({ status: 'confirmed' });
    const totalUnsubscribed = await NewsletterSubscriber.countDocuments({ status: 'unsubscribed' });
    const gdprConsented = await NewsletterSubscriber.countDocuments({ gdprConsent: true });

    res.json({
      success: true,
      stats: {
        pending: totalPending,
        confirmed: totalConfirmed,
        unsubscribed: totalUnsubscribed,
        gdprConsented
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all subscribers (admin)
router.get('/subscribers', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { page = 1, limit = 25, status, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const subscribers = await NewsletterSubscriber.find(filter)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await NewsletterSubscriber.countDocuments(filter);

    res.json({
      success: true,
      subscribers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a subscriber (admin)
router.delete('/subscribers/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);
    
    if (!subscriber) {
      return res.status(404).json({ 
        success: false, 
        error: 'Subscriber not found' 
      });
    }
    
    console.log(`[NEWSLETTER] Deleted subscriber: ${subscriber.email}`);
    
    res.json({ 
      success: true, 
      message: 'Subscriber deleted successfully',
      deletedEmail: subscriber.email
    });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send newsletter broadcast to all confirmed subscribers (admin)
router.post('/broadcast', authenticate, authorize('admin', 'staff'), [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
  try {
    console.log(`\n[NEWSLETTER] ========== BROADCAST REQUEST ==========`);
    
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, content, testEmail } = req.body;
    
    // If testEmail is provided, send only to that email (for testing)
    if (testEmail) {
      console.log(`[NEWSLETTER] 📧 Sending TEST broadcast to: ${testEmail}`);
      
      const testToken = crypto.randomBytes(32).toString('hex');
      const html = newsletterBroadcastHtml(subject, content, testToken);
      const text = newsletterBroadcastText(subject, content, testToken);
      
      await sendReceiptEmail({
        to: testEmail,
        subject: `[TEST] ${subject}`,
        html,
        text
      });
      
      return res.json({
        success: true,
        message: 'Test email sent successfully',
        testEmail,
        sentCount: 1
      });
    }

    // Get all confirmed subscribers
    const subscribers = await NewsletterSubscriber.find({ status: 'confirmed' });
    
    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No confirmed subscribers to send to'
      });
    }

    console.log(`[NEWSLETTER] 📬 Sending broadcast to ${subscribers.length} subscribers`);
    console.log(`[NEWSLETTER] Subject: ${subject}`);

    let sentCount = 0;
    let failedCount = 0;
    const failedEmails = [];

    // Send emails in batches to avoid rate limits
    for (const subscriber of subscribers) {
      try {
        // Use subscriber's unsubscribe token or generate one
        const unsubscribeToken = subscriber.unsubscribeToken || subscriber.confirmationToken || crypto.randomBytes(32).toString('hex');
        
        const html = newsletterBroadcastHtml(subject, content, unsubscribeToken);
        const text = newsletterBroadcastText(subject, content, unsubscribeToken);
        
        await sendReceiptEmail({
          to: subscriber.email,
          subject,
          html,
          text
        });
        
        sentCount++;
        console.log(`[NEWSLETTER] ✅ Sent to: ${subscriber.email}`);
        
        // Small delay to avoid rate limits (100ms between emails)
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (emailError) {
        failedCount++;
        failedEmails.push(subscriber.email);
        console.error(`[NEWSLETTER] ❌ Failed to send to ${subscriber.email}:`, emailError.message);
      }
    }

    console.log(`[NEWSLETTER] ========== BROADCAST COMPLETE ==========`);
    console.log(`[NEWSLETTER] Sent: ${sentCount}, Failed: ${failedCount}`);

    res.json({
      success: true,
      message: `Newsletter sent to ${sentCount} subscribers`,
      sentCount,
      failedCount,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
      totalSubscribers: subscribers.length
    });

  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
});

module.exports = router;
