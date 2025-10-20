// test-send-receipt.js
const { sendReceiptEmail } = require('./server/utils/email');

(async () => {
  try {
    await sendReceiptEmail({
      to: 'boardmanxii@gmail.com',
      subject: 'HALT Donation Receipt - Thank You for Your Gift!',
      text: `Dear Gabriel Ooss,\n\nThank you for your generous donation of $100.00 to HALT.\n\nPayment Details:\nAmount: $100.00\nPayment Method: Stripe (Visa •••• 4242)\nTransaction ID: pi_3SE3t9CBdE6DVn2P0lbYJOxw\nDate: October 3, 2025\n\nYour support helps us continue our mission to help animals live and thrive.\n\nWith gratitude,\nThe HALT Team`,
      html: `<p>Dear Gabriel Ooss,</p><p>Thank you for your generous donation of <b>$100.00</b> to HALT.</p><h3>Payment Details</h3><ul><li><b>Amount:</b> $100.00</li><li><b>Payment Method:</b> Stripe (Visa •••• 4242)</li><li><b>Transaction ID:</b> pi_3SE3t9CBdE6DVn2P0lbYJOxw</li><li><b>Date:</b> October 3, 2025</li></ul><p>Your support helps us continue our mission to help animals live and thrive.</p><p>With gratitude,<br/>The HALT Team</p>`
    });
    console.log('Test donation receipt email with full payment details sent successfully!');
  } catch (err) {
    console.error('Failed to send test donation receipt email:', err);
  }
})();
