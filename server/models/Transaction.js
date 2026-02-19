const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true }, // "Thu tiền khách A", "Mua nước rửa chén"
    category: {
        type: String,
        enum: ['booking', 'retail', 'tip', 'other_income', 'supply', 'salary', 'utility', 'food', 'other_expense'],
        default: 'other_income'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'banking', 'card'],
        default: 'cash'
    },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    createdBy: { type: String, default: 'Admin' }, // Tên người ghi
    date: { type: Date, default: Date.now },
    note: { type: String },
    // Link to booking/invoice nếu có
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
