const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const router = express.Router();

console.log('🔐 NEW Admin auth router initialized');

// Test route to verify router is working
router.get('/test', (req, res) => {
  console.log('🧪 NEW Test route hit successfully');
  res.json({ message: 'NEW Admin auth router is working!', timestamp: new Date().toISOString() });
});

// Admin key authentication endpoint
router.post('/admin-login', async (req, res) => {
  console.log('🔑 NEW Admin login attempt received:', req.body);
  
  try {
    const { adminKey } = req.body;

    if (!adminKey) {
      console.log('❌ No admin key provided');
      return res.status(400).json({ error: 'Admin key is required' });
    }

    // Read the stored admin key
    const keyFilePath = path.join(__dirname, '../admin-key.json');
    
    if (!fs.existsSync(keyFilePath)) {
      console.log('❌ Admin key file not found');
      return res.status(500).json({ error: 'Admin key not configured. Please run set-admin-key.js first.' });
    }

    const keyData = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    console.log('🔍 Comparing keys:', { provided: adminKey, stored: keyData.adminKey });
    
    if (adminKey !== keyData.adminKey) {
      console.log('❌ Invalid admin key provided');
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

    console.log('✅ Admin login successful');
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
    console.error('❌ Admin key login error:', error);
    res.status(500).json({ error: 'Server error during admin authentication' });
  }
});

module.exports = router;
