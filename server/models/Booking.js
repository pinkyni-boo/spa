const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  
  // Liên kết với bảng Service để lấy giá và thời lượng
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Service', 
    required: true 
  },
  
  // Có thể null nếu khách đặt online mà chưa ai nhận (Pending)
  staffId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff',
    default: null // Sẽ thành mandatory ở Phase 2
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null // Sẽ thành mandatory khi logic hoàn thiện
  },

  // Thời gian bắt đầu và kết thúc (Quan trọng để check trùng)
  startTime: { type: Date, required: true }, 
  endTime: { type: Date, required: true }, 
  // Thời gian dọn dẹp (phút) - Mặc định 10p, có thể chỉnh
  bufferTime: { type: Number, default: 0 },
// endTime = startTime + service.duration
  
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },

  // Phân loại nguồn: online (khách đặt web) vs offline (nhân viên đặt)
  source: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },

  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
