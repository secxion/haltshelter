const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const router = express.Router();

console.log('🔐 Admin auth router initialized');

// Test route
router.get('/test', (req, res) => {
  console.log('🧪 Test route hit');
  res.json({ message: 'Admin auth router is working!' });
});

// Admin key authentication endpoint
router.post('/admin-login', async (req, res) => {
  console.log('🔑 Admin login attempt received');
  try {
    const { adminKey } = req.body;

    if (!adminKey) {
      return res.status(400).json({ error: 'Admin key is required' });
    }

    // Read the stored admin key
    const keyFilePath = path.join(__dirname, '../admin-key.json');
    
    if (!fs.existsSync(keyFilePath)) {
      return res.status(500).json({ error: 'Admin key not configured. Please run set-admin-key.js first.' });
    }

    const keyData = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    
    if (adminKey !== keyData.adminKey) {
      return res.status(401).json({ error: 'Invalid admin key' });
    }

    // Generate JWT token for the admin session
    const token = jwt.sign(
      { 
        id: 'admin-user',
        role: 'admin',
        type: 'admin-key-auth'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: 'admin-user',
        email: 'admin@haltshelter.org',
        name: 'HALT Admin',
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin key login error:', error);
    res.status(500).json({ error: 'Server error during admin authentication' });
  }
});

module.exports = router;
