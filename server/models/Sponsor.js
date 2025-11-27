const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sponsor name is required'],
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  logoUrl: {
    type: String,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  notes: String
}, {
  timestamps: true
});

// Index to quickly fetch featured sponsors
sponsorSchema.index({ featured: -1, createdAt: -1 });

module.exports = mongoose.model('Sponsor', sponsorSchema);
