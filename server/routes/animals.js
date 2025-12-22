const express = require('express');
const { body, validationResult } = require('express-validator');
const { Animal } = require('../models');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get count of animals in care (admin/staff only)
router.get('/count', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const inCareStatuses = ['Available', 'Medical Hold', 'Pending', 'Foster'];
    const count = await Animal.countDocuments({ status: { $in: inCareStatuses } });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get foster-eligible animals (public endpoint)
router.get('/foster-eligible', async (req, res) => {
  try {
    const query = { isFosterEligible: true, status: { $in: ['Available', 'Foster'] } };
    console.log('Foster-eligible query:', query);
    const animals = await Animal.find(query)
      .select('-medicalNotes -behavioralNotes')
      .sort({ createdAt: -1 });
    console.log('Foster-eligible result:', animals);
    res.json(animals);
  } catch (error) {
    console.error('Get foster-eligible animals error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get all animals (public endpoint - only available animals)
router.get('/', async (req, res) => {
  try {
    const { species } = req.query;

    // Build filter - show available animals and recently adopted animals to public
    const filter = {
      $or: [
        { status: 'Available' },
        { isRecentlyAdopted: true }
      ]
    };
    if (species && species !== 'All') {
      filter.$and = [{ species }];
    }

    const animals = await Animal.find(filter)
      .select('-medicalNotes -behavioralNotes') // Hide sensitive info from public
      .sort({ createdAt: -1 });

    console.log(`🐾 Public animals request: ${animals.length} available or recently adopted animals`);
    res.json(animals);
  } catch (error) {
    console.error('Get animals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: status breakdown for animals (keep before /:id so it isn't captured by the param route)
router.get('/stats/breakdown', async (req, res) => {
  try {
    const stats = await Animal.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const allStatuses = ['Available', 'Adopted', 'Pending', 'Medical Hold', 'Foster', 'Not Available'];
    const breakdown = Object.fromEntries(allStatuses.map(s => [s, 0]));
    stats.forEach(s => {
      breakdown[s._id] = s.count;
    });

    console.log('🐾 Animal stats breakdown:', breakdown);
    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching public animal stats breakdown:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch animal stats', details: error.message });
  }
});

// Get single animal by ID
// Get single animal by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Hide sensitive information from public users
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
      animal.medicalNotes = undefined;
      animal.behaviorNotes = undefined;
    }

    res.json({
      success: true,
      animal
    });
  } catch (error) {
    console.error('Get animal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new animal (staff/admin only)
router.post('/', authenticate, authorize('admin', 'staff'), [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('species').isIn(['Dog', 'Cat', 'Rabbit', 'Bird', 'Other']).withMessage('Invalid species'),
  body('breed').optional().trim(),
  body('age').optional().isIn(['Puppy/Kitten', 'Young', 'Adult', 'Senior', 'Unknown']).withMessage('Invalid age category'),
  body('size').optional().isIn(['Small', 'Medium', 'Large', 'Extra Large']).withMessage('Invalid size'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const animal = new Animal(req.body);
    await animal.save();

    res.status(201).json({
      success: true,
      animal
    });
  } catch (error) {
    console.error('Create animal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update animal (staff/admin only)
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'species', 'breed', 'age', 'gender', 'size', 'description', 
      'medicalNotes', 'behaviorNotes', 'images', 'status', 'adoptionDate',
      'isSpayedNeutered', 'isVaccinated', 'isMicrochipped', 'specialNeeds',
      'specialNeedsDescription', 'adoptionFee', 'tags', 'location'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        animal[field] = req.body[field];
      }
    });

    await animal.save();

    res.json({
      success: true,
      animal
    });
  } catch (error) {
    console.error('Update animal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete animal (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    await Animal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Animal deleted successfully'
    });
  } catch (error) {
    console.error('Delete animal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get animals statistics (staff/admin only)
router.get('/stats/overview', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const stats = await Animal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const speciesStats = await Animal.aggregate([
      {
        $group: {
          _id: '$species',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Animal.countDocuments();

    res.json({
      success: true,
      stats: {
        total,
        byStatus: stats,
        bySpecies: speciesStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
