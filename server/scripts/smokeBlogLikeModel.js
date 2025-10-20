#!/usr/bin/env node
const mongoose = require('mongoose');
require('dotenv').config();
const BlogLike = require('../models/BlogLike');

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/haltshelter';
  console.log('Connecting to mongoose', uri.replace(/(\/\/[^@]+@)/, '//***REDACTED***@'));
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    const blogId = new mongoose.Types.ObjectId();
    console.log('Inserting test BlogLike with blogId', blogId.toHexString());
    const doc = await BlogLike.create({ blogId, ipHash: 'smoke-test-' + Date.now(), createdAt: new Date() });
    console.log('Inserted:', doc._id.toHexString());
    const found = await BlogLike.findOne({ _id: doc._id }).lean();
    console.log('Found doc:', !!found);
    const count = await BlogLike.countDocuments({ blogId });
    console.log('Count by blogId:', count);
    await BlogLike.deleteOne({ _id: doc._id });
    console.log('Deleted test doc');
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

run();
