#!/usr/bin/env node
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/haltshelter';
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  console.log('Connecting to', uri.replace(/(\/\/[^@]+@)/, '//***REDACTED***@'));
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const dbName = uri.split('/').pop().split('?')[0] || 'haltshelter';
    const db = client.db(dbName);
    const coll = db.collection('bloglikes');

    const indexes = await coll.listIndexes().toArray();
    const createdAtIdx = indexes.find(i => i.name === 'createdAt_1');
    if (!createdAtIdx) {
      console.log('No createdAt_1 index found — nothing to promote.');
      return;
    }

    const backupName = `prepromote_createdAt_1_${ts}`;
    console.log(`Creating backup index ${backupName} from createdAt_1`);
    try {
      await coll.createIndex(createdAtIdx.key, { name: backupName, background: true });
      console.log('Backup created:', backupName);
    } catch (err) {
      console.error('Backup create failed:', err.message || err);
      // continue cautiously
    }

    // Drop the original createdAt_1
    console.log('Dropping original createdAt_1');
    try {
      await coll.dropIndex('createdAt_1');
      console.log('Dropped createdAt_1');
    } catch (err) {
      console.error('Failed to drop createdAt_1:', err.message || err);
      throw err;
    }

    // Find the desired TTL index created earlier
    const postIndexes = await coll.listIndexes().toArray();
    const desired = postIndexes.find(i => i.name && i.name.startsWith('desired_createdAt_1_'));
    if (!desired) {
      console.error('No desired_createdAt index found to promote. Manual step required.');
      return;
    }

    // Create canonical-named TTL index using desired spec (but name it createdAt_1)
    const desiredOptions = {
      name: 'createdAt_1',
      expireAfterSeconds: desired.expireAfterSeconds,
      partialFilterExpression: desired.partialFilterExpression,
      background: true,
    };
    console.log('Creating canonical TTL index createdAt_1 with options', desiredOptions);
    try {
      await coll.createIndex(desired.key, desiredOptions);
      console.log('Created canonical createdAt_1 with TTL');
    } catch (err) {
      console.error('Failed to create canonical createdAt_1:', err.message || err);
      // Attempt to restore backup
      console.log('Attempting to restore original createdAt_1 from backup');
      try {
        await coll.createIndex(createdAtIdx.key, { name: 'createdAt_1', background: true });
        console.log('Restored original createdAt_1 from backup');
      } catch (err2) {
        console.error('Failed to restore original createdAt_1:', err2.message || err2);
      }
    }

    // Final index listing
    const final = await coll.listIndexes().toArray();
    console.log('Final indexes after promote:');
    console.log(JSON.stringify(final, null, 2));
  } catch (err) {
    console.error('Error in promoteCreatedAtIndex:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

run();
