require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./server/models/Donation');

async function testDonationCreation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Test creating a donation with the exact same data our webhook would use
    const testDonation = new Donation({
      donorInfo: {
        name: 'Jenny Rosen',
        email: 'test@haltshelter.org',
        address: {
          street: '510 Townsend St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          country: 'US'
        }
      },
      amount: 20.00,
      currency: 'USD',
      donationType: 'one-time',
      category: 'general',
      paymentMethod: 'stripe',
      status: 'completed',
      stripePaymentIntentId: 'pi_test_12345'
    });

    console.log('Attempting to save test donation...');
    const saved = await testDonation.save();
    console.log('✅ Test donation created successfully!');
    console.log('Receipt ID:', saved.receiptId);
    console.log('Donation ID:', saved._id);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error creating test donation:');
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  ${key}: ${error.errors[key].message}`);
      });
    }
    await mongoose.disconnect();
  }
}

testDonationCreation();
