// test-send-smtp.js
require('dotenv').config({ path: require('path').resolve(__dirname, './.env') });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // send to yourself for test
      subject: 'SMTP Test from Node.js',
      text: 'This is a test email sent directly from a minimal Node.js script using your .env config.'
    });
    console.log('Test email sent:', info.messageId);
  } catch (err) {
    console.error('Error sending test email:', err);
  }
}

main();
