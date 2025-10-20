const express = require('express');
const router = express.Router();
const { Story, Blog, Volunteer, Donation, Animal } = require('../models');
const OrganizationSettings = require('../models/OrganizationSettings');

router.get('/dashboard', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard statistics...');

    let stats = {
      stories: 0,
      blogs: 0,
      volunteers: 0,
      donations: 0,
      animals: 0,
      revenue: 0
    };

    try {
      const storyCount = await Story.countDocuments({ isPublished: true });
      stats.stories = storyCount;
      console.log(`📖 Stories: ${storyCount}`);
    } catch (error) {
      console.log('⚠️ Stories count error:', error.message);
    }

    try {
      const blogCount = await Blog.countDocuments({ status: 'published' });
      stats.blogs = blogCount;
      console.log(`📝 Blogs: ${blogCount}`);
    } catch (error) {
      console.log('⚠️ Blogs count error:', error.message);
    }

    try {
      const volunteerCount = await Volunteer.countDocuments();
      stats.volunteers = volunteerCount;
      console.log(`👥 Volunteers: ${volunteerCount}`);
    } catch (error) {
      console.log('⚠️ Volunteers count error:', error.message);
    }

    try {
      const donations = await Donation.find({ paymentStatus: 'completed' });
      stats.donations = donations.length;
      stats.revenue = donations.reduce((total, donation) => total + (donation.amount || 0), 0);
      console.log(`💰 Donations: ${stats.donations}, Revenue: $${stats.revenue}`);
    } catch (error) {
      console.log('⚠️ Donations count error:', error.message);
    }

    try {
      const animalCount = await Animal.countDocuments({ 
        status: { $ne: 'Adopted' } 
      });
      stats.animals = animalCount;    
      console.log(`🐾 Animals in Care: ${animalCount}`);
    } catch (error) {
      console.log('⚠️ Animals count error:', error.message);
    }

      try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const adoptionsThisMonth = await Animal.countDocuments({
          status: 'Adopted',
          adoptionDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        });
        stats.adoptionsThisMonth = adoptionsThisMonth;
        console.log(`📅 Adoptions This Month: ${adoptionsThisMonth}`);
      } catch (error) {
        console.log('⚠️ Adoptions this month count error:', error.message);
      }

    const response = {
      success: true,
      stats,
      lastUpdated: new Date().toISOString()
    };

    try {
      const org = await OrganizationSettings.findOne();
      if (org && typeof org.animalsRescued === 'number') {
        response.stats.animalsRescued = org.animalsRescued;
        console.log(`🐾 Global animalsRescued: ${org.animalsRescued}`);
      }
    } catch (err) {
      console.log('⚠️ Could not read OrganizationSettings.animalsRescued:', err.message);
    }

    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
    console.log('✅ Dashboard stats calculated successfully');
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

    // Recent stories
    try {
      const recentStories = await Story.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title slug category image createdAt');
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

    // Recent donations
    try {
      const recentDonations = await Donation.find({ status: 'succeeded' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('amount donorEmail donationType createdAt');
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
