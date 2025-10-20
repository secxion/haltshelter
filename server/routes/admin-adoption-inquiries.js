const express = require('express');
const { body, validationResult } = require('express-validator');
const AdoptionInquiry = require('../models/AdoptionInquiry');
const Animal = require('../models/Animal');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/adoption-inquiries - Get all adoption inquiries
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, animal, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (animal) {
      filter.animal = animal;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const inquiries = await AdoptionInquiry.find(filter)
      .populate('animal', 'name species breed status images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AdoptionInquiry.countDocuments(filter);

    console.log(`📋 Retrieved ${inquiries.length} adoption inquiries for admin`);
    
    res.json({
      inquiries,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: inquiries.length,
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching adoption inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch adoption inquiries' });
  }
});

// GET /api/admin/adoption-inquiries/:id - Get single adoption inquiry
router.get('/:id', authenticate, async (req, res) => {
  try {
    const inquiry = await AdoptionInquiry.findById(req.params.id)
      .populate('animal', 'name species breed status images description');
    
    if (!inquiry) {
      return res.status(404).json({ error: 'Adoption inquiry not found' });
    }
    
    res.json(inquiry);
  } catch (error) {
    console.error('Error fetching adoption inquiry:', error);
    res.status(500).json({ error: 'Failed to fetch adoption inquiry' });
  }
});

// PUT /api/admin/adoption-inquiries/:id - Update adoption inquiry status
router.put('/:id', authenticate, [
  body('status').isIn(['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed']).withMessage('Invalid status'),
  body('adminNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, adminNotes } = req.body;
    const inquiry = await AdoptionInquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ error: 'Adoption inquiry not found' });
    }

    // Update status and add to history
    const oldStatus = inquiry.status;
    inquiry.status = status;
    inquiry.adminNotes = adminNotes || inquiry.adminNotes;
    
    inquiry.statusHistory.push({
      status,
      changedBy: req.user?.email || 'Admin',
      notes: adminNotes
    });

    await inquiry.save();

    // If approved, update animal status to Pending
    if (status === 'Approved' && oldStatus !== 'Approved') {
      await Animal.findByIdAndUpdate(inquiry.animal, { status: 'Pending' });
    }
    // If completed, update animal status to Adopted and set adoptionDate so monthly stats include it
    if (status === 'Completed' && oldStatus !== 'Completed') {
      try {
        await Animal.findByIdAndUpdate(inquiry.animal, { status: 'Adopted', adoptionDate: new Date(), isRecentlyAdopted: true });
      } catch (err) {
        console.error('Error updating animal to Adopted on inquiry completion:', err);
      }
    }

    console.log(`📋 Adoption inquiry ${inquiry._id} status updated to ${status}`);
    
    res.json({
      success: true,
      inquiry
    });
  } catch (error) {
    console.error('Error updating adoption inquiry:', error);
    res.status(500).json({ error: 'Failed to update adoption inquiry' });
  }
});

// GET /api/admin/adoption-inquiries/stats/overview - Get adoption inquiry statistics
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const stats = await AdoptionInquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await AdoptionInquiry.countDocuments();
    const thisMonth = await AdoptionInquiry.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });

    res.json({
      success: true,
      stats: {
        total,
        thisMonth,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error('Error fetching adoption inquiry stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// DELETE /api/admin/adoption-inquiries/:id - Delete adoption inquiry
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const inquiry = await AdoptionInquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ error: 'Adoption inquiry not found' });
    }

    await AdoptionInquiry.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Adoption inquiry ${req.params.id} deleted`);
    
    res.json({
      success: true,
      message: 'Adoption inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting adoption inquiry:', error);
    res.status(500).json({ error: 'Failed to delete adoption inquiry' });
  }
});

module.exports = router;
