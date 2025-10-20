const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  // Personal Information
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'US'
      }
    },
    dateOfBirth: Date,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },

  // Volunteer Preferences
  interests: [{
    type: String,
    enum: [
      'animal-care',
      'dog-walking',
      'cat-socialization',
      'administrative',
      'fundraising',
      'events',
      'transport',
      'fostering',
      'photography',
      'social-media',
      'maintenance',
      'cleaning',
      'grooming',
      'training',
      'education',
      'veterinary-assistant'
    ]
  }],
  
  skills: [{
    type: String,
    enum: [
      'animal-handling',
      'veterinary-experience',
      'training-experience',
      'computer-skills',
      'social-media',
      'photography',
      'writing',
      'public-speaking',
      'fundraising',
      'accounting',
      'marketing',
      'construction',
      'driving',
      'languages',
      'event-planning'
    ]
  }],

  experience: {
    animalExperience: String, // Description of animal experience
    volunteerExperience: String, // Previous volunteer experience
    relevantSkills: String
  },

  availability: {
    weekdays: {
      monday: { available: Boolean, timeSlots: [String] },
      tuesday: { available: Boolean, timeSlots: [String] },
      wednesday: { available: Boolean, timeSlots: [String] },
      thursday: { available: Boolean, timeSlots: [String] },
      friday: { available: Boolean, timeSlots: [String] }
    },
    weekends: {
      saturday: { available: Boolean, timeSlots: [String] },
      sunday: { available: Boolean, timeSlots: [String] }
    },
    hoursPerWeek: {
      type: String,
      enum: ['1-3', '4-6', '7-10', '11-15', '16-20', '20+']
    },
    commitment: {
      type: String,
      enum: ['short-term', 'long-term', 'seasonal', 'as-needed']
    }
  },

  // Application Status
  applicationStatus: {
    type: String,
    enum: ['pending', 'under-review', 'approved', 'rejected', 'inactive'],
    default: 'pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: Date,
  orientation: {
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    notes: String
  },
  backgroundCheck: {
    required: {
      type: Boolean,
      default: false
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'not-required']
    }
  },

  // Volunteer History
  hoursLogged: {
    type: Number,
    default: 0
  },
  lastVolunteerDate: Date,
  totalSessions: {
    type: Number,
    default: 0
  },
  specialRecognitions: [String],
  
  // Administrative
  assignedCoordinator: {
    name: String,
    email: String
  },
  notes: String, // Internal staff notes
  tags: [String], // e.g., ['reliable', 'animal-expert', 'photographer']
  
  // Communication Preferences
  communicationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    phone: {
      type: Boolean,
      default: false
    },
    newsletter: {
      type: Boolean,
      default: true
    },
    eventInvitations: {
      type: Boolean,
      default: true
    }
  },

  // Forms and Waivers
  waiverSigned: {
    type: Boolean,
    default: false
  },
  waiverDate: Date,
  photoConsent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for full name
volunteerSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Index for performance
volunteerSchema.index({ applicationStatus: 1, applicationDate: -1 });
volunteerSchema.index({ interests: 1 });
volunteerSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });

module.exports = mongoose.model('Volunteer', volunteerSchema);
