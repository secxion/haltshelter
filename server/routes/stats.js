const express = require('express');
const router = express.Router();
const { Story, Blog, Volunteer, Donation, Animal, Stats } = require('../models');

router.get('/dashboard', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard statistics...');

    // Load any admin-overridden stats (optional)
    let adminStats = null;
    try {
      adminStats = await Stats.getCurrentStats();
      console.log('📊 Admin stats loaded:', JSON.stringify(adminStats, null, 2));
    } catch (err) {
      console.log('⚠️ Could not read Stats (continuing with calculated values):', err.message);
    }

    // Calculate counts with sensible filters so the dashboard reflects real values.
    const storiesCount = await Story.countDocuments({ isPublished: true }).catch(() => 0);

    // Animals in care: include animals that are currently not adopted (Available, Medical Hold, Pending, Foster)
    const inCareStatuses = ['Available', 'Medical Hold', 'Pending', 'Foster'];
    const animalsCount = await Animal.countDocuments({ status: { $in: inCareStatuses } }).catch(() => 0);

    // Donations: count only completed payments (use paymentStatus field)
    const donationsCount = await Donation.countDocuments({ paymentStatus: 'completed' }).catch(() => 0);

    // Adoptions this month (based on adoptionDate)
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const adoptionsThisMonth = await Animal.countDocuments({
      status: 'Adopted',
      adoptionDate: { $gte: monthStart }
    }).catch(() => 0);

    // Volunteers: prefer admin-managed value if provided, otherwise count approved volunteers
    let volunteersCount = adminStats?.activeVolunteers;
    if (typeof volunteersCount !== 'number') {
      volunteersCount = await Volunteer.countDocuments({ applicationStatus: 'approved' }).catch(() => 0);
    }

    const response = {
      success: true,
      // Provide both the new/UI-friendly keys and legacy/admin-managed keys for backward compatibility
      stats: {
        // UI-friendly
        stories: storiesCount,
        animals: animalsCount,
        volunteers: volunteersCount,
        donations: donationsCount,
        adoptionsThisMonth,

        // Legacy/admin-managed fields (if present)
        animalsRescued: adminStats?.animalsRescued ?? undefined,
        adoptionsThisMonth: adminStats?.adoptionsThisMonth ?? adoptionsThisMonth,
        activeVolunteers: adminStats?.activeVolunteers ?? undefined,
        livesTransformed: adminStats?.livesTransformed ?? undefined,

        lastUpdated: adminStats?.lastUpdated ?? new Date().toISOString()
      }
    };

    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    return res.json(response);

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      details: error.message
    });
  }
});

// GET /api/stats/impact - Get impact stats for donate page
router.get('/impact', async (req, res) => {
  try {
    const adminStats = await Stats.getCurrentStats();
    
    res.json({
      success: true,
      impact: {
        rescuedThisMonth: adminStats?.rescuedThisMonth ?? 0,
        adoptionsThisMonth: adminStats?.adoptionsThisMonth ?? 0,
        medicalTreatments: adminStats?.medicalTreatments ?? 0,
        spayNeuterCount: adminStats?.spayNeuterCount ?? 0,
        lastUpdated: adminStats?.lastUpdated ?? new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching impact stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch impact statistics'
    });
  }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    console.log('📈 Fetching recent activity...');

    const activity = {
      recentStories: [],
      recentBlogs: [],
      recentVolunteers: [],
      recentDonations: []
    };

    // Recent stories (published)
    try {
      const recentStories = await Story.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title slug category featuredImage createdAt');
      activity.recentStories = recentStories;
    } catch (error) {
      console.log('⚠️ Recent stories error:', error.message);
    }

    // Recent blogs
    try {
      const recentBlogs = await Blog.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title slug category image createdAt');
      activity.recentBlogs = recentBlogs;
    } catch (error) {
      console.log('⚠️ Recent blogs error:', error.message);
    }

    // Recent volunteers
    try {
      const recentVolunteers = await Volunteer.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('personalInfo.firstName personalInfo.lastName personalInfo.email applicationStatus createdAt');
      activity.recentVolunteers = recentVolunteers;
    } catch (error) {
      console.log('⚠️ Recent volunteers error:', error.message);
    }

    // Recent donations (completed payments)
    try {
      const recentDonations = await Donation.find({ paymentStatus: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('amount donorInfo donationType createdAt');
      activity.recentDonations = recentDonations;
    } catch (error) {
      console.log('⚠️ Recent donations error:', error.message);
    }

    res.json({
      success: true,
      activity,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity',
      details: error.message
    });
  }
});

module.exports = router;
