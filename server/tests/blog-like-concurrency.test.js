/* eslint-env mocha */
const assert = require('assert');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../db');
const Blog = require('../models/Blog');
const request = require('supertest');
let app;

describe('Concurrency: POST /api/blog/:id/like', function() {
  before(async function() {
    this.timeout(10000);
    const connected = await connectDB();
    if (!connected) throw new Error('DB not connected');
    app = require('../app');
  });

  after(async function() {
    await Blog.deleteMany({ title: /^TEST_/ });
    mongoose.connection.close();
  });

  it('should result in a single like when multiple concurrent requests from same IP occur', async function() {
    this.timeout(20000);

    const blog = new Blog({
      title: `TEST_Concurrency_${Date.now()}`,
      excerpt: 'test excerpt',
      content: 'test content',
      category: 'announcements',
      author: { name: 'Test Author', email: 'test@example.com' },
      status: 'published'
    });
    await blog.save();

    // Fire 10 concurrent requests from the same IP
    const concurrency = 10;
    const ip = '203.0.113.9';
    const promises = [];
    for (let i = 0; i < concurrency; i++) {
      promises.push(request(app).post(`/api/blog/${blog._id}/like`).set('X-Forwarded-For', ip));
    }

    const results = await Promise.all(promises);
    results.forEach(r => {
      assert.equal(r.status, 200);
      assert.equal(r.body.success, true);
    });

    // Fetch blog and ensure likes is exactly 1
    const refreshed = await Blog.findById(blog._id).select('likes').lean().exec();
    assert.equal(refreshed.likes, 1);
  });
});
