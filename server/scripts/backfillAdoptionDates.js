/* Backfill adoptionDate for Animals with status 'Adopted' but no adoptionDate.
   Strategy: set adoptionDate = updatedAt (if available), or createdAt otherwise. Run once.

   Usage: node server/scripts/backfillAdoptionDates.js
*/

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../db');
const Animal = require('../models/Animal');

async function run() {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.error('Database not connected; aborting.');
      process.exit(1);
    }
    // support a --dry-run flag so this script can preview changes without writing
    const dryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';

    const query = { status: 'Adopted', adoptionDate: { $exists: false } };
    const animals = await Animal.find(query).select('_id name createdAt updatedAt');

    if (!animals.length) {
      console.log('No animals require backfill.');
      process.exit(0);
    }

    console.log(`Found ${animals.length} adopted animals without adoptionDate.`);

    let updated = 0;
    for (const a of animals) {
      const adoptionDate = a.updatedAt || a.createdAt || new Date();
      try {
        if (dryRun) {
          console.log(`[dry-run] Would update ${a._id} (${a.name}) -> adoptionDate=${adoptionDate.toISOString()}, isRecentlyAdopted=true`);
        } else {
          await Animal.findByIdAndUpdate(a._id, { adoptionDate, isRecentlyAdopted: true }, { new: true });
          console.log(`Updated ${a._id} (${a.name}) -> adoptionDate=${adoptionDate.toISOString()}`);
          updated++;
        }
      } catch (err) {
        console.error(`Failed to update ${a._id} (${a.name}):`, err.message);
      }
    }

    if (dryRun) {
      console.log(`Dry-run complete. ${animals.length} records would be updated.`);
    } else {
      console.log(`Backfill complete. Updated ${updated}/${animals.length} records.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  }
}

run();
