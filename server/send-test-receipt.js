/**
 * Send test donation receipt to specified email
 * Uses the centralized email templates
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const sgMail = require('@sendgrid/mail');
const { donationReceiptHtml, donationReceiptText } = require('./utils/emailTemplates');

const recipient = process.argv[2] || 'bellahipismo@gmail.com';
const amount = parseFloat(process.argv[3]) || 25.00;

console.log(`\n📧 Sending donation receipt to: ${recipient}`);
console.log(`   Amount: $${amount.toFixed(2)}`);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: recipient,
  from: {
    email: 'contact@haltshelter.org',
    name: 'HALT'
  },
  subject: 'Thank You for Your Donation to HALT Shelter!',
  html: donationReceiptHtml({
    donorName: 'Supporter',
    amount: amount,
    currency: 'USD',
    donationType: 'one-time',
    isEmergency: false,
    transactionId: `test_${Date.now()}`,
    timestamp: new Date()
  }),
  text: donationReceiptText({
    donorName: 'Supporter',
    amount: amount,
    currency: 'USD',
    donationType: 'one-time',
    isEmergency: false,
    transactionId: `test_${Date.now()}`,
    timestamp: new Date()
  })
};

sgMail.send(msg)
  .then((response) => {
    console.log('\n✅ SUCCESS! Donation receipt sent');
    console.log('   Status:', response[0].statusCode);
    console.log('   Message ID:', response[0].headers?.['x-message-id']);
    console.log('\n📬 Check inbox at:', recipient);
    console.log('   Sender should show: HALT');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ FAILED:', error.message);
    if (error.response) {
      console.error('   Body:', JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  });
