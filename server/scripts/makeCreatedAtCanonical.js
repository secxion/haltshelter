#!/usr/bin/env node
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/haltshelter';
  console.log('Connecting to', uri.replace(/(\/\/[^@]+@)/, '//***REDACTED***@'));
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const dbName = uri.split('/').pop().split('?')[0] || 'haltshelter';
    const db = client.db(dbName);
    const coll = db.collection('bloglikes');

    const indexes = await coll.listIndexes().toArray();
    const desired = indexes.find(i => i.name && i.name.startsWith('desired_createdAt_1_'));
    if (!desired) {
      console.error('No desired_createdAt_* index found. Aborting.');
      return;
    }
    console.log('Found desired index:', desired.name);

    // Save spec so we can recreate if needed
    const desiredSpec = { key: desired.key, options: {} };
    if (desired.expireAfterSeconds) desiredSpec.options.expireAfterSeconds = desired.expireAfterSeconds;
    if (desired.partialFilterExpression) desiredSpec.options.partialFilterExpression = desired.partialFilterExpression;
    if (desired.unique) desiredSpec.options.unique = desired.unique;
    if (desired.sparse) desiredSpec.options.sparse = desired.sparse;
    desiredSpec.options.background = true;

    // Step 1: drop the desired index (TTL) so we can recreate it under canonical name
    console.log('Dropping desired index', desired.name);
    try {
      await coll.dropIndex(desired.name);
      console.log('Dropped', desired.name);
    } catch (err) {
      console.error('Failed to drop desired index:', err.message || err);
      throw err;
    }

    // Step 2: drop the old createdAt_1 if it exists
    const post = await coll.listIndexes().toArray();
    const old = post.find(i => i.name === 'createdAt_1');
    if (old) {
      console.log('Dropping old createdAt_1');
      try {
        await coll.dropIndex('createdAt_1');
        console.log('Dropped createdAt_1');
      } catch (err) {
        console.error('Failed dropping createdAt_1:', err.message || err);
        // Attempt to restore desired index and abort
        console.log('Attempting to restore desired index from saved spec');
        try {
          await coll.createIndex(desiredSpec.key, Object.assign({ name: desired.name }, desiredSpec.options));
          console.log('Restored desired index', desired.name);
        } catch (err2) {
          console.error('Failed to restore desired index:', err2.message || err2);
        }
        throw err;
      }
    } else {
      console.log('No existing createdAt_1 found to drop');
    }

    // Step 3: create canonical createdAt_1 with TTL options
    console.log('Creating canonical index createdAt_1 with TTL options', desiredSpec.options);
    try {
      await coll.createIndex(desiredSpec.key, Object.assign({ name: 'createdAt_1' }, desiredSpec.options));
      console.log('Created canonical createdAt_1');
    } catch (err) {
      console.error('Failed to create canonical createdAt_1:', err.message || err);
      // Attempt to restore desired index
      console.log('Attempting to restore desired index from saved spec');
      try {
        await coll.createIndex(desiredSpec.key, Object.assign({ name: desired.name }, desiredSpec.options));
        console.log('Restored desired index', desired.name);
      } catch (err2) {
        console.error('Failed to restore desired index:', err2.message || err2);
      }
      throw err;
    }

    const final = await coll.listIndexes().toArray();
    console.log('Final indexes after canonicalization:');
    console.log(JSON.stringify(final, null, 2));
  } catch (err) {
    console.error('Error in makeCreatedAtCanonical:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

run();
