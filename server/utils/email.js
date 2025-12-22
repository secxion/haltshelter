// Hybrid email system: Try SMTP first, fallback to SendGrid if SMTP fails
// This handles Render's SMTP port blocking by automatically using SendGrid API
// ⭐⭐⭐ VERSION: 2024-12-20-HARDCODED-HALT ⭐⭐⭐
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

console.log('');
console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
console.log('🔴  EMAIL.JS VERSION: 2024-12-20-HARDCODED-HALT                    🔴');
console.log('🔴  IF YOU SEE THIS, THE NEW CODE IS RUNNING!                     🔴');
console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
console.log('');
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║        📧 EMAIL MODULE INITIALIZATION - SERVER START 📧          ║');
console.log('╠══════════════════════════════════════════════════════════════════╣');
console.log('║  Timestamp:', new Date().toISOString());
console.log('║  Node Version:', process.version);
console.log('║  Platform:', process.platform);
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('[EMAIL] 🚀 Initializing hybrid email system (SMTP + SendGrid fallback)');

// SMTP Configuration
console.log('');
console.log('┌──────────────────────────────────────────────────────────────────┐');
console.log('│              🔧 SMTP CONFIGURATION CHECK                         │');
console.log('└──────────────────────────────────────────────────────────────────┘');
console.log('[EMAIL] SMTP configuration:', {
  SMTP_HOST: process.env.SMTP_HOST || 'MISSING',
  SMTP_PORT: process.env.SMTP_PORT || 'MISSING',
  SMTP_USER: process.env.SMTP_USER || 'MISSING',
  SMTP_FROM: process.env.SMTP_FROM || 'MISSING',
  SMTP_PASS: process.env.SMTP_PASS ? '***configured***' : 'MISSING',
  SMTP_SECURE: process.env.SMTP_SECURE || 'not set (defaults to false)'
});

// SendGrid Configuration
console.log('');
console.log('┌──────────────────────────────────────────────────────────────────┐');
console.log('│              🔷 SENDGRID CONFIGURATION CHECK                     │');
console.log('└──────────────────────────────────────────────────────────────────┘');
const hasSendGrid = !!process.env.SENDGRID_API_KEY;
// Allow runtime toggle: USE_SENDGRID_FIRST=true|false (defaults to true)
const useSendGridFirst = process.env.USE_SENDGRID_FIRST
  ? process.env.USE_SENDGRID_FIRST === 'true'
  : true;

console.log('[EMAIL] SendGrid configuration:', {
  SENDGRID_API_KEY: hasSendGrid ? '***configured***' : 'MISSING',
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'contact@haltshelter.org',
  status: hasSendGrid ? '✅ SendGrid ENABLED' : '⚠️  Not configured',
  USE_SENDGRID_FIRST: useSendGridFirst ? 'ENABLED - SendGrid is primary' : 'DISABLED - SMTP is primary',
  USE_SENDGRID_FIRST_RAW: process.env.USE_SENDGRID_FIRST || '(default true)'
});

if (hasSendGrid) {
  console.log('[EMAIL] 🔑 Setting SendGrid API Key...');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('[EMAIL] ✅ SendGrid API Key configured successfully');
  if (process.env.SENDGRID_DATA_RESIDENCY === 'EU' || process.env.SENDGRID_API_HOST) {
    console.log('[EMAIL] EU data residency requested but client host override not available in this version');
    console.log('[EMAIL] Ensure you are using an EU-pinned subuser in SendGrid if EU compliance required');
  }
} else {
  console.log('[EMAIL] ⚠️  SendGrid API Key NOT configured - SendGrid disabled');
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
  
  console.log('');
  console.log('┌──────────────────────────────────────────────────────────────────┐');
  console.log('│              🔌 SMTP TRANSPORTER SETUP                           │');
  console.log('└──────────────────────────────────────────────────────────────────┘');
  console.log(`[EMAIL] 🔧 Configuring SMTP transporter:`);
  console.log(`[EMAIL]    Host: ${process.env.SMTP_HOST}`);
  console.log(`[EMAIL]    Port: ${smtpPort}`);
  console.log(`[EMAIL]    Secure: ${smtpSecure}`);
  console.log(`[EMAIL]    User: ${process.env.SMTP_USER}`);
  console.log(`[EMAIL]    TLS: rejectUnauthorized=false, minVersion=TLSv1.2`);
  
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
  console.log('');
} 

// ⭐ HARDCODED SENDER VALUES
const HARDCODED_SENDER = {
  email: 'contact@haltshelter.org',
  name: 'HALT'
};

console.log('');
console.log('┌──────────────────────────────────────────────────────────────────┐');
console.log('│              📬 HARDCODED SENDER INFO                            │');
console.log('└──────────────────────────────────────────────────────────────────┘');
console.log('[EMAIL] HARDCODED_SENDER.email:', HARDCODED_SENDER.email);
console.log('[EMAIL] HARDCODED_SENDER.name:', HARDCODED_SENDER.name);
console.log('[EMAIL] SMTP Format:', `${HARDCODED_SENDER.name} <${HARDCODED_SENDER.email}>`);
console.log('[EMAIL] SendGrid Format:', JSON.stringify({ email: HARDCODED_SENDER.email, name: HARDCODED_SENDER.name }));
console.log('');

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║        ✅ EMAIL MODULE READY - INITIALIZATION COMPLETE ✅        ║');
console.log('╠══════════════════════════════════════════════════════════════════╣');
console.log('║  SMTP Ready:', smtpConfigured ? 'YES ✅' : 'NO ❌');
console.log('║  SendGrid Ready:', hasSendGrid ? 'YES ✅' : 'NO ❌');
console.log('║  Primary Service:', (hasSendGrid && useSendGridFirst) ? 'SendGrid' : (smtpConfigured ? 'SMTP' : 'NONE'));
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// ⭐ HARDCODED sender - same as working test scripts
// This avoids env parsing issues that caused "contact" instead of "HALT"
function getSenderAddress() {
  // HARDCODE the values - proven to work in test scripts
  const email = 'contact@haltshelter.org';
  const name = 'HALT';
  
  console.log('');
  console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
  console.log('[EMAIL] getSenderAddress() CALLED!');
  console.log('[EMAIL] HARDCODED email:', email);
  console.log('[EMAIL] HARDCODED name:', name);
  console.log('🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴');
  console.log('');
  
  const result = {
    // For SendGrid - use OBJECT format (most reliable for display name)
    sendgrid: {
      email: email,
      name: name
    },
    // For SMTP - use STRING format
    smtp: `${name} <${email}>`,
    // Debug info
    debug: { email, name, source: 'hardcoded' }
  };
  
  console.log('[EMAIL] Returning sender object:', JSON.stringify(result, null, 2));
  
  return result;
}

// ⭐ FIXED: SendGrid function now uses object format
async function sendViaSendGrid({ to, subject, html, text }) {
  const timestamp = new Date().toISOString();
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║        🟢 SENDGRID EMAIL SEND - START 🟢                         ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log('║  Timestamp:', timestamp);
  console.log('║  Recipient:', to);
  console.log('║  Subject:', subject);
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  console.log('[EMAIL-SENDGRID] 🔐 AUTH CHECK - Using hardcoded sender values');
  console.log('[EMAIL-SENDGRID] 🔐 From Email:', HARDCODED_SENDER.email);
  console.log('[EMAIL-SENDGRID] 🔐 From Name:', HARDCODED_SENDER.name);
  
  // Build the base URL for unsubscribe links
  const baseUrl = (process.env.FRONTEND_URL || 'https://haltshelter.org').replace(/\/+$/, '');
  
  // THIS IS THE KEY FIX: Truly hardcoded sender values + deliverability headers
  const msg = {
    to,
    from: {
      email: HARDCODED_SENDER.email,
      name: HARDCODED_SENDER.name
    },
    replyTo: {
      email: HARDCODED_SENDER.email,
      name: HARDCODED_SENDER.name
    },
    subject,
    text,
    html,
    // Headers that improve deliverability
    headers: {
      'X-Priority': '3',
      'X-Mailer': 'HALT Shelter Mailer'
    },
    // Mail settings for better deliverability
    mailSettings: {
      sandboxMode: {
        enable: false
      }
    },
    // Tracking settings - all disabled to avoid link rewriting
    trackingSettings: {
      clickTracking: {
        enable: false,
        enableText: false
      },
      openTracking: {
        enable: false
      },
      subscriptionTracking: {
        enable: false
      }
    }
  };

  console.log('');
  console.log('┌──────────────────────────────────────────────────────────────────┐');
  console.log('│              📤 SENDGRID MESSAGE OBJECT                          │');
  console.log('└──────────────────────────────────────────────────────────────────┘');
  console.log('[EMAIL-SENDGRID] to:', msg.to);
  console.log('[EMAIL-SENDGRID] from:', JSON.stringify(msg.from));
  console.log('[EMAIL-SENDGRID] subject:', msg.subject);
  console.log('[EMAIL-SENDGRID] text length:', text ? text.length : 0);
  console.log('[EMAIL-SENDGRID] html length:', html ? html.length : 0);
  console.log('');

  try {
    console.log('[EMAIL-SENDGRID] 📡 Calling sgMail.send()...');
    const startTime = Date.now();
    const response = await sgMail.send(msg);
    const duration = Date.now() - startTime;
    
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║        ✅ SENDGRID EMAIL SEND - SUCCESS ✅                       ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║  Status Code:', response[0].statusCode);
    console.log('║  Message ID:', response[0].headers?.['x-message-id'] || 'N/A');
    console.log('║  Duration:', duration + 'ms');
    console.log('║  Recipient:', to);
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');
    
    return response;
  } catch (error) {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║        ❌ SENDGRID EMAIL SEND - FAILED ❌                        ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║  Error Message:', error.message);
    console.log('║  Error Code:', error.code || 'N/A');
    console.log('║  Status Code:', error.response?.statusCode || 'N/A');
    console.log('║  Response Body:', JSON.stringify(error.response?.body) || 'N/A');
    console.log('║  Recipient:', to);
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');
    throw error;
  }
}

async function sendReceiptEmail({ to, subject, html, text }) {
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║        📧 EMAIL SEND REQUEST RECEIVED 📧                         ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log('║  Request ID:', requestId);
  console.log('║  Timestamp:', timestamp);
  console.log('║  To:', to);
  console.log('║  Subject:', subject);
  console.log('║  SendGrid Available:', hasSendGrid ? 'YES' : 'NO');
  console.log('║  SMTP Configured:', smtpConfigured ? 'YES' : 'NO');
  console.log('║  Use SendGrid First:', useSendGridFirst ? 'YES' : 'NO');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Validate recipient email
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    const error = new Error(`Invalid recipient email: ${to}`);
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║        ❌ EMAIL VALIDATION FAILED ❌                             ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║  Error:', error.message);
    console.log('║  Request ID:', requestId);
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');
    throw error;
  }
  
  console.log('[EMAIL] ✅ Recipient validation passed:', to);
  
  console.log('');
  console.log('┌──────────────────────────────────────────────────────────────────┐');
  console.log('│              🔐 SMTP AUTH - HARDCODED VALUES                     │');
  console.log('└──────────────────────────────────────────────────────────────────┘');
  console.log('[EMAIL] Using HARDCODED sender for SMTP:', `${HARDCODED_SENDER.name} <${HARDCODED_SENDER.email}>`);
  
  const mailOptions = {
    from: `${HARDCODED_SENDER.name} <${HARDCODED_SENDER.email}>`,
    to,
    subject,
    text,
    html
  };

  console.log('[EMAIL] Mail options configured:');
  console.log('[EMAIL]   from:', mailOptions.from);
  console.log('[EMAIL]   to:', mailOptions.to);
  console.log('[EMAIL]   subject:', mailOptions.subject);
  console.log('');

  // SendGrid is primary - try it first if available
  if (hasSendGrid && useSendGridFirst) {
    console.log('');
    console.log('┌──────────────────────────────────────────────────────────────────┐');
    console.log('│              🔷 USING SENDGRID AS PRIMARY                        │');
    console.log('└──────────────────────────────────────────────────────────────────┘');
    console.log('[EMAIL] Request ID:', requestId);
    try {
      const result = await sendViaSendGrid({ to, subject, html, text });
      console.log('[EMAIL] ✅ [' + requestId + '] Email delivered successfully via SendGrid');
      return result;
    } catch (sgErr) {
      console.log('');
      console.log('┌──────────────────────────────────────────────────────────────────┐');
      console.log('│              ⚠️  SENDGRID FAILED - CHECKING FALLBACK            │');
      console.log('└──────────────────────────────────────────────────────────────────┘');
      console.error('[EMAIL] ❌ [' + requestId + '] SendGrid primary send failed:', sgErr.message);
      console.error('[EMAIL] SendGrid error code:', sgErr.code);
      
      // Fallback to SMTP if configured
      if (smtpConfigured && transporter) {
        console.log('');
        console.log('┌──────────────────────────────────────────────────────────────────┐');
        console.log('│              🔄 ATTEMPTING SMTP FALLBACK                         │');
        console.log('└──────────────────────────────────────────────────────────────────┘');
        console.log('[EMAIL] 🔌 [' + requestId + '] Attempting SMTP fallback...');
        try {
          const startTime = Date.now();
          const info = await transporter.sendMail(mailOptions);
          const duration = Date.now() - startTime;
          
          console.log('');
          console.log('╔══════════════════════════════════════════════════════════════════╗');
          console.log('║        ✅ SMTP FALLBACK - SUCCESS ✅                             ║');
          console.log('╠══════════════════════════════════════════════════════════════════╣');
          console.log('║  Request ID:', requestId);
          console.log('║  Accepted:', info.accepted);
          console.log('║  Message ID:', info.messageId);
          console.log('║  Duration:', duration + 'ms');
          console.log('╚══════════════════════════════════════════════════════════════════╝');
          console.log('');
          return info;
        } catch (smtpErr) {
          console.log('');
          console.log('╔══════════════════════════════════════════════════════════════════╗');
          console.log('║        ❌ BOTH SENDGRID AND SMTP FAILED ❌                       ║');
          console.log('╠══════════════════════════════════════════════════════════════════╣');
          console.log('║  Request ID:', requestId);
          console.log('║  SendGrid Error:', sgErr.message);
          console.log('║  SMTP Error:', smtpErr.message);
          console.log('╚══════════════════════════════════════════════════════════════════╝');
          console.log('');
          const combinedError = new Error(`Both SendGrid and SMTP failed. SendGrid: ${sgErr.message}, SMTP: ${smtpErr.message}`);
          throw combinedError;
        }
      }
      
      console.error('[EMAIL] ❌ [' + requestId + '] No SMTP fallback available, SendGrid was only option');
      throw sgErr;
    }
  }

  // Otherwise, try SMTP first if configured
  if (smtpConfigured && transporter) {
    console.log('');
    console.log('┌──────────────────────────────────────────────────────────────────┐');
    console.log('│              🔌 USING SMTP AS PRIMARY                            │');
    console.log('└──────────────────────────────────────────────────────────────────┘');
    console.log(`[EMAIL] 🔌 [${requestId}] Attempting SMTP send via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`);
    console.log(`[EMAIL] From: ${mailOptions.from} | To: ${to}`);
    
    try {
      const startTime = Date.now();
      const info = await transporter.sendMail(mailOptions);
      const duration = Date.now() - startTime;
      
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════════════╗');
      console.log('║        ✅ SMTP PRIMARY - SUCCESS ✅                              ║');
      console.log('╠══════════════════════════════════════════════════════════════════╣');
      console.log('║  Request ID:', requestId);
      console.log('║  Accepted:', info.accepted);
      console.log('║  Rejected:', info.rejected);
      console.log('║  Message ID:', info.messageId);
      console.log('║  Response:', info.response);
      console.log('║  Duration:', duration + 'ms');
      console.log('╚══════════════════════════════════════════════════════════════════╝');
      console.log('');
      return info;
    } catch (smtpErr) {
      console.log('');
      console.log('┌──────────────────────────────────────────────────────────────────┐');
      console.log('│              ❌ SMTP PRIMARY FAILED                              │');
      console.log('└──────────────────────────────────────────────────────────────────┘');
      console.error('[EMAIL] ❌ [' + requestId + '] SMTP send failed:', {
        message: smtpErr.message,
        code: smtpErr.code,
        command: smtpErr.command,
        response: smtpErr.response,
        responseCode: smtpErr.responseCode
      });
      
      // If SMTP fails and SendGrid is available, fallback
      if (hasSendGrid) {
        console.log('');
        console.log('┌──────────────────────────────────────────────────────────────────┐');
        console.log('│              🔄 ATTEMPTING SENDGRID FALLBACK                     │');
        console.log('└──────────────────────────────────────────────────────────────────┘');
        console.log('[EMAIL] 🔄 [' + requestId + '] SMTP failed, falling back to SendGrid...');
        try {
          return await sendViaSendGrid({ to, subject, html, text });
        } catch (sendGridErr) {
          console.log('');
          console.log('╔══════════════════════════════════════════════════════════════════╗');
          console.log('║        ❌ BOTH SMTP AND SENDGRID FAILED ❌                       ║');
          console.log('╠══════════════════════════════════════════════════════════════════╣');
          console.log('║  Request ID:', requestId);
          console.log('║  SMTP Error:', smtpErr.message);
          console.log('║  SendGrid Error:', sendGridErr.message);
          console.log('╚══════════════════════════════════════════════════════════════════╝');
          console.log('');
          throw new Error(`Both SMTP and SendGrid failed. SMTP: ${smtpErr.message}. SendGrid: ${sendGridErr.message}`);
        }
      } else {
        console.error('[EMAIL] ❌ [' + requestId + '] No SendGrid fallback available');
        throw smtpErr;
      }
    }
  }
  
  // If SMTP not configured, try SendGrid directly
  if (hasSendGrid) {
    console.log('');
    console.log('┌──────────────────────────────────────────────────────────────────┐');
    console.log('│              🔷 SMTP NOT CONFIGURED - USING SENDGRID             │');
    console.log('└──────────────────────────────────────────────────────────────────┘');
    console.log('[EMAIL] [' + requestId + '] SMTP not configured, using SendGrid directly...');
    return await sendViaSendGrid({ to, subject, html, text });
  }
  
  // No email service configured
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║        ❌ NO EMAIL SERVICE CONFIGURED ❌                         ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log('║  Request ID:', requestId);
  console.log('║  SMTP:', smtpConfigured ? 'Configured' : 'NOT Configured');
  console.log('║  SendGrid:', hasSendGrid ? 'Configured' : 'NOT Configured');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  const error = new Error('No email service configured (neither SMTP nor SendGrid)');
  throw error;
}

module.exports = { sendReceiptEmail };