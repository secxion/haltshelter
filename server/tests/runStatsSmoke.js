/*
  Lightweight smoke test for /api/stats/dashboard without mocha/supertest.
  Usage: node server/tests/runStatsSmoke.js
*/
const url = require('url');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const connectDB = require('../db');
const Animal = require('../models/Animal');

async function main() {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  const parsed = url.parse(serverUrl);

  // Connect DB
  const connected = await connectDB();
  if (!connected) {
    console.error('DB not connected');
    process.exit(2);
  }

  // Create test animal
  const now = new Date();
  const testAnimal = new Animal({
    name: `TEST_Smoke_${Date.now()}`,
    species: 'Dog',
    status: 'Adopted',
    adoptionDate: now
  });

  await testAnimal.save();
  console.log('Created test animal', testAnimal._id.toString());

  // Fetch dashboard
  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: '/api/stats/dashboard',
    method: 'GET'
  };

  const lib = parsed.protocol === 'https:' ? require('https') : require('http');

  const req = lib.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', async () => {
      try {
        const body = JSON.parse(data);
        const stats = body.stats || {};
        console.log('dashboard stats:', stats);
        const ok = typeof stats.adoptionsThisMonth === 'number' && stats.adoptionsThisMonth >= 1;
        if (ok) {
          console.log('SMOKE TEST PASS: adoptionsThisMonth >= 1');
          await Animal.deleteOne({ _id: testAnimal._id });
          process.exit(0);
        } else {
          console.error('SMOKE TEST FAIL: adoptionsThisMonth not as expected');
          await Animal.deleteOne({ _id: testAnimal._id });
          process.exit(1);
        }
      } catch (err) {
        console.error('SMOKE TEST ERROR: failed to parse response or assert', err.message);
        await Animal.deleteOne({ _id: testAnimal._id });
        process.exit(3);
      }
    });
  });

  req.on('error', async (err) => {
    console.error('Request error:', err.message);
    await Animal.deleteOne({ _id: testAnimal._id });
    process.exit(4);
  });

  req.end();
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(5);
});
