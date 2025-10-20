#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const connectDB = require('../db');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const BlogLike = require('../models/BlogLike');

async function recompute() {
  const ok = await connectDB();
  if (!ok) {
    console.error('DB not connected');
    process.exit(1);
  }

  try {
    const blogs = await Blog.find().select('_id');
    console.log(`Recomputing likes for ${blogs.length} blogs...`);

    for (const b of blogs) {
      const count = await BlogLike.countDocuments({ blogId: b._id });
      await Blog.findByIdAndUpdate(b._id, { likes: count }, { new: true });
      console.log(`Blog ${b._id}: set likes=${count}`);
    }

    console.log('Recompute complete');
    process.exit(0);
  } catch (err) {
    console.error('Recompute error:', err);
    process.exit(1);
  }
}

recompute();
