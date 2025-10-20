const express = require('express');
const { body, validationResult } = require('express-validator');
const AdoptionInquiry = require('../models/AdoptionInquiry');
const Animal = require('../models/Animal');

const router = express.Router();

// POST /api/adoption-inquiries - Submit new adoption inquiry (public)
router.post('/', [
  body('animalId').isMongoId().withMessage('Valid animal ID is required'),
  body('applicantName').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('experience').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { animalId, applicantName, email, phone, address, experience, message } = req.body;

    // Verify animal exists and is available
    const animal = await Animal.findById(animalId);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    if (animal.status !== 'Available') {
      return res.status(400).json({ error: 'This animal is no longer available for adoption' });
    }

    // Check if user already has a pending inquiry for this animal
    const existingInquiry = await AdoptionInquiry.findOne({
      animal: animalId,
      email: email.toLowerCase(),
      status: { $in: ['Pending', 'Under Review'] }
    });

    if (existingInquiry) {
      return res.status(400).json({ error: 'You already have a pending inquiry for this animal' });
    }

    // Create new adoption inquiry
    const adoptionInquiry = new AdoptionInquiry({
      animal: animalId,
      animalName: animal.name,
      applicantName,
      email: email.toLowerCase(),
      phone,
      address,
      experience,
      message,
      statusHistory: [{
        status: 'Pending',
        changedBy: 'System',
        notes: 'Initial submission'
      }]
    });

    await adoptionInquiry.save();

    console.log(`📧 New adoption inquiry for ${animal.name} from ${applicantName}`);

    res.status(201).json({
      success: true,
      message: 'Adoption inquiry submitted successfully! We will contact you soon.',
      inquiryId: adoptionInquiry._id
    });

  } catch (error) {
    console.error('Adoption inquiry submission error:', error);
    res.status(500).json({ error: 'Failed to submit adoption inquiry' });
  }
});

module.exports = router;
