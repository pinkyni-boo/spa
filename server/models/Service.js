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
    enum: ['Body', 'Face', 'Combo', 'Other', 'Head'],
    default: 'Body'
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
