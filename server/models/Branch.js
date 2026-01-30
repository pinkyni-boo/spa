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
    operatingHours: {
        open: {
            type: String,
            default: '08:00'
        },
        close: {
            type: String,
            default: '22:00'
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Branch || mongoose.model('Branch', branchSchema);
