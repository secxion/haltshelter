require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./server/models/Donation');

async function checkDonations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const donations = await Donation.find().sort({ createdAt: -1 }).limit(5);
    console.log('Recent donations:', donations.length);
    
    donations.forEach((donation, index) => {
      console.log(`\n--- Donation ${index + 1} ---`);
      console.log('ID:', donation._id);
      console.log('Amount:', donation.amount);
      console.log('Currency:', donation.currency);
      console.log('Donor Name:', donation.donorInfo?.name);
      console.log('Donor Email:', donation.donorInfo?.email);
      console.log('Donation Type:', donation.donationType);
      console.log('Created:', donation.createdAt);
      console.log('Receipt ID:', donation.receiptId);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDonations();
