const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true, 
    help: "Thời gian làm dịch vụ tính bằng phút (VD: 60, 90). Đây là chỉ số quan trọng để tính lịch." 
  },
  breakTime: {
    type: Number,
    default: 30, // Default 30 mins buffer as requested
    help: "Thời gian nghỉ/dọn dẹp sau dịch vụ"
  },
  image: {
    type: String,
    default: ""
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['Body', 'Face', 'Combo', 'Other', 'Head', 'Skincare', 'Haircare', 'Voucher'], // Added product categories
    default: 'Body'
  },
  // [NEW] Service Type (service vs product)
  type: {
      type: String,
      enum: ['service', 'product'],
      default: 'service'
  },
  // [NEW] Required Capabilities for Room/Staff Matching
  requiredCapabilities: {
      type: [String],
      default: []
  },
  // [NEW] Strict Room Type Requirement
  requiredRoomType: {
      type: String,
      enum: ['HEAD_SPA', 'BODY_SPA', 'NAIL_SPA', 'OTHER'],
      default: 'BODY_SPA'
  },
  // [NEW] Soft Delete
  isDeleted: {
      type: Boolean,
      default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
