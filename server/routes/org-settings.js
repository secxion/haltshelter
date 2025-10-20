const express = require('express');
const OrganizationSettings = require('../models/OrganizationSettings');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get organization settings
router.get('/', async (req, res) => {
  try {
    let org = await OrganizationSettings.findOne();
    if (!org) org = await OrganizationSettings.create({});
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch organization settings' });
  }
});

// Update organization settings (admin only)
router.put('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    let org = await OrganizationSettings.findOne();
    if (!org) org = await OrganizationSettings.create({});
    org.name = req.body.name || org.name;
    org.contact = req.body.contact || org.contact;
    org.address = req.body.address || org.address;
    org.logo = req.body.logo || org.logo;
    org.updatedAt = new Date();
    await org.save();
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update organization settings' });
  }
});

// Increment animals rescued (admin only)
router.post('/increment-animals', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Accept either a fixed amount or a range { min, max }
    const { amount, min = 1, max = 3 } = req.body || {};

    let increment = 0;
    if (typeof amount === 'number' && !isNaN(amount)) {
      increment = Math.max(0, Math.floor(amount));
    } else {
      // random integer between min and max inclusive
      const a = Math.max(0, Math.floor(min));
      const b = Math.max(a, Math.floor(max));
      increment = a + Math.floor(Math.random() * (b - a + 1));
    }

    let org = await OrganizationSettings.findOne();
    if (!org) org = await OrganizationSettings.create({});

    org.animalsRescued = (org.animalsRescued || 0) + increment;
    org.updatedAt = new Date();
    await org.save();

    res.json({ success: true, increment, animalsRescued: org.animalsRescued });
  } catch (err) {
    console.error('Failed to increment animals rescued:', err);
    res.status(500).json({ error: 'Failed to increment animals rescued' });
  }
});

module.exports = router;
