const express = require('express');
const router = express.Router();
const { FundingNeed } = require('../models');

// GET /api/funding-needs - Get all active funding needs (public)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = { isActive: true };
    if (type && ['emergency', 'regular'].includes(type)) {
      query.type = type;
    }
    
    const fundingNeeds = await FundingNeed.find(query)
      .sort({ type: 1, priority: -1, createdAt: -1 })
      .populate('animalId', 'name imageUrl');
    
    res.json({
      success: true,
      fundingNeeds
    });
  } catch (error) {
    console.error('Error fetching funding needs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch funding needs'
    });
  }
});

// GET /api/funding-needs/emergency - Get emergency funding needs only
router.get('/emergency', async (req, res) => {
  try {
    const fundingNeeds = await FundingNeed.getActiveByType('emergency');
    
    res.json({
      success: true,
      fundingNeeds
    });
  } catch (error) {
    console.error('Error fetching emergency funding needs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emergency funding needs'
    });
  }
});

// GET /api/funding-needs/regular - Get regular funding needs only
router.get('/regular', async (req, res) => {
  try {
    const fundingNeeds = await FundingNeed.getActiveByType('regular');
    
    res.json({
      success: true,
      fundingNeeds
    });
  } catch (error) {
    console.error('Error fetching regular funding needs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regular funding needs'
    });
  }
});

module.exports = router;
