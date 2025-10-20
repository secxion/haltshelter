#!/usr/bin/env node
// One-off migration script to drop legacy BlogLike indexes and (re)create
// the partial/type-based unique indexes and TTL index. Run manually in a
// controlled environment (dev/staging/prod) with NODE_ENV set appropriately.

const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const BlogLike = require('../models/BlogLike');

const readline = require('readline');

async function connect(mongoUri) {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function doMigration({ dryRun = false, backup = false } = {}) {
  const coll = mongoose.connection.collection('bloglikes');
  const existing = await coll.indexes();
  console.log('Existing indexes:', existing.map(i => i.name));

  const legacyNames = ['blogId_1_userId_1', 'blogId_1_ipHash_1', 'createdAt_1'];
  const toDrop = legacyNames.filter(name => existing.find(e => e.name === name));

  if (toDrop.length === 0) {
    console.log('No legacy indexes found to drop. Proceeding to ensure desired indexes.');
  } else {
    console.log('Legacy indexes discovered that would be dropped:', toDrop);
  }

  if (dryRun) {
    console.log('[dry-run] Would drop or rename these legacy indexes:', toDrop);
    console.log('[dry-run] Would then create desired indexes from the schema (skipping equivalents)');
    return;
  }

  // Either backup (rename) or drop legacy indexes if present
  for (const name of toDrop) {
    try {
      if (backup) {
        // MongoDB does not support renaming indexes directly. We emulate a backup by
        // creating a duplicate index with a backup-prefixed name matching the same key
        // spec. We fetch the index spec and create a new index with the same key and
        // options but a different name. This leaves the original index in place.
        const idx = existing.find(e => e.name === name);
        if (idx) {
          const keys = idx.key || {};
          // prefer backup_<name>, but if it already exists, use a timestamped backup name
          let backupName = `backup_${name}`;
          if (existing.find(e => e.name === backupName)) {
            const ts = Date.now();
            backupName = `backup_${name}_${ts}`;
          }
          const options = { name: backupName };
          // Preserve unique/partialFilterExpression/expireAfterSeconds where possible
          if (idx.unique) options.unique = true;
          if (idx.partialFilterExpression) options.partialFilterExpression = idx.partialFilterExpression;
          if (idx.expireAfterSeconds !== undefined) options.expireAfterSeconds = idx.expireAfterSeconds;

          console.log('Creating backup index', backupName, 'for', name);
          // createIndex may throw if an equivalent index already exists under another name
          try {
            await coll.createIndex(keys, options);
            console.log('Created backup index', backupName);
          } catch (createErr) {
            console.warn('Failed to create backup index', backupName, '— maybe equivalent index exists:', createErr.message || createErr);
          }
        } else {
          console.warn('Index spec not found for', name, '— skipping backup');
        }
      } else {
        console.log('Dropping legacy index', name);
        await coll.dropIndex(name);
        console.log('Dropped', name);
      }
    } catch (err) {
      console.warn('Failed to drop/backup index', name, err.message || err);
    }
  }

  console.log('Creating desired indexes from schema (skipping equivalents)');
  // Create desired indexes one-by-one while comparing against existing indexes
  try {
    const desired = BlogLike.schema.indexes(); // [ [keys], [options] ]
    const existingIndexes = await coll.indexes();

    function normalizeKey(obj) {
      // return stable JSON for key spec ordering
      return JSON.stringify(Object.keys(obj).sort().reduce((acc, k) => { acc[k] = obj[k]; return acc; }, {}));
    }

    function isEquivalent(existingIdx, keys, opts) {
      try {
        const ek = existingIdx.key || {};
        if (normalizeKey(ek) !== normalizeKey(keys)) return false;
        // Compare some important options
        const eqUnique = !!existingIdx.unique === !!opts.unique;
        const eqPartial = JSON.stringify(existingIdx.partialFilterExpression || {}) === JSON.stringify(opts.partialFilterExpression || {});
        const eqExpire = (existingIdx.expireAfterSeconds || null) === (opts.expireAfterSeconds || null);
        return eqUnique && eqPartial && eqExpire;
      } catch (e) {
        return false;
      }
    }

    for (const [keys, opts] of desired) {
      const desiredName = opts && opts.name ? opts.name : Object.keys(keys).map(k => `${k}_${keys[k]}`).join('_');
      // If an equivalent index exists under any name, skip creation
      const already = existingIndexes.find(e => isEquivalent(e, keys, opts));
      if (already) {
        console.log('Skipping creation of desired index (equivalent exists):', already.name);
        continue;
      }

      // If a same-name index exists but with different spec, choose a timestamped name
      let createOptions = Object.assign({}, opts || {});
      if (existingIndexes.find(e => e.name === desiredName && !isEquivalent(e, keys, opts))) {
        const ts = Date.now();
        createOptions.name = `${desiredName}_${ts}`;
        console.log('Index name collision detected for', desiredName, '- will create with timestamped name', createOptions.name);
      } else if (!createOptions.name) {
        // ensure a name is present to avoid Mongo choosing a generated name that may collide
        createOptions.name = desiredName;
      }

      if (dryRun) {
        console.log('[dry-run] Would create index', createOptions.name, 'keys:', keys, 'options:', createOptions);
        continue;
      }

      try {
        await coll.createIndex(keys, createOptions);
        console.log('Created index', createOptions.name);
      } catch (err) {
        console.warn('Failed to create index', createOptions.name, err.message || err);
      }
    }

    console.log('Done. Current indexes:', (await coll.indexes()).map(i => i.name));
  } catch (err) {
    console.error('Error creating indexes from schema:', err.message || err);
  }
}

async function promptYesNo(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

async function migrate() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/haltshelter';
  const argv = require('yargs/yargs')(process.argv.slice(2)).options({
    'dry-run': { type: 'boolean', default: false },
    yes: { type: 'boolean', alias: 'y', default: false },
    backup: { type: 'boolean', default: false, describe: 'Create backup indexes instead of dropping legacy indexes' }
  }).argv;

  console.log('Connecting to', mongoUri);
  await connect(mongoUri);

  try {
    if (argv['dry-run']) {
      console.log('Running in dry-run mode. No changes will be performed.');
      await doMigration({ dryRun: true });
      return;
    }

    if (!argv.yes) {
      const confirm = await promptYesNo('This will DROP legacy indexes if present and create new indexes. Continue?');
      if (!confirm) {
        console.log('Aborted by user. No changes made.');
        return;
      }
    }

  await doMigration({ dryRun: false, backup: !!argv.backup });
  } catch (err) {
    console.error('Migration error:', err.message || err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
