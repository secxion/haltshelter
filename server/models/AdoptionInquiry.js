const mongoose = require('mongoose');

const adoptionInquirySchema = new mongoose.Schema({
  // Animal information
  animal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    required: true
  },
  animalName: {
    type: String,
    required: true
  },
  
  // Applicant information
  applicantName: {
    type: String,
    required: [true, 'Applicant name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  
  // Application details
  experience: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    trim: true
  },
  
  // Status history
  statusHistory: [{
    status: String,
    changedBy: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Index for searching
adoptionInquirySchema.index({ email: 1 });
adoptionInquirySchema.index({ status: 1 });
adoptionInquirySchema.index({ animal: 1 });
adoptionInquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdoptionInquiry', adoptionInquirySchema);
