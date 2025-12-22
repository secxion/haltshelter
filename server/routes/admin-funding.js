const express = require('express');
const router = express.Router();
const { FundingNeed, Stats } = require('../models');
const { authenticate } = require('../middleware/auth');

// ============ FUNDING NEEDS MANAGEMENT ============

// GET /api/admin/funding-needs - Get all funding needs (including inactive)
router.get('/funding-needs', authenticate, async (req, res) => {
  try {
    const fundingNeeds = await FundingNeed.find()
      .sort({ isActive: -1, type: 1, priority: -1, createdAt: -1 })
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

// POST /api/admin/funding-needs - Create new funding need
router.post('/funding-needs', authenticate, async (req, res) => {
  try {
    const { title, description, goalAmount, currentAmount, type, isActive, priority, animalId } = req.body;
    
    const fundingNeed = new FundingNeed({
      title,
      description,
      goalAmount,
      currentAmount: currentAmount || 0,
      type: type || 'regular',
      isActive: isActive !== false,
      priority: priority || 0,
      animalId: animalId || null,
      createdBy: req.user?._id || 'admin'
    });
    
    await fundingNeed.save();
    
    res.status(201).json({
      success: true,
      fundingNeed
    });
  } catch (error) {
    console.error('Error creating funding need:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create funding need'
    });
  }
});

// PUT /api/admin/funding-needs/:id - Update funding need
router.put('/funding-needs/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fundingNeed = await FundingNeed.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!fundingNeed) {
      return res.status(404).json({
        success: false,
        error: 'Funding need not found'
      });
    }
    
    res.json({
      success: true,
      fundingNeed
    });
  } catch (error) {
    console.error('Error updating funding need:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update funding need'
    });
  }
});

// DELETE /api/admin/funding-needs/:id - Delete funding need
router.delete('/funding-needs/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const fundingNeed = await FundingNeed.findByIdAndDelete(id);
    
    if (!fundingNeed) {
      return res.status(404).json({
        success: false,
        error: 'Funding need not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Funding need deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting funding need:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete funding need'
    });
  }
});

// ============ IMPACT STATS MANAGEMENT ============

// GET /api/admin/impact-stats - Get current impact stats
router.get('/impact-stats', authenticate, async (req, res) => {
  try {
    const stats = await Stats.getCurrentStats();
    
    res.json({
      success: true,
      stats: {
        rescuedThisMonth: stats.rescuedThisMonth || 0,
        adoptionsThisMonth: stats.adoptionsThisMonth || 0,
        medicalTreatments: stats.medicalTreatments || 0,
        spayNeuterCount: stats.spayNeuterCount || 0,
        // Also include homepage stats
        animalsRescued: stats.animalsRescued || 0,
        activeVolunteers: stats.activeVolunteers || 0,
        livesTransformed: stats.livesTransformed || 0,
        lastUpdated: stats.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error fetching impact stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch impact stats'
    });
  }
});

// PUT /api/admin/impact-stats - Update impact stats
router.put('/impact-stats', authenticate, async (req, res) => {
  try {
    const {
      rescuedThisMonth,
      adoptionsThisMonth,
      medicalTreatments,
      spayNeuterCount,
      animalsRescued,
      activeVolunteers,
      livesTransformed
    } = req.body;
    
    let stats = await Stats.findOne();
    
    if (!stats) {
      stats = new Stats();
    }
    
    // Update only provided fields
    if (rescuedThisMonth !== undefined) stats.rescuedThisMonth = rescuedThisMonth;
    if (adoptionsThisMonth !== undefined) stats.adoptionsThisMonth = adoptionsThisMonth;
    if (medicalTreatments !== undefined) stats.medicalTreatments = medicalTreatments;
    if (spayNeuterCount !== undefined) stats.spayNeuterCount = spayNeuterCount;
    if (animalsRescued !== undefined) stats.animalsRescued = animalsRescued;
    if (activeVolunteers !== undefined) stats.activeVolunteers = activeVolunteers;
    if (livesTransformed !== undefined) stats.livesTransformed = livesTransformed;
    
    stats.lastUpdated = new Date();
    stats.updatedBy = req.user?._id || 'admin';
    
    await stats.save();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error updating impact stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update impact stats'
    });
  }
});

module.exports = router;
