require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./server/models/Donation');

async function testMongoDBConnection() {
  try {
    console.log('🔍 Testing MongoDB connection and donation creation...');
    console.log('MongoDB URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test creating a donation directly
    const testDonation = new Donation({
      donorInfo: {
        name: 'Direct Test Donor',
        email: 'direct@test.com',
        isAnonymous: false
      },
      amount: 15.50,
      currency: 'USD',
      donationType: 'one-time',
      category: 'general',
      paymentMethod: 'stripe',
      paymentStatus: 'completed',
      transactionId: 'test_direct_' + Date.now()
    });
    
    console.log('🔍 About to save donation:', {
      name: testDonation.donorInfo.name,
      email: testDonation.donorInfo.email,
      amount: testDonation.amount,
      currency: testDonation.currency
    });
    
    const savedDonation = await testDonation.save();
    console.log('✅ Donation saved successfully!');
    console.log('📝 Saved donation ID:', savedDonation._id);
    console.log('📝 Receipt ID:', savedDonation.receiptId);
    
    // Count total donations
    const totalDonations = await Donation.countDocuments();
    console.log('📊 Total donations in database:', totalDonations);
    
    // Get recent donations
    const recentDonations = await Donation.find().sort({ createdAt: -1 }).limit(3);
    console.log('📋 Recent donations:');
    recentDonations.forEach((donation, index) => {
      console.log(`  ${index + 1}. ${donation.donorInfo.name} - $${donation.amount} - ${donation.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('❌ Validation errors:', Object.keys(error.errors));
      Object.keys(error.errors).forEach(field => {
        console.error(`  - ${field}: ${error.errors[field].message}`);
      });
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

testMongoDBConnection();
