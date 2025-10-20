// Script to batch set isRecentlyAdopted: true for all adopted animals
const mongoose = require('mongoose');
const Animal = require('../models/Animal');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

async function markRecentlyAdopted() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Animal.updateMany(
    { status: 'Adopted' },
    { $set: { isRecentlyAdopted: true } }
  );
  console.log(`Updated ${result.modifiedCount || result.nModified} adopted animals.`);
  await mongoose.disconnect();
}

markRecentlyAdopted().catch(err => {
  console.error('Error updating adopted animals:', err);
  process.exit(1);
});
