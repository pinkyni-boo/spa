const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    reason: { type: String, required: true },       // Nội dung chi (VD: "Mua nước đá, lau sàn")
    category: {
        type: String,
        enum: ['supply', 'food', 'salary', 'utility', 'other'],
        default: 'other'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'banking', 'card'],
        default: 'cash'
    },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    createdBy: { type: String, default: 'Admin' },  // Tên người lập phiếu chi
    date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
