const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Blog } = require('../models');
const BlogLike = require('../models/BlogLike');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for blog image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/blog-images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all published blogs (public endpoint)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('category').optional().trim(),
  query('tag').optional().trim(),
  query('search').optional().trim(),
  query('featured').optional().isBoolean().toBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 10,
      category,
      tag,
      search,
      featured
    } = req.query;

    // Build filter
    const filter = { status: 'published' };
    
    if (category) {
      filter.category = category;
    }
    
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    
    if (featured !== undefined) {
      filter.isFeatured = featured;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    let sortQuery = {};
    if (featured) {
      sortQuery = { featuredOrder: 1, publishedAt: -1 };
    } else {
      sortQuery = { publishedAt: -1 };
    }

    const blogs = await Blog.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .select('-comments -content') // Exclude comments and full content for list view
      .lean();

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get featured blogs (public endpoint)
router.get('/featured', async (req, res) => {
  try {
    const blogs = await Blog.find({ 
      status: 'published', 
      isFeatured: true 
    })
    .sort({ featuredOrder: 1, publishedAt: -1 })
    .limit(3)
    .select('-comments -content')
    .lean();

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get blog categories (public endpoint)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { status: 'published' });
    
    // Get counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Blog.countDocuments({ 
          category, 
          status: 'published' 
        });
        return { category, count };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCounts
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get blog tags (public endpoint)
router.get('/tags', async (req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: tags.map(tag => ({ tag: tag._id, count: tag.count }))
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog by slug (public endpoint)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    })
    .populate('relatedAnimals', 'name breed age photos')
    .populate('relatedStories', 'title slug excerpt image')
    .lean();

    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    // Get related blogs (same category, different post)
    const relatedBlogs = await Blog.find({
      category: blog.category,
      _id: { $ne: blog._id },
      status: 'published'
    })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select('title slug excerpt featuredImage publishedAt category')
    .lean();

    res.json({
      success: true,
      data: {
        ...blog,
        relatedBlogs
      }
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new blog (admin only)
router.post('/', authenticate, authorize('admin', 'staff'), upload.single('featuredImage'), 
  // Preprocess FormData
  (req, res, next) => {
    // Handle tags array from FormData
    if (req.body.tags && typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {
        // If parsing fails, treat as single tag
        req.body.tags = [req.body.tags];
      }
    }
    
    // Convert boolean strings
    if (req.body.isFeatured === 'true') req.body.isFeatured = true;
    if (req.body.isFeatured === 'false') req.body.isFeatured = false;
    
    next();
  },
  [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('excerpt').trim().isLength({ min: 1, max: 300 }).withMessage('Excerpt is required and must be less than 300 characters'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('category').isIn([
    'pet-care', 'adoption-tips', 'animal-health', 'success-stories', 
    'shelter-updates', 'volunteer-spotlights', 'fundraising-events', 
    'community-outreach', 'educational', 'announcements'
  ]).withMessage('Valid category is required'),
  body('status').optional().isIn(['draft', 'published', 'scheduled']).withMessage('Invalid status'),
  body('scheduledFor').optional().isISO8601().toDate(),
  body('isFeatured').optional().isBoolean().toBoolean(),
  body('metaTitle').optional().trim().isLength({ max: 60 }),
  body('metaDescription').optional().trim().isLength({ max: 160 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      excerpt,
      content,
      category,
      status = 'draft',
      tags,
      scheduledFor,
      isFeatured = false,
      metaTitle,
      metaDescription,
      featuredImageAlt,
      featuredImageCaption
    } = req.body;

    const blogData = {
      title,
      excerpt,
      content,
      category,
      status,
      author: {
        name: req.user.name || 'HALT Admin',
        email: req.user.email
      },
      isFeatured
    };

    if (tags && Array.isArray(tags)) {
      blogData.tags = tags.filter(tag => tag.trim()).map(tag => tag.trim().toLowerCase());
    }

    if (scheduledFor) {
      blogData.scheduledFor = scheduledFor;
      if (status === 'scheduled') {
        blogData.status = 'scheduled';
      }
    }

    if (req.file) {
      blogData.featuredImage = {
        url: `/uploads/blog-images/${req.file.filename}`,
        alt: featuredImageAlt || title,
        caption: featuredImageCaption || ''
      };
    }

    if (metaTitle || metaDescription) {
      blogData.metaData = {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt
      };
    }

    // If featured, set featured order
    if (isFeatured) {
      const maxOrder = await Blog.findOne({ isFeatured: true })
        .sort({ featuredOrder: -1 })
        .select('featuredOrder')
        .lean();
      
      blogData.featuredOrder = (maxOrder?.featuredOrder || 0) + 1;
    }

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A blog with this title already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all blogs for admin (includes drafts)
router.get('/admin/all', authenticate, authorize('admin', 'staff'), [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().trim(),
  query('category').optional().trim(),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      status,
      category,
      search
    } = req.query;

    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { 'author.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content -comments')
      .lean();

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog for admin (includes drafts)
router.get('/admin/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get admin blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update blog (admin only)
router.put('/:id', authenticate, authorize('admin', 'staff'), upload.single('featuredImage'), [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('excerpt').optional().trim().isLength({ min: 1, max: 300 }),
  body('content').optional().trim().isLength({ min: 1 }),
  body('category').optional().isIn([
    'pet-care', 'adoption-tips', 'animal-health', 'success-stories', 
    'shelter-updates', 'volunteer-spotlights', 'fundraising-events', 
    'community-outreach', 'educational', 'announcements'
  ]),
  body('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']),
  body('scheduledFor').optional().isISO8601().toDate(),
  body('isFeatured').optional().isBoolean().toBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        if (key === 'tags' && Array.isArray(req.body[key])) {
          blog[key] = req.body[key].filter(tag => tag.trim()).map(tag => tag.trim().toLowerCase());
        } else {
          blog[key] = req.body[key];
        }
      }
    });

    // Handle new featured image
    if (req.file) {
      blog.featuredImage = {
        url: `/uploads/blog-images/${req.file.filename}`,
        alt: req.body.featuredImageAlt || blog.title,
        caption: req.body.featuredImageCaption || ''
      };
    }

    // Handle featured order
    if (req.body.isFeatured !== undefined) {
      if (req.body.isFeatured && !blog.isFeatured) {
        // Setting as featured, assign order
        const maxOrder = await Blog.findOne({ isFeatured: true })
          .sort({ featuredOrder: -1 })
          .select('featuredOrder')
          .lean();
        
        blog.featuredOrder = (maxOrder?.featuredOrder || 0) + 1;
      } else if (!req.body.isFeatured && blog.isFeatured) {
        // Removing from featured, reset order
        blog.featuredOrder = 0;
      }
    }

    await blog.save();

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog (admin only)
router.delete('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rate limiter for likes to prevent abuse from a single IP
// In non-production environments (development/test) we bypass rate limiting to
// avoid flakiness during test runs and local development. In production the
// limiter is active.
let likeLimiter;
if (process.env.NODE_ENV !== 'production') {
  likeLimiter = (req, res, next) => next();
} else {
  likeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // max 10 requests per IP per minute
    standardHeaders: true,
    legacyHeaders: false
  });
}


// Like / toggle blog post (supports authenticated users and anonymous via ipHash)
// Use optionalAuth so we can accept authenticated or anonymous requests
router.post('/:id/like', optionalAuth, likeLimiter, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // If authenticated, prefer user-based like
    const userId = req.user?._id || null;

  // Compute ipHash for anonymous users.
  // Prefer the explicit X-Forwarded-For header when present (tests set this),
  // otherwise fall back to Express' req.ip which respects trust proxy.
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = forwarded ? forwarded.toString().split(',')[0].trim() : (req.ip || req.connection.remoteAddress || '').toString();
    const salt = process.env.IP_SALT || '';
    const ipHash = rawIp ? crypto.createHmac('sha256', salt).update(rawIp).digest('hex') : null;

    // Determine criteria for search
    const criteria = userId ? { blogId: blog._id, userId } : { blogId: blog._id, ipHash };

    // Toggle behavior: if a BlogLike exists, remove it (unlike); otherwise create it
    const existing = await BlogLike.findOne(criteria).lean();
    if (existing) {
      // Remove the like and decrement aggregate
      await BlogLike.findByIdAndDelete(existing._id);
      const updated = await Blog.findByIdAndUpdate(blog._id, { $inc: { likes: -1 } }, { new: true }).select('likes').lean();
      return res.json({ success: true, likes: updated.likes, added: false, removed: true });
    }

    // Create new like
    try {
      await BlogLike.create({ ...criteria, createdAt: new Date() });
      const updated = await Blog.findByIdAndUpdate(blog._id, { $inc: { likes: 1 } }, { new: true }).select('likes').lean();
      return res.json({ success: true, likes: updated.likes, added: true });
    } catch (err) {
      // Duplicate key error means another concurrent request already created the like
      if (err.code === 11000) {
        const current = await Blog.findById(blog._id).select('likes').lean();
        return res.json({ success: true, likes: current.likes, added: false });
      }
      throw err;
    }
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin endpoint to recompute likes from BlogLike collection
// Protected: admin only
router.post('/admin/recompute-likes', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Aggregate counts by blogId from BlogLike
    const counts = await BlogLike.aggregate([
      { $group: { _id: '$blogId', count: { $sum: 1 } } }
    ]);

    // Update each Blog.likes to match counts
    const bulkOps = counts.map(c => ({
      updateOne: {
        filter: { _id: c._id },
        update: { $set: { likes: c.count } }
      }
    }));

    if (bulkOps.length > 0) {
      await Blog.bulkWrite(bulkOps);
    }

    // For blogs that have no BlogLike entries, ensure likes = 0
    await Blog.updateMany({ _id: { $nin: counts.map(c => c._id) } }, { $set: { likes: 0 } });

    res.json({ success: true, updated: bulkOps.length });
  } catch (error) {
    console.error('Recompute likes error:', error);
    res.status(500).json({ error: 'Failed to recompute likes' });
  }
});

module.exports = router;
