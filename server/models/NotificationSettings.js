// NotificationSettings.js
const mongoose = require('mongoose');

const NotificationSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // null for global
  email: { type: Boolean, default: true },
  system: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NotificationSettings', NotificationSettingsSchema);
