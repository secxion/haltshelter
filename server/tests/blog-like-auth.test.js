/* eslint-env mocha */
const assert = require('assert');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../db');
const Blog = require('../models/Blog');
const User = require('../models/User');
const request = require('supertest');
let app;

describe('Authenticated like/unlike', function() {
  before(async function() {
    this.timeout(10000);
    const connected = await connectDB();
    if (!connected) throw new Error('DB not connected');
    app = require('../app');
  });

  after(async function() {
    // Cleanup test users and blogs
      await User.deleteMany({ email: /test-user-.*@example.com/ });
    await Blog.deleteMany({ title: /^TEST_AUTH_/ });
    mongoose.connection.close();
  });

  it('should allow an authenticated user to like and unlike a blog', async function() {
    this.timeout(15000);

    // Create test user via registration endpoint with a unique email
      const testEmail = `test-user-${Date.now()}@example.com`;
    const registerRes = await request(app).post('/api/auth/register').send({
      email: testEmail,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    assert.equal(registerRes.status, 201);
    assert.ok(registerRes.body.token);
    const token = registerRes.body.token;

    // Create a blog
    const blog = new Blog({
      title: `TEST_AUTH_${Date.now()}`,
      excerpt: 'auth test excerpt',
      content: 'auth test content',
      category: 'announcements',
      author: { name: 'Auth Test', email: 'auth@test' },
      status: 'published'
    });
    await blog.save();

    // Like the blog
    const likeRes = await request(app)
      .post(`/api/blog/${blog._id}/like`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    assert.equal(likeRes.status, 200);
    assert.equal(likeRes.body.success, true);
    assert.equal(likeRes.body.added, true);
    const likesAfterLike = likeRes.body.likes;

    // Unlike (toggle) the blog
    const unlikeRes = await request(app)
      .post(`/api/blog/${blog._id}/like`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    assert.equal(unlikeRes.status, 200);
    assert.equal(unlikeRes.body.success, true);
    assert.equal(unlikeRes.body.removed, true);
    assert.equal(unlikeRes.body.added, false);
    assert.equal(unlikeRes.body.likes, likesAfterLike - 1);
  });
});
