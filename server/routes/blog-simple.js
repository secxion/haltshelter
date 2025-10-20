const express = require('express');
const router = express.Router();

// Simple test route
router.get('/', (req, res) => {
  res.json({ message: 'Blog routes working!' });
});

router.get('/test', (req, res) => {
  res.json({ message: 'Blog test route working!' });
});

module.exports = router;
