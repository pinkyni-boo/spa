const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff' // [CHANGED] from 'User' to 'Staff' - Admin is a staff member with role='admin'
    },
    workingHours: { // [CHANGED] for consistency with previous discussion
        open: {
            type: String,
            default: '09:00'
        },
        close: {
            type: String,
            default: '20:00' // [CHANGED] Standard Spa time as per User request
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Branch || mongoose.model('Branch', branchSchema);
