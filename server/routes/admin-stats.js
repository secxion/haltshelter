const Stats = require('../models/Stats');
const { authenticate, authorize } = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// Get current stats
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = await Stats.getCurrentStats();
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

// Update stats (admin only)
router.put('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { animalsRescued, adoptionsThisMonth, activeVolunteers, livesTransformed } = req.body;
    
    // Get current stats or create new if none exist
    let stats = await Stats.getCurrentStats();
    
    // Update only provided fields
    if (typeof animalsRescued === 'number') stats.animalsRescued = animalsRescued;
    if (typeof adoptionsThisMonth === 'number') stats.adoptionsThisMonth = adoptionsThisMonth;
    if (typeof activeVolunteers === 'number') stats.activeVolunteers = activeVolunteers;
    if (typeof livesTransformed === 'number') stats.livesTransformed = livesTransformed;
    
    stats.lastUpdated = new Date();
    // Handle both regular users (with _id) and admin users (with id)
    stats.updatedBy = req.user._id || req.user.id;
    
    await stats.save();
    
    res.json({ stats });
  } catch (error) {
    console.error('Error updating stats:', error);
    
    // Send more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Invalid stats data',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      error: 'Error updating stats',
      message: error.message
    });
  }
});

module.exports = router;