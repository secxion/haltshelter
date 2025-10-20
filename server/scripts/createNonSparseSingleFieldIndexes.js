#!/usr/bin/env node
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/haltshelter';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const dbName = uri.split('/').pop().split('?')[0] || 'haltshelter';
    const db = client.db(dbName);
    const coll = db.collection('bloglikes');

    const fields = ['blogId', 'userId', 'ipHash'];
    for (const field of fields) {
      const key = { [field]: 1 };
      // Look for any existing non-sparse index with this key
      const indexes = await coll.indexes();
      const equivalent = indexes.find(ix => {
        const keysEqual = JSON.stringify(ix.key) === JSON.stringify(key);
        const isSparse = !!ix.sparse;
        return keysEqual && !isSparse;
      });

      if (equivalent) {
        console.log(`Non-sparse index already exists for ${field}: ${equivalent.name}`);
        continue;
      }

      // If a non-sparse index doesn't exist, create one with a safe new name
      const name = `${field}_1_nonsparse`;
      console.log(`Creating non-sparse index for ${field} as ${name} ...`);
      try {
        await coll.createIndex(key, { name, background: true });
        console.log(`Created index ${name}`);
      } catch (err) {
        console.error(`Failed to create index ${name}:`, err.message || err);
      }
    }
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

run();
