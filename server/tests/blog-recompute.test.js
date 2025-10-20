/* eslint-env mocha */
const assert = require('assert');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../db');
const Blog = require('../models/Blog');
const BlogLike = require('../models/BlogLike');
const request = require('supertest');
let app;

describe('Admin recompute likes', function() {
  before(async function() {
    this.timeout(10000);
    const connected = await connectDB();
    if (!connected) throw new Error('DB not connected');
    app = require('../app');
  });

  after(async function() {
    // Cleanup test blogs and likes
    await Blog.deleteMany({ title: /^TEST_/ });
    await BlogLike.deleteMany({});
    mongoose.connection.close();
  });

  it('should recompute likes correctly when called by admin', async function() {
    this.timeout(20000);

  // Ensure no leftover likes from previous runs
  await BlogLike.deleteMany({});

  // Create a blog
    const blog = new Blog({
      title: `TEST_Recompute_${Date.now()}`,
      excerpt: 'test excerpt',
      content: 'test content',
      category: 'announcements',
      author: { name: 'Test Author', email: 'test@example.com' },
      status: 'published'
    });
    await blog.save();

    // Create two BlogLike documents for this blog
    await BlogLike.create({ blogId: blog._id, ipHash: 'a' });
    await BlogLike.create({ blogId: blog._id, ipHash: 'b' });

    // Create another blog with zero likes
    const blog2 = new Blog({
      title: `TEST_Recompute_Zero_${Date.now()}`,
      excerpt: 'test excerpt',
      content: 'test content',
      category: 'announcements',
      author: { name: 'Test Author', email: 'test@example.com' },
      status: 'published'
    });
    await blog2.save();

    // Login using admin-key endpoint (default stored key fallback in app.js is 'test123')
    const adminLogin = await request(app).post('/api/admin-auth/admin-login').send({ adminKey: 'test123' });
    assert.equal(adminLogin.status, 200);
    assert.ok(adminLogin.body.token, 'Expected admin token');
    const token = adminLogin.body.token;

    // Call recompute endpoint
    const res = await request(app).post('/api/blog/admin/recompute-likes').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Refresh blog and assert likes === 2
    const refreshed = await Blog.findById(blog._id).select('likes').lean();
    assert.equal(refreshed.likes, 2);

    // Ensure blog2 has likes === 0
    const refreshed2 = await Blog.findById(blog2._id).select('likes').lean();
    assert.equal(refreshed2.likes, 0);
  });
});
