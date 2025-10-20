#!/usr/bin/env node
const { MongoClient } = require('mongodb');
require('dotenv').config();

function normalizeIndexSpec(ix) {
  const spec = {
    key: ix.key,
    unique: !!ix.unique,
    sparse: !!ix.sparse,
    partialFilterExpression: ix.partialFilterExpression || null,
    expireAfterSeconds: ix.expireAfterSeconds || null
  };
  return spec;
}

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/haltshelter';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const dbName = uri.split('/').pop().split('?')[0] || 'haltshelter';
    const db = client.db(dbName);
    const coll = db.collection('bloglikes');

    const indexes = await coll.indexes();
    const normalized = indexes.map(ix => ({ name: ix.name, spec: normalizeIndexSpec(ix) }));

    // Desired specs
    const desired = [
      { key: { blogId: 1, userId: 1 }, unique: true, partialFilterExpression: { userId: { $type: 'objectId' } } },
      { key: { blogId: 1, ipHash: 1 }, unique: true, partialFilterExpression: { ipHash: { $type: 'string' } } },
      { key: { createdAt: 1 }, unique: false, partialFilterExpression: { ipHash: { $type: 'string' } }, expireAfterSeconds: 7776000 }
    ];

    function matchesDesired(ixSpec, desiredSpec) {
      // Compare keys
      if (JSON.stringify(ixSpec.key) !== JSON.stringify(desiredSpec.key)) return false;
      if (!!ixSpec.unique !== !!desiredSpec.unique) return false;
      if (('expireAfterSeconds' in desiredSpec) && (ixSpec.expireAfterSeconds !== desiredSpec.expireAfterSeconds)) return false;
      // Partial filter: compare JSON
      if (JSON.stringify(ixSpec.partialFilterExpression) !== JSON.stringify(desiredSpec.partialFilterExpression)) return false;
      return true;
    }

    const missing = [];
    for (const d of desired) {
      const found = normalized.find(n => matchesDesired(n.spec, d));
      if (!found) missing.push(d);
    }

    if (missing.length === 0) {
      console.log('All desired indexes present and equivalent.');
      process.exitCode = 0;
    } else {
      console.log('Missing or non-equivalent desired indexes:', JSON.stringify(missing, null, 2));
      process.exitCode = 3;
    }
  } catch (err) {
    console.error('Error checking indexes:', err);
    process.exitCode = 2;
  } finally {
    await client.close();
  }
}

run();
