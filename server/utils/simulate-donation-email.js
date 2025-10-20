
const { sendReceiptEmail } = require('./email');

(async () => {
  try {
    await sendReceiptEmail({
      to: 'boardmanxii@gmail.com',
      subject: 'Thank you for your donation to HALT! (Test Simulation)',
      text: `Dear Gabriel,\n\nThank you for your generous donation of $25 to HALT.\n\nYour support helps us continue our mission to help animals live and thrive.\n\nWith gratitude,\nThe HALT Team`,
      html: `<p>Dear Gabriel,</p><p>Thank you for your generous donation of <b>$25</b> to HALT.</p><p>Your support helps us continue our mission to help animals live and thrive.</p><p>With gratitude,<br/>The HALT Team</p>`
    });
    console.log('Simulated donation receipt email sent to boardmanxii@gmail.com');
  } catch (err) {
    console.error('Failed to send simulated donation receipt email:', err);
  }
})();
