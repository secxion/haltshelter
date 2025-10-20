// server/utils/test-email.js
const { sendReceiptEmail } = require('./email');

(async () => {
  try {
    await sendReceiptEmail({
      to: 'contact@haltshelter.org',
      subject: 'Test Email from HALT',
      text: 'This is a test email from your Node.js backend using Hostinger SMTP.',
      html: '<p>This is a <b>test email</b> from your Node.js backend using Hostinger SMTP.</p>'
    });
    console.log('Test email sent!');
  } catch (err) {
    console.error('Failed to send test email:', err);
  }
})();
