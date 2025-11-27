const express = require('express');
const { body, validationResult } = require('express-validator');
const { Volunteer } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get count of active volunteers (admin/staff only)
router.get('/count', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const count = await Volunteer.countDocuments({ applicationStatus: 'approved' });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit volunteer application (public endpoint)
router.post('/apply', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 1 }).withMessage('Phone number is required'),
  body('availability').isArray({ min: 1 }).withMessage('At least one availability option must be selected'),
  body('interests').isArray({ min: 1 }).withMessage('At least one interest must be selected')
], async (req, res) => {
  try {
    console.log('🎯 Volunteer application received:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      email,
      phone,
      availability,
      interests,
      experience,
      message
    } = req.body;

    // Check if application already exists
    const existingApplication = await Volunteer.findOne({ 'personalInfo.email': email });
    if (existingApplication) {
      return res.status(409).json({ 
        error: 'Application already exists for this email address' 
      });
    }

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const volunteer = new Volunteer({
      personalInfo: {
        firstName,
        lastName,
        email,
        phone
      },
      interests,
      experience: {
        animalExperience: experience || '',
        volunteerExperience: message || ''
      },
      availability: {
        // Convert simple availability array to structured format
        weekdays: {
          monday: { available: availability.includes('Weekday mornings') || availability.includes('Weekday afternoons') || availability.includes('Weekday evenings'), timeSlots: [] },
          tuesday: { available: availability.includes('Weekday mornings') || availability.includes('Weekday afternoons') || availability.includes('Weekday evenings'), timeSlots: [] },
          wednesday: { available: availability.includes('Weekday mornings') || availability.includes('Weekday afternoons') || availability.includes('Weekday evenings'), timeSlots: [] },
          thursday: { available: availability.includes('Weekday mornings') || availability.includes('Weekday afternoons') || availability.includes('Weekday evenings'), timeSlots: [] },
          friday: { available: availability.includes('Weekday mornings') || availability.includes('Weekday afternoons') || availability.includes('Weekday evenings'), timeSlots: [] }
        },
        weekends: {
          saturday: { available: availability.includes('Weekend mornings') || availability.includes('Weekend afternoons') || availability.includes('Weekend evenings'), timeSlots: [] },
          sunday: { available: availability.includes('Weekend mornings') || availability.includes('Weekend afternoons') || availability.includes('Weekend evenings'), timeSlots: [] }
        }
      },
      applicationStatus: 'pending'
    });

    await volunteer.save();

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully',
      applicationId: volunteer._id
    });
  } catch (error) {
    console.error('Volunteer application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get volunteer opportunities (public endpoint)
router.get('/opportunities', async (req, res) => {
  try {
    const opportunities = [
      {
        id: 'animal-care',
        title: 'Animal Care Assistant',
        description: 'Help with daily care routines including feeding, cleaning, and providing companionship to our animals.',
        timeCommitment: '3-4 hours per week',
        requirements: ['Must be 16+ years old', 'Comfortable with animals', 'Reliable transportation']
      },
      {
        id: 'dog-walking',
        title: 'Dog Walker',
        description: 'Take our dogs for regular walks and provide exercise and socialization.',
        timeCommitment: '2-3 hours per week',
        requirements: ['Physical ability to handle dogs', 'Experience with dogs preferred', 'Flexible schedule']
      },
      {
        id: 'adoption-events',
        title: 'Adoption Event Volunteer',
        description: 'Help at adoption events, assist potential adopters, and promote our animals.',
        timeCommitment: 'Weekend events (4-6 hours)',
        requirements: ['Good communication skills', 'Passionate about animal welfare', 'Weekend availability']
      },
      {
        id: 'fundraising',
        title: 'Fundraising Assistant',
        description: 'Help organize and run fundraising events and campaigns.',
        timeCommitment: 'Variable based on events',
        requirements: ['Organizational skills', 'Creative thinking', 'Event planning experience helpful']
      },
      {
        id: 'transport',
        title: 'Animal Transport',
        description: 'Transport animals to vet appointments, adoption events, and other locations.',
        timeCommitment: 'As needed basis',
        requirements: ['Valid driver\'s license', 'Reliable vehicle', 'Comfortable transporting animals']
      },
      {
        id: 'administrative',
        title: 'Administrative Support',
        description: 'Help with office tasks, data entry, phone calls, and general administrative duties.',
        timeCommitment: '2-4 hours per week',
        requirements: ['Computer skills', 'Attention to detail', 'Professional communication']
      }
    ];

    res.json({
      success: true,
      opportunities
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all volunteer applications (admin only - simplified for frontend)
router.get('/applications', authenticate, async (req, res) => {
  try {
    const applications = await Volunteer.find()
      .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedApplications = applications.map(app => ({
      _id: app._id,
      personalInfo: {
        firstName: app.personalInfo.firstName || '',
        lastName: app.personalInfo.lastName || '',
        fullName: `${app.personalInfo.firstName || ''} ${app.personalInfo.lastName || ''}`.trim(),
        email: app.personalInfo.email,
        phone: app.personalInfo.phone,
        age: app.personalInfo.age || 
             (app.personalInfo.dateOfBirth ? 
               Math.floor((new Date() - new Date(app.personalInfo.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 
               'Not provided'),
        address: {
          street: app.personalInfo.address?.street || '',
          city: app.personalInfo.address?.city || '',
          state: app.personalInfo.address?.state || '',
          zipCode: app.personalInfo.address?.zipCode || '',
          country: app.personalInfo.address?.country || ''
        }
      },
      interests: app.interests || [],
      experience: {
        yearsExperience: (() => {
          const exp = app.experience?.animalExperience || app.experience?.yearsExperience || '';
          const match = exp.toString().match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })(),
        previousExperience: app.experience?.animalExperience || 
                           app.experience?.previousExperience || 
                           app.experience?.volunteerExperience || 
                           'None specified'
      },
      availability: {
        days: [
          ...(app.availability?.weekdays ? Object.keys(app.availability.weekdays).filter(day => 
            app.availability.weekdays[day]?.available
          ).map(day => day.charAt(0).toUpperCase() + day.slice(1)) : []),
          ...(app.availability?.weekends ? Object.keys(app.availability.weekends).filter(day => 
            app.availability.weekends[day]?.available
          ).map(day => day.charAt(0).toUpperCase() + day.slice(1)) : [])
        ],
        times: [
          // Extract times based on the availability structure
          ...(app.availability?.weekdays && Object.values(app.availability.weekdays).some(day => day.available) ? ['Weekdays'] : []),
          ...(app.availability?.weekends && Object.values(app.availability.weekends).some(day => day.available) ? ['Weekends'] : [])
        ],
        hoursPerWeek: app.availability?.hoursPerWeek || 
                     app.availability?.preferredHours || 
                     (app.availability?.weekdays || app.availability?.weekends ? '5-10' : 'Not specified')
      },
      backgroundQuestions: {
        ownsPets: app.backgroundQuestions?.ownsPets || false,
        petDetails: app.backgroundQuestions?.petDetails || '',
        criminalBackground: app.backgroundQuestions?.criminalBackground || false,
        criminalDetails: app.backgroundQuestions?.criminalDetails || ''
      },
      motivation: app.experience?.volunteerExperience || 'Not provided',
      status: app.applicationStatus || 'pending',
      applicationStatus: app.applicationStatus || 'pending',
      createdAt: app.createdAt || app.applicationDate
    }));

    res.json({
      success: true,
      applications: transformedApplications
    });
  } catch (error) {
    console.error('Get volunteer applications error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error' 
    });
  }
});

// Update volunteer status (admin only)
router.put('/applications/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'approved', 'rejected', 'contacted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer not found'
      });
    }

    volunteer.applicationStatus = status;
    if (status === 'approved') {
      volunteer.approvedDate = new Date();
    }
    
    await volunteer.save();

    res.json({
      success: true,
      message: `Volunteer status updated to ${status}`
    });
  } catch (error) {
    console.error('Update volunteer status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Delete volunteer application (admin only)
router.delete('/applications/:id', authenticate, async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer not found'
      });
    }

    await Volunteer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Volunteer application deleted successfully'
    });
  } catch (error) {
    console.error('Delete volunteer error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get volunteer statistics (staff/admin only)
router.get('/stats', authenticate, authorize('admin', 'staff', 'volunteer-coordinator'), async (req, res) => {
  try {
    const statusStats = await Volunteer.aggregate([
      {
        $group: {
          _id: '$applicationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const interestStats = await Volunteer.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const monthlyApplications = await Volunteer.aggregate([
      {
        $match: {
          applicationDate: {
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

    const total = await Volunteer.countDocuments();

    res.json({
      success: true,
      stats: {
        total,
        byStatus: statusStats,
        byInterest: interestStats,
        monthlyApplications: monthlyApplications[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Get volunteer stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active volunteers list (staff/admin only)
router.get('/active', authenticate, authorize('admin', 'staff', 'volunteer-coordinator'), async (req, res) => {
  try {
    const volunteers = await Volunteer.find({ applicationStatus: 'approved' })
      .select('personalInfo.firstName personalInfo.lastName personalInfo.email personalInfo.phone interests availability')
      .sort({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });

    res.json({
      success: true,
      volunteers
    });
  } catch (error) {
    console.error('Get active volunteers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
