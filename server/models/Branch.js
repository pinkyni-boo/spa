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
    manager: {
        name: String,
        phone: String
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

module.exports = mongoose.model('Branch', branchSchema);
