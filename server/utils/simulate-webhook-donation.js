// Simulate a Stripe webhook donation completion and receipt email using the real backend logic
const mongoose = require('mongoose');
const { Donation } = require('../models');
const { sendReceiptEmail } = require('./email');


async function simulateWebhookDonation({
  paymentIntentId,
  email,
  firstName,
  amount
}) {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected.');

    // Create a pending donation as the frontend would
    let donation = await Donation.findOne({ paymentIntentId });
    if (!donation) {
      console.log('No existing donation found. Creating new donation...');
      donation = new Donation({
        amount,
        donationType: 'one-time',
        paymentIntentId,
        status: 'pending',
        donorInfo: {
          email,
          name: firstName
        }
      });
      await donation.save();
      console.log('Donation created:', donation._id);
    } else {
      console.log('Found existing donation:', donation._id);
    }

    // Simulate webhook logic
    donation.status = 'completed';
    donation.completedAt = new Date();
    await donation.save();
    console.log('Donation marked as completed.');

    try {
      console.log('Preparing to send receipt email to', email);
      await sendReceiptEmail({
        to: email,
        subject: 'Thank you for your donation to HALT!',
        text: `Dear ${firstName || 'Supporter'},\n\nThank you for your generous donation of $${amount} to HALT.\n\nYour support helps us continue our mission to help animals live and thrive.\n\nWith gratitude,\nThe HALT Team`,
        html: `<p>Dear ${firstName || 'Supporter'},</p><p>Thank you for your generous donation of <b>$${amount}</b> to HALT.</p><p>Your support helps us continue our mission to help animals live and thrive.</p><p>With gratitude,<br/>The HALT Team</p>`
      });
      console.log('Receipt email sent to', email);
    } catch (err) {
      console.error('Error sending receipt email:', err);
    }

    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  } catch (err) {
    console.error('Simulation failed:', err);
    try { await mongoose.disconnect(); } catch (e) {}
  }
}

// Example usage:
simulateWebhookDonation({
  paymentIntentId: 'pi_test_simulated',
  email: 'bellahipismo@gmail.com',
  firstName: 'Bob ooss',
  amount: 250
});
