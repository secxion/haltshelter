const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Animal name is required'],
    trim: true
  },
  species: {
    type: String,
    required: [true, 'Species is required'],
    enum: ['Dog', 'Cat', 'Rabbit', 'Bird', 'Goat', 'Guinea Pig', 'Ferret', 'Pig', 'Turtle', 'Sheep', 'Other']
  },
  breed: {
    type: String,
    trim: true
  },
  age: {
    type: String,
    enum: ['Puppy/Kitten', 'Young', 'Adult', 'Senior', 'Unknown']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unknown']
  },
  size: {
    type: String,
    enum: ['Small', 'Medium', 'Large', 'Extra Large']
  },
  description: {
    type: String,
    trim: true
  },
  medicalNotes: {
    type: String,
    trim: true
  },
  behaviorNotes: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    altText: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['Available', 'Adopted', 'Pending', 'Medical Hold', 'Foster', 'Not Available'],
    default: 'Available'
  },
  intakeDate: {
    type: Date,
    default: Date.now
  },
  adoptionDate: {
    type: Date
  },
  isSpayedNeutered: {
    type: Boolean,
    default: false
  },
  isVaccinated: {
    type: Boolean,
    default: false
  },
  isMicrochipped: {
    type: Boolean,
    default: false
  },
  specialNeeds: {
    type: Boolean,
    default: false
  },
  specialNeedsDescription: {
    type: String,
    trim: true
  },
  adoptionFee: {
    type: Number,
    min: 0
  },
  tags: [String], // e.g., ['good-with-kids', 'house-trained', 'energetic']
  location: {
    shelter: String,
    foster: String,
    city: String,
    state: String
  }
    ,
    isUrgent: {
      type: Boolean,
      default: false
    },
    isAnimalOfTheWeek: {
      type: Boolean,
      default: false
    },
    isFosterEligible: {
      type: Boolean,
      default: false
    },
    isRecentlyAdopted: {
      type: Boolean,
      default: false
    }
}, {
  timestamps: true
});

// Index for searching
animalSchema.index({ name: 'text', description: 'text', breed: 'text' });
animalSchema.index({ species: 1, status: 1 });

module.exports = mongoose.model('Animal', animalSchema);
