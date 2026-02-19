const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema({
    // Who performed the action
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: { type: String, required: true }, // Snapshot of name
    role: { type: String, required: true },

    // What happened
    action: { 
        type: String, 
        required: true,
        enum: [
            'AUTH_LOGIN',
            'BOOKING_CREATE', 'BOOKING_UPDATE', 'BOOKING_DELETE', 'BOOKING_CANCEL', 'BOOKING_APPROVE', 'BOOKING_CHECKIN', 'BOOKING_COMPLETE',
            'SERVICE_CREATE', 'SERVICE_UPDATE', 'SERVICE_DELETE',
            'STAFF_CREATE', 'STAFF_UPDATE', 'STAFF_DELETE',
            'ROOM_CREATE', 'ROOM_UPDATE', 'ROOM_DELETE',
            'PROMOTION_CREATE', 'PROMOTION_UPDATE', 'PROMOTION_DELETE',
            'BRANCH_CREATE', 'BRANCH_UPDATE', 'BRANCH_DELETE',
            'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
            'FEEDBACK_APPROVE', 'FEEDBACK_REJECT', 'FEEDBACK_DELETE',
            'SYSTEM_CONFIG'
        ] 
    },
    
    // Target of the action
    targetType: { type: String, required: true }, // e.g. 'Booking', 'Service'
    targetId: { type: String, required: false }, // ID of the object
    targetName: { type: String, required: false }, // Human readable target name (e.g. Booking #123)

    // Details (Changes)
    details: { type: Object, required: false }, // { before: ..., after: ... } or check-in details
    
    // Metadata
    ip: { type: String, required: false },
    userAgent: { type: String, required: false },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: false },

    timestamp: { type: Date, default: Date.now, index: true }
});

// Index for fast querying by target or user
actionLogSchema.index({ targetType: 1, targetId: 1 });
actionLogSchema.index({ user: 1 });
actionLogSchema.index({ branchId: 1 });

module.exports = mongoose.model('ActionLog', actionLogSchema);
