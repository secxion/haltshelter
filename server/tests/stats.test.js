/* eslint-env mocha */
const assert = require('assert');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../db');
const Animal = require('../models/Animal');
const request = require('supertest');
let app;

describe('GET /api/stats/dashboard', function() {
  before(async function() {
    this.timeout(10000);
    const connected = await connectDB();
    if (!connected) throw new Error('DB not connected');
    app = require('../app');
  });

  after(async function() {
    // Cleanup test data (remove any animals we created with name starting with TEST_)
    await Animal.deleteMany({ name: /^TEST_/ });
    mongoose.connection.close();
  });

  it('should count adoptionsThisMonth based on adoptionDate', async function() {
    // Create a test adopted animal with adoptionDate = now
    const now = new Date();
    const testAnimal = new Animal({
      name: 'TEST_AdoptedNow',
      species: 'Dog',
      status: 'Adopted',
      adoptionDate: now
    });
    await testAnimal.save();

    const res = await request(app).get('/api/stats/dashboard');
    assert.equal(res.status, 200);
    const stats = res.body.stats;
    // adoptionsThisMonth should be a number and at least 1
    assert.ok(typeof stats.adoptionsThisMonth === 'number');
    assert.ok(stats.adoptionsThisMonth >= 1);
  });
});
