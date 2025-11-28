// Hybrid email system: Try SMTP first, fallback to SendGrid if SMTP fails
// This handles Render's SMTP port blocking by automatically using SendGrid API
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

console.log('[EMAIL] Initializing hybrid email system (SMTP + SendGrid fallback)');

// SMTP Configuration
console.log('[EMAIL] SMTP configuration:', {
  SMTP_HOST: process.env.SMTP_HOST || 'MISSING',
  SMTP_PORT: process.env.SMTP_PORT || 'MISSING',
  SMTP_USER: process.env.SMTP_USER || 'MISSING',
  SMTP_FROM: process.env.SMTP_FROM || 'MISSING',
  SMTP_PASS: process.env.SMTP_PASS ? '***configured***' : 'MISSING',
  SMTP_SECURE: process.env.SMTP_SECURE || 'not set (defaults to false)'
});

// SendGrid Configuration
const hasSendGrid = !!process.env.SENDGRID_API_KEY;
const useSendGridFirst = (process.env.USE_SENDGRID_FIRST === 'true');
console.log('[EMAIL] SendGrid configuration:', {
  SENDGRID_API_KEY: hasSendGrid ? '***configured***' : 'MISSING',
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'contact@haltshelter.org',
  status: hasSendGrid ? (useSendGridFirst ? '✅ Primary' : '✅ Fallback') : '⚠️  Not configured',
  USE_SENDGRID_FIRST: useSendGridFirst
});

if (hasSendGrid) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // Optional EU data residency: use EU API host when configured
  const apiHost = process.env.SENDGRID_API_HOST || (process.env.SENDGRID_DATA_RESIDENCY === 'EU' ? 'https://api.eu.sendgrid.com' : null);
  if (apiHost) {
    try {
      // Supported in @sendgrid/mail v8+: setClientOptions with host override
      sgMail.setClientOptions({ host: apiHost });
      console.log(`[EMAIL] SendGrid client set to host: ${apiHost}`);
    } catch (e) {
      console.warn('[EMAIL] Unable to set SendGrid API host. Proceeding with default.', e?.message || e);
    }
  }
}

// Check for missing SMTP variables
const missingVars = [];
if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
if (!process.env.SMTP_PORT) missingVars.push('SMTP_PORT');
if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS');

const smtpConfigured = missingVars.length === 0;

let transporter = null;
if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: (process.env.SMTP_SECURE === 'true'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10 * 1000, // Reduced to 10s to fail faster
    logger: false, // Disable verbose logging
    debug: false
  });

  // Don't verify at startup - it fails on Render and we have SendGrid fallback
  console.log('[EMAIL] ⚠️  SMTP verification skipped (will try at send time, fallback to SendGrid if needed)');
} else {
  console.error('[EMAIL] CRITICAL: Missing SMTP variables:', missingVars.join(', '));
  if (!hasSendGrid) {
    console.error('[EMAIL] CRITICAL: No SendGrid fallback configured either!');
  }
}


async function sendViaSendGrid({ to, subject, html, text }) {
  console.log(`[EMAIL-SENDGRID] Sending via SendGrid API to: ${to}`);
  
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || 'contact@haltshelter.org',
    subject,
    text,
    html
  };

  const response = await sgMail.send(msg);
  console.log('[EMAIL-SENDGRID] ✅ Email sent successfully via SendGrid:', {
    statusCode: response[0].statusCode
  });
  return response;
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

  // If SendGrid is preferred and available, send with SendGrid first
  if (hasSendGrid && useSendGridFirst) {
    console.log('[EMAIL] Using SendGrid first as configured...');
    try {
      return await sendViaSendGrid({ to, subject, html, text });
    } catch (sgErr) {
      console.error('[EMAIL] ❌ SendGrid primary send failed:', sgErr.message);
      // Fallback to SMTP if configured
      if (smtpConfigured && transporter) {
        console.log('[EMAIL] 🔄 Falling back to SMTP...');
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log('[EMAIL] ✅ Email sent successfully via SMTP after SendGrid failure:', {
            accepted: info.accepted,
            messageId: info.messageId
          });
          return info;
        } catch (smtpErr) {
          console.error('[EMAIL] ❌ SMTP fallback also failed:', smtpErr.message);
          throw smtpErr;
        }
      }
      throw sgErr;
    }
  }

  // Otherwise, try SMTP first if configured
  if (smtpConfigured && transporter) {
    console.log(`[EMAIL] Trying SMTP first (${process.env.SMTP_HOST}:${process.env.SMTP_PORT})...`);
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('[EMAIL] ✅ Email sent successfully via SMTP:', {
        accepted: info.accepted,
        messageId: info.messageId
      });
      return info;
    } catch (smtpErr) {
      console.error('[EMAIL] ❌ SMTP failed:', {
        message: smtpErr.message,
        code: smtpErr.code
      });
      
      // If SMTP fails and SendGrid is available, fallback
      if (hasSendGrid) {
        console.log('[EMAIL] 🔄 Falling back to SendGrid...');
        try {
          return await sendViaSendGrid({ to, subject, html, text });
        } catch (sendGridErr) {
          console.error('[EMAIL-SENDGRID] ❌ SendGrid fallback also failed:', sendGridErr.message);
          throw sendGridErr;
        }
      } else {
        console.error('[EMAIL] ❌ No SendGrid fallback available');
        throw smtpErr;
      }
    }
  }
  
  // If SMTP not configured, try SendGrid directly
  if (hasSendGrid) {
    console.log('[EMAIL] SMTP not configured, using SendGrid directly...');
    return await sendViaSendGrid({ to, subject, html, text });
  }
  
  // No email service configured
  const error = new Error('No email service configured (neither SMTP nor SendGrid)');
  console.error('[EMAIL] ❌', error.message);
  throw error;
}

module.exports = { sendReceiptEmail };