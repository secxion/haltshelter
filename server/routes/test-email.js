// Temporary test endpoint to verify SMTP email is working
// DELETE THIS FILE after confirming emails work in production

const express = require('express');
const router = express.Router();
const { sendReceiptEmail } = require('../utils/email');

// Test email endpoint - GET request for easy browser testing
router.get('/send-test-email', async (req, res) => {
  try {
    const testEmail = req.query.email || 'bellahipismo@gmail.com';
    
    console.log('[TEST-EMAIL] Attempting to send test email to:', testEmail);
    
    const subject = 'HALT Test Email - Delivery Check';
    const html = `
      <h2>✅ Email System Operational</h2>
      <p>This is a test email from your HALT Shelter server on Render.</p>
      <p>Email delivery is working via ${process.env.USE_SENDGRID_FIRST === 'true' ? 'SendGrid' : 'SMTP (with SendGrid fallback)'}.</p>
      <p><strong>Server Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <hr>
      <p>Current Configuration:</p>
      <ul>
        <li><strong>Preferred Sender:</strong> ${process.env.USE_SENDGRID_FIRST === 'true' ? 'SendGrid' : 'SMTP'}</li>
        <li><strong>SendGrid From:</strong> ${process.env.SENDGRID_FROM_EMAIL || 'NOT SET'}</li>
        <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'NOT SET'}</li>
        <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 'NOT SET'}</li>
        <li><strong>SMTP User:</strong> ${process.env.SMTP_USER || 'NOT SET'}</li>
        <li><strong>SMTP From:</strong> ${process.env.SMTP_FROM || 'NOT SET'}</li>
      </ul>
      <p style="font-size:12px;color:#666">Tip: For best deliverability, authenticate your domain (SPF, DKIM, DMARC).</p>
    `;
    const text = [
      'HALT Test Email - Delivery Check',
      `Email delivery is working via ${process.env.USE_SENDGRID_FIRST === 'true' ? 'SendGrid' : 'SMTP (with SendGrid fallback)'}.
Server: ${process.env.NODE_ENV || 'development'}
Timestamp: ${new Date().toISOString()}`,
      'Preferred:',
      `SendGrid From: ${process.env.SENDGRID_FROM_EMAIL || 'NOT SET'}`,
      `SMTP Host: ${process.env.SMTP_HOST || 'NOT SET'}`,
      `SMTP Port: ${process.env.SMTP_PORT || 'NOT SET'}`,
      `SMTP User: ${process.env.SMTP_USER || 'NOT SET'}`,
      `SMTP From: ${process.env.SMTP_FROM || 'NOT SET'}`
    ].join('\n');
    
    const info = await sendReceiptEmail({
      to: testEmail,
      subject,
      html,
      text
    });
    
    console.log('[TEST-EMAIL] ✅ Test email sent successfully:', info);
    
    res.json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      info: {
        accepted: info.accepted,
        rejected: info.rejected,
        messageId: info.messageId,
        response: info.response
      }
    });
    
  } catch (error) {
    console.error('[TEST-EMAIL] ❌ Failed to send test email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: {
        message: error.message,
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
        response: error.response
      }
    });
  }
});

// Show SMTP configuration status
router.get('/email-config', (req, res) => {
  res.json({
    smtp: {
      host: process.env.SMTP_HOST || 'NOT SET',
      port: process.env.SMTP_PORT || 'NOT SET',
      user: process.env.SMTP_USER || 'NOT SET',
      from: process.env.SMTP_FROM || 'NOT SET',
      secure: process.env.SMTP_SECURE || 'not set (defaults to false)',
      password_configured: !!process.env.SMTP_PASS
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
