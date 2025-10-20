const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get current admin key (read-only, admin only)
router.get('/', authenticate, authorize('admin'), (req, res) => {
  try {
    const keyFilePath = path.join(__dirname, '../admin-key.json');
    if (!fs.existsSync(keyFilePath)) {
      return res.status(404).json({ error: 'Admin key not found' });
    }
    const keyData = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    res.json({ adminKey: keyData.adminKey, createdAt: keyData.createdAt, description: keyData.description });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin key' });
  }
});

module.exports = router;
