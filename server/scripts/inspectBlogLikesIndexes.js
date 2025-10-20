#!/usr/bin/env node
// Small helper to list indexes on the bloglikes collection using env-provided MONGO_URI
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
    console.log('Listing indexes for', `${dbName}.bloglikes`);
    const cursor = coll.listIndexes();
    const indexes = await cursor.toArray();
    console.log(JSON.stringify(indexes, null, 2));
  } catch (err) {
    console.error('Error listing indexes:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

run();
