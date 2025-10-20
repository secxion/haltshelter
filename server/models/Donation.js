const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  // Donor Information
  donorInfo: {
    name: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Donor email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
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
    isAnonymous: {
      type: Boolean,
      default: false
    }
  },

  // Donation Details
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [1, 'Donation amount must be at least $1']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'CAD', 'EUR', 'GBP']
  },
  donationType: {
    type: String,
    required: [true, 'Donation type is required'],
    enum: ['one-time', 'monthly', 'quarterly', 'annual']
  },
  category: {
    type: String,
    enum: ['general', 'emergency', 'medical', 'food', 'shelter', 'transport', 'memorial', 'sponsor-animal'],
    default: 'general'
  },
  dedicatedTo: {
    type: String, // Memorial donations or "in honor of"
    trim: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },

  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'check', 'cash', 'bank-transfer'],
    default: 'stripe'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String, // Stripe payment intent ID or similar
    unique: true,
    sparse: true
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String, // For recurring donations

  // Processing Information
  processingFee: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number // Amount after processing fees
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values
  },
  receiptSent: {
    type: Boolean,
    default: false
  },
  receiptSentAt: Date,

  // Tax Information
  isTaxDeductible: {
    type: Boolean,
    default: true
  },
  taxReceiptSent: {
    type: Boolean,
    default: false
  },

  // Recurring Donation Information
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringSchedule: {
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual']
    },
    nextPaymentDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    cancelledAt: Date,
    cancelReason: String
  },

  // Communication Preferences
  communicationPreferences: {
    emailUpdates: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: true
    },
    appealLetters: {
      type: Boolean,
      default: true
    }
  },

  // Administrative
  notes: String, // Internal staff notes
  tags: [String], // e.g., ['major-donor', 'first-time', 'corporate']
  campaign: String, // Which fundraising campaign this came from
  source: {
    type: String,
    enum: ['website', 'social-media', 'email', 'event', 'mail', 'phone', 'third-party'],
    default: 'website'
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate net amount and generate receipt number
donationSchema.pre('save', function(next) {
  // Calculate net amount if not already set
  if (!this.netAmount) {
    this.netAmount = this.amount - this.processingFee;
  }

  // Generate receipt number if not already set
  if (!this.receiptNumber && this.paymentStatus === 'completed') {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    this.receiptNumber = `HALT-${year}${month}-${timestamp}`;
  }

  next();
});

// Index for performance and reporting
donationSchema.index({ paymentStatus: 1, createdAt: -1 });
donationSchema.index({ donationType: 1, isRecurring: 1 });
donationSchema.index({ category: 1, createdAt: -1 });
donationSchema.index({ amount: -1 });

module.exports = mongoose.model('Donation', donationSchema);
