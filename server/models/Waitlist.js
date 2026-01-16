const mongoose = require('mongoose');

const WaitlistSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  serviceName: { type: String, required: true }, // Store name for quick display
  duration: { type: Number, default: 60 },
  preferredTime: { type: String }, // NEW: Store HH:mm
  note: { type: String },
  status: { type: String, default: 'waiting' }, // waiting, converted, cancelled
}, { timestamps: true });

module.exports = mongoose.model('Waitlist', WaitlistSchema);
