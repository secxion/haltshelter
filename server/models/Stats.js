const mongoose = require('mongoose');
const { Schema } = mongoose;

const statsSchema = new Schema({
  // Legacy/Homepage stats
  animalsRescued: {
    type: Number,
    default: 5,
    min: 0
  },
  adoptionsThisMonth: {
    type: Number,
    default: 3,
    min: 0
  },
  activeVolunteers: {
    type: Number,
    default: 1,
    min: 0
  },
  livesTransformed: {
    type: Number,
    default: 1900,
    min: 0
  },
  
  // Donate page "Recent Impact" stats
  rescuedThisMonth: {
    type: Number,
    default: 0,
    min: 0
  },
  medicalTreatments: {
    type: Number,
    default: 0,
    min: 0
  },
  spayNeuterCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.Mixed, // Allow both ObjectId and string for admin user
    ref: 'User'
  }
});

// Always return only one stats document
statsSchema.statics.getCurrentStats = async function() {
  const stats = await this.findOne();
  if (stats) return stats;
  
  // If no stats exist, create with defaults
  return await this.create({});
};

const Stats = mongoose.model('Stats', statsSchema);
module.exports = Stats;