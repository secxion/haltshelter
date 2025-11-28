// Note: In production (Render), environment variables are injected directly.
// In development, they're loaded from .env by server/app.js
const nodemailer = require('nodemailer');

console.log('[EMAIL] Initializing SMTP configuration:', {
  SMTP_HOST: process.env.SMTP_HOST || 'MISSING',
  SMTP_PORT: process.env.SMTP_PORT || 'MISSING',
  SMTP_USER: process.env.SMTP_USER || 'MISSING',
  SMTP_FROM: process.env.SMTP_FROM || 'MISSING',
  SMTP_PASS: process.env.SMTP_PASS ? '***configured***' : 'MISSING',
  SMTP_SECURE: process.env.SMTP_SECURE || 'not set (defaults to false)'
});

// Check for missing required variables
const missingVars = [];
if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
if (!process.env.SMTP_PORT) missingVars.push('SMTP_PORT');
if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS');

if (missingVars.length > 0) {
  console.error('[EMAIL] CRITICAL: Missing required SMTP environment variables:', missingVars.join(', '));
  console.error('[EMAIL] Email functionality will NOT work until these are configured!');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: (process.env.SMTP_SECURE === 'true'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // explicit tls options to be more compatible with some providers
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 30 * 1000,
  logger: true, // Enable nodemailer logging
  debug: false // Set to true for verbose SMTP logs
});

// Verify transporter at startup to fail fast and log useful info
if (missingVars.length === 0) {
  transporter.verify().then(() => {
    console.log('[EMAIL] ✅ SMTP transporter verified — ready to send messages');
  }).catch((err) => {
    console.error('[EMAIL] ❌ SMTP transporter verification failed:', err && err.message ? err.message : err);
    console.error('[EMAIL] Full error:', err);
  });
} else {
  console.error('[EMAIL] ⚠️  Skipping SMTP verification due to missing configuration');
}

async function sendReceiptEmail({ to, subject, html, text }) {
  console.log(`[EMAIL] Attempting to send email to: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  };

  console.log(`[EMAIL] From address: ${mailOptions.from}`);

  // Try a couple times for transient SMTP errors (e.g. 'Greeting never received')
  const maxAttempts = 2;
  let attempt = 0;
  let lastErr = null;

  while (attempt < maxAttempts) {
    attempt += 1;
    console.log(`[EMAIL] Send attempt ${attempt}/${maxAttempts}...`);
    try {
      const info = await transporter.sendMail(mailOptions);
      // Log accepted/rejected responses for troubleshooting
      console.log('[EMAIL] ✅ sendMail SUCCESS:', {
        attempt,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
        messageId: info.messageId
      });
      return info;
    } catch (err) {
      lastErr = err;
      console.error(`[EMAIL] ❌ sendMail attempt ${attempt} failed:`, {
        message: err && err.message ? err.message : 'Unknown error',
        code: err.code,
        command: err.command,
        responseCode: err.responseCode,
        response: err.response
      });
      console.error('[EMAIL] Full error object:', err);
      // small delay before retry
      if (attempt < maxAttempts) {
        console.log(`[EMAIL] Waiting 800ms before retry...`);
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }

  // after attempts
  console.error('[EMAIL] ❌ All send attempts failed. Throwing error.');
  throw lastErr;
}

module.exports = { sendReceiptEmail };