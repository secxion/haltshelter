// OrganizationSettings.js
const mongoose = require('mongoose');

const OrganizationSettingsSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  contact: { type: String, default: '' },
  address: { type: String, default: '' },
  logo: { type: String, default: '' },
  // Global counter for animals rescued (used on the frontend 'Animals Rescued')
  animalsRescued: { type: Number, default: 107 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OrganizationSettings', OrganizationSettingsSchema);
