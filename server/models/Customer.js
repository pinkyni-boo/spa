const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String }, // Optional
    
    // Stats
    totalVisits: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    
    lastVisit: { type: Date },
    
    // Insights
    notes: { type: String }, // "Thich uong tra", "Di ung..."
    preferences: [{ type: String }], // Tags like "Strong Massage", "Quiet"
    
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
