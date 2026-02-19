const mongoose = require('mongoose');

/**
 * Bed — giường vật lý trong một phòng
 * Mỗi phòng (Room) có thể có nhiều giường.
 * Booking sẽ được gán vào một giường cụ thể.
 */
const BedSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true   // VD: "Giường 1", "Giường 2", "Giường VIP"
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    // Thứ tự hiển thị trong calendar
    sortOrder: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index để query nhanh theo phòng
BedSchema.index({ roomId: 1, isActive: 1 });
BedSchema.index({ branchId: 1, isActive: 1 });

module.exports = mongoose.model('Bed', BedSchema);
