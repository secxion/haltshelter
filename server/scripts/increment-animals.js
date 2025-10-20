// Standalone script to increment the global animalsRescued counter in OrganizationSettings
// Usage: node server/scripts/increment-animals.js [amount]
// If amount is provided, it will increment by that integer. Otherwise it will pick random 1..3.

const connectDB = require('../db');
const mongoose = require('mongoose');
const OrganizationSettings = require('../models/OrganizationSettings');

async function run() {
  try {
    const ok = await connectDB();
    if (!ok) {
      console.error('Failed to connect to DB');
      process.exit(1);
    }

    const arg = process.argv[2];
    let increment = null;
    if (arg) {
      const n = parseInt(arg, 10);
      if (!isNaN(n)) increment = Math.max(0, n);
    }

    if (increment === null) {
      // random 1..3
      increment = 1 + Math.floor(Math.random() * 3);
    }

    let org = await OrganizationSettings.findOne();
    if (!org) org = await OrganizationSettings.create({});

    org.animalsRescued = (org.animalsRescued || 0) + increment;
    org.updatedAt = new Date();
    await org.save();

    console.log(`Incremented animalsRescued by ${increment}. New value: ${org.animalsRescued}`);

    // Disconnect and exit
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error running increment script:', err);
    try { await mongoose.connection.close(); } catch (e) {}
    process.exit(1);
  }
}

run();
