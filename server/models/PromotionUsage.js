const mongoose = require('mongoose');

const promotionUsageSchema = new mongoose.Schema({
    promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    discountAmount: {
        type: Number,
        required: true
    },
    usedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PromotionUsage', promotionUsageSchema);
