const express = require('express');
const router = express.Router();
const { Stats } = require('../models');

router.get('/dashboard', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard statistics...');

    let adminStats = null;
    try {
      adminStats = await Stats.getCurrentStats();
      console.log('📊 Admin stats loaded:', JSON.stringify(adminStats, null, 2));
    } catch (err) {
      console.log('⚠️ Could not read Stats:', err.message);
    }

    const response = {
      success: true,
      stats: {
        animalsRescued: adminStats?.animalsRescued ?? 0,
        adoptionsThisMonth: adminStats?.adoptionsThisMonth ?? 0,
        activeVolunteers: adminStats?.activeVolunteers ?? 0,
        livesTransformed: adminStats?.livesTransformed ?? 0,
        
        // Meta info
        lastUpdated: adminStats?.lastUpdated ?? new Date().toISOString()
      }
    };

    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      details: error.message
    });
  }
});

module.exports = router;
