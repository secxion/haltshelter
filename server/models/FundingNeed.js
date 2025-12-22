const mongoose = require('mongoose');
const { Schema } = mongoose;

const fundingNeedSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  goalAmount: {
    type: Number,
    required: [true, 'Goal amount is required'],
    min: [1, 'Goal amount must be at least $1']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  type: {
    type: String,
    enum: ['emergency', 'regular'],
    default: 'regular'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0, // Higher number = higher priority (shown first)
    min: 0
  },
  // Optional: link to specific animal for emergency cases
  animalId: {
    type: Schema.Types.ObjectId,
    ref: 'Animal',
    default: null
  },
  // Track when goal was reached
  goalReachedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.Types.Mixed,
    ref: 'User'
  }
});

// Update timestamp on save
fundingNeedSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Check if goal was reached
  if (this.currentAmount >= this.goalAmount && !this.goalReachedAt) {
    this.goalReachedAt = new Date();
  }
  
  next();
});

// Get active funding needs by type
fundingNeedSchema.statics.getActiveByType = async function(type) {
  return await this.find({ 
    type, 
    isActive: true 
  })
  .sort({ priority: -1, createdAt: -1 })
  .limit(5);
};

// Get all active funding needs
fundingNeedSchema.statics.getAllActive = async function() {
  return await this.find({ isActive: true })
    .sort({ type: 1, priority: -1, createdAt: -1 });
};

const FundingNeed = mongoose.model('FundingNeed', fundingNeedSchema);
module.exports = FundingNeed;
