/* eslint-env mocha */
const assert = require('assert');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../db');
const Blog = require('../models/Blog');
const request = require('supertest');
let app;

describe('POST /api/blog/:id/like', function() {
  before(async function() {
    this.timeout(10000);
    const connected = await connectDB();
    if (!connected) throw new Error('DB not connected');
    app = require('../app');
  });

  after(async function() {
    // Cleanup test blogs
    await Blog.deleteMany({ title: /^TEST_/ });
    mongoose.connection.close();
  });

  it('should allow one anonymous like per ip (duplicate suppressed)', async function() {
    this.timeout(10000);

    const blog = new Blog({
      title: `TEST_Like_${Date.now()}`,
      excerpt: 'test excerpt',
      content: 'test content',
      category: 'announcements',
      author: { name: 'Test Author', email: 'test@example.com' },
      status: 'published'
    });
    await blog.save();

  const res1 = await request(app).post(`/api/blog/${blog._id}/like`).set('X-Forwarded-For', '203.0.113.5');
    assert.equal(res1.status, 200);
    assert.equal(res1.body.success, true);
    assert.equal(res1.body.added, true);
    assert.ok(typeof res1.body.likes === 'number');

  const res2 = await request(app).post(`/api/blog/${blog._id}/like`).set('X-Forwarded-For', '203.0.113.5');
    assert.equal(res2.status, 200);
    assert.equal(res2.body.success, true);
    // second attempt toggles (removes) the like for the same IP
    assert.equal(res2.body.added, false);
    assert.equal(res2.body.removed, true);
    assert.equal(res2.body.likes, res1.body.likes - 1);
  });
});
