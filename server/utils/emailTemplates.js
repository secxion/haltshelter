/**
 * Centralized Email Templates for HALT Shelter
 * Clean, modern design with consistent branding
 */

// Base email wrapper with HALT branding
function emailWrapper(content, { preheader = '' } = {}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HALT Shelter</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0px;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #dc2626; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🐾 HALT Shelter</h1>
      <p style="color: #fecaca; margin: 8px 0 0 0; font-size: 14px;">Help Animals Live & Thrive</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px 24px; background-color: #f9fafb;">
      ${content}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #111827; color: #9ca3af; padding: 24px; text-align: center; font-size: 12px;">
      <p style="margin: 0 0 8px 0;"><strong style="color: #ffffff;">HALT Shelter</strong></p>
      <p style="margin: 0 0 8px 0;">EIN: 41-2531054 | Tax-deductible donations</p>
      <p style="margin: 0;">
        <a href="https://haltshelter.org" style="color: #dc2626; text-decoration: none;">haltshelter.org</a>
        &nbsp;|&nbsp;
        <a href="mailto:contact@haltshelter.org" style="color: #dc2626; text-decoration: none;">contact@haltshelter.org</a>
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}

// Donation Receipt Email
function donationReceiptHtml({ donorName, amount, currency, donationType, isEmergency, transactionId, timestamp }) {
  const dateStr = timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const donationTypeLabel = isEmergency 
    ? '🚨 Emergency Donation' 
    : donationType === 'monthly' 
      ? '💝 Monthly Donation' 
      : '💚 One-Time Donation';

  const content = `
    <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 24px;">Thank You for Your Generous Donation!</h2>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Dear <strong>${donorName}</strong>,
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Your donation of <strong style="color: #059669; font-size: 20px;">$${amount.toFixed(2)} ${currency}</strong> 
      has been received and will directly help animals in need.
    </p>
    
    <!-- Donation Details Card -->
    <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 0 0 24px 0; border-left: 4px solid #dc2626;">
      <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 16px;">${donationTypeLabel}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right;">$${amount.toFixed(2)} ${currency}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Transaction ID:</td>
          <td style="padding: 8px 0; color: #111827; font-size: 12px; text-align: right; font-family: monospace;">${transactionId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tax Deductible:</td>
          <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">✓ Yes</td>
        </tr>
      </table>
    </div>
    
    ${isEmergency ? `
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
      <p style="color: #991b1b; margin: 0; font-size: 14px;">
        <strong>🚨 Emergency Fund:</strong> Your donation will be used immediately for critical cases requiring urgent medical attention.
      </p>
    </div>
    ` : ''}
    
    ${donationType === 'monthly' ? `
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
      <p style="color: #1e40af; margin: 0; font-size: 14px;">
        <strong>🏆 Monthly Supporter:</strong> Your recurring donation will automatically process each month. You can manage your subscription anytime.
      </p>
    </div>
    ` : ''}
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
      <strong>How Your Donation Helps:</strong>
    </p>
    <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
      <li>🏥 Emergency veterinary care and surgeries</li>
      <li>🍲 Daily food, shelter, and rehabilitation</li>
      <li>🏠 Finding forever homes for rescued animals</li>
      <li>💊 Medications and ongoing medical treatments</li>
    </ul>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
      With gratitude,<br/>
      <strong>The HALT Team</strong>
    </p>
  `;

  return emailWrapper(content, { preheader: `Thank you for your $${amount.toFixed(2)} donation to HALT Shelter!` });
}

function donationReceiptText({ donorName, amount, currency, donationType, isEmergency, transactionId, timestamp }) {
  const dateStr = timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const typeLabel = isEmergency ? 'Emergency Donation' : donationType === 'monthly' ? 'Monthly Donation' : 'One-Time Donation';
  
  return `
HALT SHELTER - Thank You for Your Donation!

Dear ${donorName},

Your donation of $${amount.toFixed(2)} ${currency} has been received and will directly help animals in need.

DONATION DETAILS
================
Type: ${typeLabel}
Amount: $${amount.toFixed(2)} ${currency}
Date: ${dateStr}
Transaction ID: ${transactionId}
Tax Deductible: Yes (EIN: 41-2531054)

HOW YOUR DONATION HELPS
=======================
- Emergency veterinary care and surgeries
- Daily food, shelter, and rehabilitation
- Finding forever homes for rescued animals
- Medications and ongoing medical treatments

With gratitude,
The HALT Team

---
HALT Shelter | haltshelter.org | contact@haltshelter.org
  `.trim();
}

// Newsletter Confirmation Email
function newsletterConfirmationHtml(email, token, firstName = 'Supporter') {
  const rawBaseUrl = process.env.FRONTEND_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  const confirmationUrl = `${baseUrl}/api/newsletter/confirm/${token}`;

  const content = `
    <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 24px;">Confirm Your Newsletter Subscription</h2>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Hello <strong>${firstName}</strong>,
    </p>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Thank you for joining our newsletter! We're excited to have you as part of the HALT community. 
      You'll be among the first to hear about animal rescues, success stories, and opportunities to make a difference.
    </p>
    
    <!-- Confirmation Card -->
    <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; margin: 0 0 24px 0; border-left: 4px solid #dc2626; text-align: center;">
      <p style="color: #374151; font-size: 14px; margin: 0 0 20px 0;">
        Click the button below to confirm your email address:
      </p>
      <a href="${confirmationUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        ✅ Confirm Subscription
      </a>
      <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0;">
        Or copy this link: <code style="color: #6b7280; word-break: break-all;">${confirmationUrl}</code>
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
      This link will expire in 30 days. If you didn't sign up for this newsletter, you can safely ignore this email.
    </p>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
      With gratitude,<br/>
      <strong>The HALT Team</strong>
    </p>
  `;

  return emailWrapper(content, { preheader: 'Please confirm your HALT newsletter subscription' });
}

function newsletterConfirmationText(email, token, firstName = 'Supporter') {
  const rawBaseUrl = process.env.FRONTEND_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000';
  const baseUrl = rawBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  const confirmationUrl = `${baseUrl}/api/newsletter/confirm/${token}`;

  return `
HALT SHELTER - Confirm Your Newsletter Subscription

Hello ${firstName},

Thank you for joining our newsletter! We're excited to have you as part of the HALT community.

CONFIRM YOUR SUBSCRIPTION
=========================
Click the link below to confirm your email address:

${confirmationUrl}

This link will expire in 30 days.

If you didn't sign up for this newsletter, you can safely ignore this email.

With gratitude,
The HALT Team

---
HALT Shelter | haltshelter.org | contact@haltshelter.org
  `.trim();
}

// Newsletter Welcome Email (after confirmation)
function newsletterWelcomeHtml(firstName = 'Supporter') {
  const content = `
    <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 24px;">🎉 Welcome to the HALT Family!</h2>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Hello <strong>${firstName}</strong>,
    </p>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Your subscription is confirmed! You're now officially part of the HALT community. Thank you for supporting our mission to help animals live and thrive.
    </p>
    
    <!-- What to Expect Card -->
    <div style="background-color: #ffffff; border-radius: 8px; padding: 24px; margin: 0 0 24px 0; border-left: 4px solid #dc2626;">
      <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 16px;">📬 What You'll Receive:</h3>
      <ul style="color: #4b5563; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
        <li>🐾 <strong>Animal Rescues</strong> - Stories of animals we've helped</li>
        <li>📖 <strong>Success Stories</strong> - Heartwarming tales of recovery & adoption</li>
        <li>🚨 <strong>Urgent Updates</strong> - Critical situations where help is needed</li>
        <li>💝 <strong>Special Opportunities</strong> - Sponsorships, volunteering & events</li>
        <li>🎯 <strong>Mission Updates</strong> - How your support makes a difference</li>
      </ul>
    </div>
    
    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
      <p style="color: #92400e; margin: 0; font-size: 14px;">
        <strong>💡 Tip:</strong> Add <a href="mailto:contact@haltshelter.org" style="color: #dc2626;">contact@haltshelter.org</a> to your contacts to ensure our emails reach your inbox!
      </p>
    </div>
    
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">
      Thank you for being a part of our mission!<br/>
      <strong>The HALT Team</strong>
    </p>
  `;

  return emailWrapper(content, { preheader: 'Your HALT newsletter subscription is confirmed!' });
}

function newsletterWelcomeText(firstName = 'Supporter') {
  return `
HALT SHELTER - Welcome to the HALT Family!

Hello ${firstName},

🎉 Your subscription is confirmed! You're now officially part of the HALT community.

WHAT YOU'LL RECEIVE
===================
- 🐾 Animal Rescues - Stories of animals we've helped
- 📖 Success Stories - Heartwarming tales of recovery & adoption
- 🚨 Urgent Updates - Critical situations where help is needed
- 💝 Special Opportunities - Sponsorships, volunteering & events
- 🎯 Mission Updates - How your support makes a difference

TIP: Add contact@haltshelter.org to your contacts to ensure our emails reach your inbox!

Thank you for being a part of our mission!
The HALT Team

---
HALT Shelter | haltshelter.org | contact@haltshelter.org
  `.trim();
}

// Newsletter Broadcast Email (for sending newsletters to subscribers)
function newsletterBroadcastHtml(subject, content, unsubscribeToken) {
  const baseUrl = (process.env.FRONTEND_URL || 'https://haltshelter.org').replace(/\/+$/, '');
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;
  
  const htmlContent = `
    <h2 style="color: #111827; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">
      ${subject}
    </h2>
    
    <div style="color: #374151; font-size: 15px; line-height: 1.8; margin: 0 0 24px 0;">
      ${content}
    </div>
    
    <!-- Call to Action -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${baseUrl}/donate" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        ❤️ Support Our Mission
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
      You're receiving this because you subscribed to the HALT newsletter.<br/>
      <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: underline;">Unsubscribe</a> from future emails.
    </p>
  `;

  return emailWrapper(htmlContent, { preheader: subject });
}

function newsletterBroadcastText(subject, content, unsubscribeToken) {
  const baseUrl = (process.env.FRONTEND_URL || 'https://haltshelter.org').replace(/\/+$/, '');
  const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;
  
  // Strip HTML tags from content for plain text version
  const plainContent = content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
  
  return `
${subject}
${'='.repeat(subject.length)}

${plainContent}

---
Support Our Mission: ${baseUrl}/donate

---
HALT Shelter | haltshelter.org | contact@haltshelter.org
You're receiving this because you subscribed to the HALT newsletter.
Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

module.exports = {
  emailWrapper,
  donationReceiptHtml,
  donationReceiptText,
  newsletterConfirmationHtml,
  newsletterConfirmationText,
  newsletterWelcomeHtml,
  newsletterWelcomeText,
  newsletterBroadcastHtml,
  newsletterBroadcastText
};
