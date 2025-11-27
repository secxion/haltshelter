require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const nodemailer = require('nodemailer');

console.log('EMAIL CONFIG (SMTP ONLY):', {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
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
  connectionTimeout: 30 * 1000
});

// Verify transporter at startup to fail fast and log useful info
transporter.verify().then(() => {
  console.log('[EMAIL] SMTP transporter verified — ready to send messages');
}).catch((err) => {
  console.error('[EMAIL] SMTP transporter verification failed:', err && err.message ? err.message : err);
});

async function sendReceiptEmail({ to, subject, html, text }) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  };

  // Try a couple times for transient SMTP errors (e.g. 'Greeting never received')
  const maxAttempts = 2;
  let attempt = 0;
  let lastErr = null;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const info = await transporter.sendMail(mailOptions);
      // Log accepted/rejected responses for troubleshooting
      console.log('[EMAIL] sendMail result:', {
        attempt,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response
      });
      return info;
    } catch (err) {
      lastErr = err;
      console.error(`[EMAIL] sendMail attempt ${attempt} failed:`, err && err.message ? err.message : err);
      // small delay before retry
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  // after attempts
  throw lastErr;
}

module.exports = { sendReceiptEmail };