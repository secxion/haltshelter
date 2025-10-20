const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    trim: true
  },
  preferences: {
    generalNews: {
      type: Boolean,
      default: true
    },
    animalUpdates: {
      type: Boolean,
      default: true
    },
    events: {
      type: Boolean,
      default: true
    },
    fundraising: {
      type: Boolean,
      default: true
    },
    volunteer: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced', 'pending'],
    default: 'active'
  },
  source: {
    type: String,
    enum: ['website', 'donation-form', 'event', 'social-media', 'referral', 'import'],
    default: 'website'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: Date,
  confirmationToken: String,
  isConfirmed: {
    type: Boolean,
    default: false
  },
  confirmedAt: Date,
  lastEmailSent: Date,
  emailsSent: {
    type: Number,
    default: 0
  },
  emailsOpened: {
    type: Number,
    default: 0
  },
  emailsClicked: {
    type: Number,
    default: 0
  },
  tags: [String], // e.g., ['donor', 'volunteer', 'adopter']
  notes: String
}, {
  timestamps: true
});

// Index for performance
newsletterSubscriberSchema.index({ status: 1, subscribedAt: -1 });
newsletterSubscriberSchema.index({ confirmationToken: 1 });

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
