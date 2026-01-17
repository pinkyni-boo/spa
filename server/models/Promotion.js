const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Validity
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    },
    
    // Limits
    usageLimit: {
        type: Number,
        default: null  // null = unlimited
    },
    usageCount: {
        type: Number,
        default: 0
    },
    perUserLimit: {
        type: Number,
        default: 1
    },
    
    // Applicability
    minOrderValue: {
        type: Number,
        default: 0
    },
    applicableServices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    applicableBranches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }],
    
    // Flash Sale
    isFlashSale: {
        type: Boolean,
        default: false
    },
    flashSaleStock: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});

// Auto-update status based on dates
promotionSchema.pre('save', function(next) {
    const now = new Date();
    if (this.endDate < now) {
        this.status = 'expired';
    }
    next();
});

module.exports = mongoose.model('Promotion', promotionSchema);
