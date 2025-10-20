const express = require('express');
const { body, validationResult } = require('express-validator');
const { NewsletterSubscriber } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Subscribe to newsletter (public endpoint)
router.post('/subscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('firstName').optional().trim().isLength({ min: 1 }).withMessage('First name must not be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, firstName, lastName, interests } = req.body;

    // Check if already subscribed
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(409).json({ error: 'Email already subscribed' });
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.firstName = firstName || existingSubscriber.firstName;
        existingSubscriber.lastName = lastName || existingSubscriber.lastName;
        existingSubscriber.interests = interests || existingSubscriber.interests;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();

        return res.json({
          success: true,
          message: 'Newsletter subscription reactivated successfully'
        });
      }
    }

    // Create new subscription
    const subscriber = new NewsletterSubscriber({
      email,
      firstName,
      lastName,
      interests: interests || []
    });

    await subscriber.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unsubscribe from newsletter (public endpoint)
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const subscriber = await NewsletterSubscriber.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ error: 'Email not found in our newsletter list' });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get newsletter statistics (admin only)
router.get('/stats', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const totalSubscribers = await NewsletterSubscriber.countDocuments({ isActive: true });
    const totalUnsubscribed = await NewsletterSubscriber.countDocuments({ isActive: false });
    
    const interestStats = await NewsletterSubscriber.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$interests' },
      { $group: { _id: '$interests', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const monthlySubscriptions = await NewsletterSubscriber.aggregate([
      {
        $match: {
          isActive: true,
          subscribedAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalSubscribers,
        totalUnsubscribed,
        monthlySubscriptions: monthlySubscriptions[0]?.count || 0,
        interestBreakdown: interestStats
      }
    });
  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all subscribers (admin only)
router.get('/subscribers', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 25,
      status = 'active',
      search
    } = req.query;

    const filter = {};
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const subscribers = await NewsletterSubscriber.find(filter)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await NewsletterSubscriber.countDocuments(filter);

    res.json({
      success: true,
      subscribers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update subscriber preferences (admin only)
router.put('/subscribers/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const subscriber = await NewsletterSubscriber.findById(req.params.id);
    
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    const allowedUpdates = ['firstName', 'lastName', 'interests', 'isActive'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        subscriber[field] = req.body[field];
      }
    });

    await subscriber.save();

    res.json({
      success: true,
      subscriber
    });
  } catch (error) {
    console.error('Update subscriber error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete subscriber (admin only)
router.delete('/subscribers/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const subscriber = await NewsletterSubscriber.findById(req.params.id);
    
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    await NewsletterSubscriber.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export subscribers for email campaigns (admin only)
router.get('/export', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { interests } = req.query;
    
    const filter = { isActive: true };
    
    if (interests) {
      const interestArray = interests.split(',');
      filter.interests = { $in: interestArray };
    }

    const subscribers = await NewsletterSubscriber.find(filter)
      .select('email firstName lastName interests subscribedAt')
      .sort({ subscribedAt: -1 });

    res.json({
      success: true,
      subscribers,
      count: subscribers.length
    });
  } catch (error) {
    console.error('Export subscribers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
