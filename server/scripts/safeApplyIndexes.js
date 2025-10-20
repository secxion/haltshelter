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
    const indexNames = indexes.map(i => i.name);
    console.log('Current index names:', indexNames);

    const legacyNames = ['blogId_1_userId_1', 'blogId_1_ipHash_1', 'createdAt_1'];

    // Create timestamped backups for legacy indexes that exist
    for (const legacy of legacyNames) {
      const idx = indexes.find(i => i.name === legacy);
      if (!idx) {
        console.log(`Legacy index ${legacy} not found, skipping backup.`);
        continue;
      }
      const backupName = `backup_${legacy}_${ts}`;
      if (indexNames.includes(backupName)) {
        console.log(`Backup index ${backupName} already exists, skipping.`);
        continue;
      }
      const key = idx.key;
      // copy most relevant options from existing index
      const options = { name: backupName };
      if (idx.unique) options.unique = true;
      if (idx.sparse) options.sparse = true;
      if (idx.partialFilterExpression) options.partialFilterExpression = idx.partialFilterExpression;
      if (idx.expireAfterSeconds) options.expireAfterSeconds = idx.expireAfterSeconds;
      try {
        console.log(`Creating backup index ${backupName} for ${legacy} with options`, options);
        await coll.createIndex(key, options);
        console.log(`Created backup index ${backupName}`);
      } catch (err) {
        console.error(`Failed creating backup index ${backupName}:`, err.message || err);
      }
    }

    // Now create desired indexes with unique names (avoid spec/name collisions)
    const desired = [
      {
        key: { createdAt: 1 },
        options: {
          name: `desired_createdAt_1_${ts}`,
          expireAfterSeconds: 7776000,
          partialFilterExpression: { ipHash: { $type: 'string' } },
          background: true,
        },
      },
      {
        key: { blogId: 1, userId: 1 },
        options: {
          name: `desired_blogId_1_userId_1_${ts}`,
          unique: true,
          partialFilterExpression: { userId: { $type: 'objectId' } },
          background: true,
        },
      },
      {
        key: { blogId: 1, ipHash: 1 },
        options: {
          name: `desired_blogId_1_ipHash_1_${ts}`,
          unique: true,
          partialFilterExpression: { ipHash: { $type: 'string' } },
          background: true,
        },
      },
    ];

    for (const idxSpec of desired) {
      const name = idxSpec.options.name;
      if (indexNames.includes(name)) {
        console.log(`Desired index ${name} already exists, skipping.`);
        continue;
      }
      try {
        console.log(`Creating desired index ${name} with key`, idxSpec.key, 'and options', idxSpec.options);
        await coll.createIndex(idxSpec.key, idxSpec.options);
        console.log(`Created desired index ${name}`);
      } catch (err) {
        console.error(`Failed creating desired index ${name}:`, err.message || err);
      }
    }

    // Print final index list
    const final = await coll.listIndexes().toArray();
    console.log('Final indexes:');
    console.log(JSON.stringify(final, null, 2));
  } catch (err) {
    console.error('Error in safeApplyIndexes:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

run();
