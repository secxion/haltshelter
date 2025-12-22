const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  
  // Double Opt-In Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'unsubscribed', 'bounced'],
    default: 'pending'
  },
  confirmationToken: String,
  confirmedAt: Date,
  
  // GDPR Compliance
  gdprConsent: { type: Boolean, default: false },
  consentVersion: { type: String, default: '1.0' },
  consentDate: Date,
  consentIp: String,
  
  // Preferences
  preferences: {
    generalNews: { type: Boolean, default: true },
    animalUpdates: { type: Boolean, default: true },
    events: { type: Boolean, default: true },
    fundraising: { type: Boolean, default: true },
    volunteerOpportunities: { type: Boolean, default: false }
  },
  
  // Source Tracking
  source: {
    type: String,
    enum: ['website', 'donation-form', 'event', 'social-media', 'referral', 'import'],
    default: 'website'
  },
  subscriptionSource: String,
  
  // Timestamps
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: Date,
  unsubscribeReason: String,
  lastEmailSent: Date,
  
  // Engagement Metrics
  emailsSent: { type: Number, default: 0 },
  emailsOpened: { type: Number, default: 0 },
  emailsClicked: { type: Number, default: 0 },
  bounceCount: { type: Number, default: 0 },
  complaintCount: { type: Number, default: 0 },
  
  // Additional Data
  tags: [String],
  notes: String,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes for performance
newsletterSubscriberSchema.index({ status: 1, subscribedAt: -1 });
newsletterSubscriberSchema.index({ confirmationToken: 1 });
newsletterSubscriberSchema.index({ email: 1 });
newsletterSubscriberSchema.index({ gdprConsent: 1, status: 1 });

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
