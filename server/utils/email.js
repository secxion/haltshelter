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
const useSendGridFirst = true;

console.log('[EMAIL] SendGrid configuration:', {
  SENDGRID_API_KEY: hasSendGrid ? '***configured***' : 'MISSING',
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'contact@haltshelter.org',
  status: hasSendGrid ? '✅ SendGrid ENABLED' : '⚠️  Not configured',
  USE_SENDGRID_FIRST: useSendGridFirst ? 'ENABLED - SendGrid is primary' : 'DISABLED - SMTP is primary'
});

if (hasSendGrid) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  if (process.env.SENDGRID_DATA_RESIDENCY === 'EU' || process.env.SENDGRID_API_HOST) {
    console.log('[EMAIL] EU data residency requested but client host override not available in this version');
    console.log('[EMAIL] Ensure you are using an EU-pinned subuser in SendGrid if EU compliance required');
  }
}

// Check for missing SMTP variables
const missingVars = [];
if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
if (!process.env.SMTP_PORT) missingVars.push('SMTP_PORT');
if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS');

// Dynamically determine if SMTP is configured
const smtpConfigured = missingVars.length === 0;

if (missingVars.length > 0) {
  console.log('[EMAIL] ⚠️  SMTP not fully configured. Missing:', missingVars.join(', '));
  console.log('[EMAIL] Will rely on SendGrid if available');
}

let transporter = null;
if (smtpConfigured) {
  const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 465;
  const smtpSecure = (process.env.SMTP_SECURE === 'true') || smtpPort === 465;
  
  console.log(`[EMAIL] 🔧 Configuring SMTP transporter: ${process.env.SMTP_HOST}:${smtpPort} (secure=${smtpSecure})`);
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 15000, // 15s timeout
    greetingTimeout: 10000,
    socketTimeout: 15000,
    logger: true, // Enable logging for SMTP debugging
    debug: true // Enable debug output
  });

  console.log('[EMAIL] ✅ SMTP transporter configured (primary email service)');
} 


async function sendViaSendGrid({ to, subject, html, text }) {
  console.log(`[EMAIL-SENDGRID] 📤 Sending via SendGrid API to: ${to}`);
  
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || 'contact@haltshelter.org',
    subject,
    text,
    html
  };

  console.log('[EMAIL-SENDGRID] Message details:', {
    to: msg.to,
    from: msg.from,
    subject: msg.subject
  });

  try {
    const response = await sgMail.send(msg);
    console.log('[EMAIL-SENDGRID] ✅ Email sent successfully via SendGrid:', {
      statusCode: response[0].statusCode,
      messageId: response[0].headers?.['x-message-id']
    });
    return response;
  } catch (error) {
    console.error('[EMAIL-SENDGRID] ❌ SendGrid error details:', {
      message: error.message,
      code: error.code,
      statusCode: error.response?.statusCode,
      body: error.response?.body
    });
    throw error;
  }
}

async function sendReceiptEmail({ to, subject, html, text }) {
  console.log(`[EMAIL] ========== EMAIL SEND REQUEST ==========`);
  console.log(`[EMAIL] To: ${to}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  console.log(`[EMAIL] SendGrid available: ${hasSendGrid}`);
  console.log(`[EMAIL] SMTP configured: ${smtpConfigured}`);
  
  // Validate recipient email
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    const error = new Error(`Invalid recipient email: ${to}`);
    console.error('[EMAIL] ❌', error.message);
    throw error;
  }
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  };

  // SendGrid is primary - try it first if available
  if (hasSendGrid && useSendGridFirst) {
    console.log('[EMAIL] 📧 Using SendGrid as primary email service...');
    try {
      const result = await sendViaSendGrid({ to, subject, html, text });
      console.log('[EMAIL] ✅ Email delivered successfully via SendGrid');
      return result;
    } catch (sgErr) {
      console.error('[EMAIL] ❌ SendGrid primary send failed:', sgErr.message);
      console.error('[EMAIL] SendGrid error code:', sgErr.code);
      
      // Fallback to SMTP if configured
      if (smtpConfigured && transporter) {
        console.log('[EMAIL] 🔄 Attempting SMTP fallback...');
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log('[EMAIL] ✅ Email sent successfully via SMTP fallback:', {
            accepted: info.accepted,
            messageId: info.messageId
          });
          return info;
        } catch (smtpErr) {
          console.error('[EMAIL] ❌ SMTP fallback also failed:', smtpErr.message);
          const combinedError = new Error(`Both SendGrid and SMTP failed. SendGrid: ${sgErr.message}, SMTP: ${smtpErr.message}`);
          throw combinedError;
        }
      }
      
      console.error('[EMAIL] ❌ No fallback available, SendGrid was only option');
      throw sgErr;
    }
  }

  // Otherwise, try SMTP first if configured
  if (smtpConfigured && transporter) {
    console.log(`[EMAIL] 🔌 Attempting SMTP send via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`);
    console.log(`[EMAIL] From: ${mailOptions.from} | To: ${to}`);
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('[EMAIL] ✅ Email sent successfully via SMTP:', {
        accepted: info.accepted,
        rejected: info.rejected,
        messageId: info.messageId,
        response: info.response
      });
      return info;
    } catch (smtpErr) {
      console.error('[EMAIL] ❌ SMTP send failed:', {
        message: smtpErr.message,
        code: smtpErr.code,
        command: smtpErr.command,
        response: smtpErr.response,
        responseCode: smtpErr.responseCode
      });
      
      // If SMTP fails and SendGrid is available, fallback
      if (hasSendGrid) {
        console.log('[EMAIL] 🔄 SMTP failed, falling back to SendGrid...');
        try {
          return await sendViaSendGrid({ to, subject, html, text });
        } catch (sendGridErr) {
          console.error('[EMAIL-SENDGRID] ❌ SendGrid fallback also failed:', sendGridErr.message);
          throw new Error(`Both SMTP and SendGrid failed. SMTP: ${smtpErr.message}. SendGrid: ${sendGridErr.message}`);
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
