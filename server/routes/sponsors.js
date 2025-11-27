const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { Sponsor } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { logToFile } = require('../utils/fileLogger');

// Public: list sponsors (optional ?featured=true)
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    const filter = {};
    if (featured === 'true') filter.featured = true;
    const sponsors = await Sponsor.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json({ success: true, sponsors });
  } catch (err) {
    console.error('Get sponsors error:', err);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// Public: get single sponsor
router.get('/:id', async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) return res.status(404).json({ error: 'Sponsor not found' });
    res.json({ success: true, sponsor });
  } catch (err) {
    console.error('Get sponsor error:', err);
    res.status(500).json({ error: 'Failed to fetch sponsor' });
  }
});

// Admin: create sponsor
router.post('/',
  authenticate,
  authorize('admin','staff'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('logoUrl').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, website, logoUrl, featured = false, notes } = req.body;
      const sponsor = new Sponsor({ name, website, logoUrl, featured, notes });
      await sponsor.save();
      logToFile(`[SPONSOR] Created sponsor ${sponsor._id} by ${req.user?.id || 'unknown'}`);
      res.json({ success: true, sponsor });
    } catch (err) {
      console.error('Create sponsor error:', err);
      res.status(500).json({ error: 'Failed to create sponsor' });
    }
  }
);

// Admin: update sponsor
router.put('/:id', authenticate, authorize('admin','staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const sponsor = await Sponsor.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!sponsor) return res.status(404).json({ error: 'Sponsor not found' });
    logToFile(`[SPONSOR] Updated sponsor ${sponsor._id} by ${req.user?.id || 'unknown'}`);
    res.json({ success: true, sponsor });
  } catch (err) {
    console.error('Update sponsor error:', err);
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
});

// Admin: delete sponsor
router.delete('/:id', authenticate, authorize('admin','staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const sponsor = await Sponsor.findByIdAndDelete(id);
    if (!sponsor) return res.status(404).json({ error: 'Sponsor not found' });
    logToFile(`[SPONSOR] Deleted sponsor ${id} by ${req.user?.id || 'unknown'}`);
    res.json({ success: true, message: 'Sponsor deleted' });
  } catch (err) {
    console.error('Delete sponsor error:', err);
    res.status(500).json({ error: 'Failed to delete sponsor' });
  }
});

module.exports = router;
