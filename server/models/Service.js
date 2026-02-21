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
    required: true
  },
  breakTime: {
    type: Number,
    default: 30
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
  // Loại: service (dịch vụ) hoặc product (sản phẩm bán lẻ)
  type: {
      type: String,
      enum: ['service', 'product'],
      default: 'service'
  },
  requiredCapabilities: {
      type: [String],
      default: []
  },
  requiredRoomType: {
      type: String,
      enum: ['HEAD_SPA', 'BODY_SPA', 'NAIL_SPA', 'OTHER'],
      default: 'BODY_SPA'
  },
  isDeleted: {
      type: Boolean,
      default: false
  },
  // Quản lý tồn kho (chỉ áp dụng khi type === 'product')
  stock: {
      type: Number,
      default: null   // null = không quản lý tồn kho (dịch vụ)
  },
  stockUnit: {
      type: String,
      default: 'cái'  // cái, chai, hộp, tuúp...
  },
  lowStockAlert: {
      type: Number,
      default: 5      // Cảnh báo khi tồn kho ≤ mức này
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
