const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const animals = await Animal.find()
      .sort({ createdAt: -1 });
    
    console.log(`🐾 Retrieved ${animals.length} animals for admin`);
    res.json(animals);
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

// GET /api/admin/animals/:id - Get single animal
router.get('/:id', authenticate, async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    res.json(animal);
  } catch (error) {
    console.error('Error fetching animal:', error);
    res.status(500).json({ error: 'Failed to fetch animal' });
  }
});

// POST /api/admin/animals - Create new animal
router.post('/', authenticate, async (req, res) => {
  try {
    const animalData = {
      ...req.body,
      intakeDate: new Date(),
      isUrgent: req.body.isUrgent || false,
      isAnimalOfTheWeek: req.body.isAnimalOfTheWeek || false,
      isFosterEligible: req.body.isFosterEligible || false,
      isRecentlyAdopted: req.body.isRecentlyAdopted || false
    };

    const animal = new Animal(animalData);
    await animal.save();
    
    console.log(`🐾 New animal added: ${animal.name} (${animal.species})`);
    res.status(201).json(animal);
  } catch (error) {
    console.error('Error creating animal:', error);
    res.status(500).json({ error: 'Failed to create animal' });
  }
});

// PUT /api/admin/animals/:id - Update animal
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      isUrgent: req.body.isUrgent !== undefined ? req.body.isUrgent : false,
      isAnimalOfTheWeek: req.body.isAnimalOfTheWeek !== undefined ? req.body.isAnimalOfTheWeek : false,
      isFosterEligible: req.body.isFosterEligible !== undefined ? req.body.isFosterEligible : false,
      isRecentlyAdopted: req.body.isRecentlyAdopted !== undefined ? req.body.isRecentlyAdopted : false
    };

    // If status is being changed to 'Adopted', set adoption date
    if (updateData.status === 'Adopted' && req.body.status !== 'Adopted') {
      updateData.adoptionDate = new Date();
    }

    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    console.log(`🐾 Animal updated: ${animal.name} - Status: ${animal.status}`);
    res.json(animal);
  } catch (error) {
    console.error('Error updating animal:', error);
    res.status(500).json({ error: 'Failed to update animal' });
  }
});

// DELETE /api/admin/animals/:id - Delete animal
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const animal = await Animal.findByIdAndDelete(req.params.id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    console.log(`🐾 Animal deleted: ${animal.name}`);
    res.json({ message: 'Animal deleted successfully' });
  } catch (error) {
    console.error('Error deleting animal:', error);
    res.status(500).json({ error: 'Failed to delete animal' });
  }
});

// PUT /api/admin/animals/:id/status - Quick status update
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    
    // Set adoption date if status is 'Adopted'
    if (status === 'Adopted') {
      updateData.adoptionDate = new Date();
    }
    
    const animal = await Animal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    console.log(`🐾 Status updated: ${animal.name} - ${status}`);
    res.json(animal);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// GET /api/admin/animals/stats/breakdown - Get detailed stats
router.get('/stats/breakdown', authenticate, async (req, res) => {
  try {
    const stats = await Animal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Convert to object for easier access
    const breakdown = {};
    stats.forEach(stat => {
      breakdown[stat._id] = stat.count;
    });
    
    const allStatuses = ['Available', 'Adopted', 'Pending', 'Medical Hold', 'Foster', 'Not Available'];
    allStatuses.forEach(status => {
      if (!breakdown[status]) {
        breakdown[status] = 0;
      }
    });
    
    console.log('🐾 Animal stats breakdown:', breakdown);
    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching animal stats:', error);
    res.status(500).json({ error: 'Failed to fetch animal stats' });
  }
});

module.exports = router;
