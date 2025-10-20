const express = require('express');
const router = express.Router();

console.log('🔐 SIMPLE Admin auth router loaded');

// Simple test route
router.get('/test', (req, res) => {
  console.log('🧪 SIMPLE Test route hit!');
  res.json({ message: 'Simple admin auth working!', timestamp: new Date().toISOString() });
});

// Simple admin login
router.post('/admin-login', (req, res) => {
  console.log('🔑 SIMPLE Admin login hit!', req.body);
  res.json({ success: true, message: 'Simple login working!' });
});

module.exports = router;
