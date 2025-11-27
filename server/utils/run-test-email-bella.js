const { sendReceiptEmail } = require('./email');

(async () => {
  try {
    console.log('Starting test email to bellahipismo@gmail.com');
    const info = await sendReceiptEmail({
      to: 'bellahipismo@gmail.com',
      subject: 'Donation receipt test',
      text: 'This is a test donation receipt sent from the HALT Shelter backend.',
      html: '<p>This is a <b>test donation receipt</b> sent from the HALT Shelter backend.</p>'
    });
    console.log('Test email sent successfully:', info);
  } catch (err) {
    console.error('Failed to send test email:', err);
    process.exit(1);
  }
})();
