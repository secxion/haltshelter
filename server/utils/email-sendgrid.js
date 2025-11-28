// SendGrid email utility - Alternative to SMTP for cloud hosting platforms
// SendGrid works reliably on Render and other cloud platforms that block SMTP ports
// Free tier: 100 emails/day - perfect for donation receipts

const sgMail = require('@sendgrid/mail');

console.log('[EMAIL-SENDGRID] Initializing SendGrid configuration');

// Check for SendGrid API key
if (!process.env.SENDGRID_API_KEY) {
  console.error('[EMAIL-SENDGRID] CRITICAL: Missing SENDGRID_API_KEY environment variable');
  console.error('[EMAIL-SENDGRID] Email functionality will NOT work until this is configured!');
} else {
  console.log('[EMAIL-SENDGRID] ✅ SendGrid API key configured');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

if (!process.env.SENDGRID_FROM_EMAIL) {
  console.warn('[EMAIL-SENDGRID] WARNING: SENDGRID_FROM_EMAIL not set, will use contact@haltshelter.org as default');
}

async function sendReceiptEmail({ to, subject, html, text }) {
  console.log(`[EMAIL-SENDGRID] Attempting to send email to: ${to}`);
  console.log(`[EMAIL-SENDGRID] Subject: ${subject}`);

  if (!process.env.SENDGRID_API_KEY) {
    const error = new Error('SendGrid API key not configured');
    console.error('[EMAIL-SENDGRID] ❌ Cannot send email - API key missing');
    throw error;
  }

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'contact@haltshelter.org',
    subject,
    text,
    html
  };

  console.log(`[EMAIL-SENDGRID] From address: ${msg.from}`);

  // Try a couple times for transient API errors
  const maxAttempts = 2;
  let attempt = 0;
  let lastErr = null;

  while (attempt < maxAttempts) {
    attempt += 1;
    console.log(`[EMAIL-SENDGRID] Send attempt ${attempt}/${maxAttempts}...`);
    try {
      const response = await sgMail.send(msg);
      console.log('[EMAIL-SENDGRID] ✅ Email sent successfully:', {
        attempt,
        statusCode: response[0].statusCode,
        headers: response[0].headers
      });
      return response;
    } catch (err) {
      lastErr = err;
      console.error(`[EMAIL-SENDGRID] ❌ Send attempt ${attempt} failed:`, {
        message: err && err.message ? err.message : 'Unknown error',
        code: err.code,
        statusCode: err.response?.statusCode,
        body: err.response?.body
      });
      console.error('[EMAIL-SENDGRID] Full error object:', err);
      
      // small delay before retry
      if (attempt < maxAttempts) {
        console.log(`[EMAIL-SENDGRID] Waiting 800ms before retry...`);
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }

  // after attempts
  console.error('[EMAIL-SENDGRID] ❌ All send attempts failed. Throwing error.');
  throw lastErr;
}

module.exports = { sendReceiptEmail };
