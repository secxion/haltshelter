const express = require('express');
const NotificationSettings = require('../models/NotificationSettings');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get notification settings (per user or global)
router.get('/', authenticate, async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ userId: req.user.id }) || await NotificationSettings.findOne({ userId: null });
    if (!settings) settings = await NotificationSettings.create({ userId: req.user.id });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update notification settings
router.put('/', authenticate, async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne({ userId: req.user.id });
    if (!settings) settings = await NotificationSettings.create({ userId: req.user.id });
    settings.email = req.body.email ?? settings.email;
    settings.system = req.body.system ?? settings.system;
    settings.updatedAt = new Date();
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

module.exports = router;
