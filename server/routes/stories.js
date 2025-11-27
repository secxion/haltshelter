const express = require('express');
const { body, validationResult } = require('express-validator');
const { Story } = require('../models');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get count of published stories (admin/staff only)
router.get('/count', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const count = await Story.countDocuments({ isPublished: true });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all stories (public endpoint)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit,
      category,
      featured,
      search
    } = req.query;

    // Build filter object
    const filter = { isPublished: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    let stories;
    let total;
    let skip = 0;
    let lim = undefined;
    if (limit !== undefined) {
      lim = parseInt(limit);
      skip = (parseInt(page) - 1) * lim;
    }
    if (lim) {
      stories = await Story.find(filter)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .populate('author', 'firstName lastName');
      total = await Story.countDocuments(filter);
    } else {
      stories = await Story.find(filter)
        .sort({ isFeatured: -1, createdAt: -1 })
        .populate('author', 'firstName lastName');
      total = stories.length;
    }
    res.json({
      success: true,
      data: stories,
      pagination: {
        page: parseInt(page),
        limit: lim || total,
        total,
        pages: lim ? Math.ceil(total / lim) : 1
      }
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get featured stories (public endpoint) - MUST be before /:slug route
router.get('/featured', async (req, res) => {
  try {
    const stories = await Story.find({ 
      isPublished: true,
      isFeatured: true 
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('author', 'firstName lastName')
      .select('title slug excerpt featuredImage createdAt author readTime');

    res.json({
      success: true,
      stories
    });
  } catch (error) {
    console.error('Get featured stories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single story by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const story = await Story.findOne({ 
      slug: req.params.slug,
      isPublished: true
    }).populate('author', 'firstName lastName email');

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Increment view count
    story.views = (story.views || 0) + 1;
    await story.save();

    res.json({
      success: true,
      story
    });
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all stories for admin (including drafts)
router.get('/admin/all', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      status,
      category
    } = req.query;

    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const stories = await Story.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName');

    const total = await Story.countDocuments(filter);

    res.json({
      success: true,
      stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin stories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new story (staff/admin only)
router.post('/', authenticate, authorize('admin', 'staff'), [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('excerpt').trim().isLength({ min: 1, max: 500 }).withMessage('Excerpt is required and must be under 500 characters'),
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('category').isIn(['Success Story', 'Recent Rescue', 'Medical Success', 'Volunteer Spotlight', 'Foster Story', 'Memorial', 'News', 'Event']).withMessage('Invalid category'),
  body('featuredImage.url').custom((value, { req }) => {
    // Check if featuredImage.url exists and is a valid URL
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new Error('Featured image URL is required');
    }
    // Allow both full URLs and local paths (for uploaded images)
    if (!value.match(/^(https?:\/\/|\/uploads\/)/)) {
      throw new Error('Featured image URL must be a valid URL or uploaded image path');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    console.log('Creating story with data:', req.body);

    // Create the story data with explicit slug generation
    const storyData = {
      ...req.body,
      author: req.user._id
    };

    // Generate slug from title if not provided
    if (!storyData.slug && storyData.title) {
      storyData.slug = storyData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim('-'); 
      
      console.log('Generated slug:', storyData.slug, 'from title:', storyData.title);
    }

    console.log('Final story data before saving:', storyData);

    const story = new Story(storyData);

    // Auto-publish if not specified, but allow publishedAt to be set from request
    if (req.body.status === 'published' || req.body.isPublished) {
      story.isPublished = true;
      if (!story.publishedAt && req.body.publishedAt) {
        story.publishedAt = req.body.publishedAt;
      } else if (!story.publishedAt) {
        story.publishedAt = new Date();
      }
    }

    await story.save();
    await story.populate('author', 'firstName lastName');

    res.status(201).json({
      success: true,
      story
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update story (staff/admin only)
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Update allowed fields, including publishedAt if provided
    const allowedUpdates = [
      'title', 'content', 'excerpt', 'category', 'featured', 
      'images', 'status', 'tags', 'metaDescription', 'publishedAt'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        story[field] = req.body[field];
      }
    });

    // Set published date if publishing for first time, but allow publishedAt from request
    if (req.body.status === 'published' && !story.publishedAt) {
      if (req.body.publishedAt) {
        story.publishedAt = req.body.publishedAt;
      } else {
        story.publishedAt = new Date();
      }
    }

    story.updatedAt = new Date();
    await story.save();

    await story.populate('author', 'firstName lastName');

    res.json({
      success: true,
      story
    });
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete story (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    await Story.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get story categories (public)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Story.distinct('category', { isPublished: true });
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
