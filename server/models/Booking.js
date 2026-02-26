const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: false, default: '' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  
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
    default: null
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  // Giường cụ thể trong phòng
  bedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bed',
    default: null
  },

  // Thời gian bắt đầu và kết thúc (Quan trọng để check trùng)
  startTime: { type: Date, required: true }, 
  endTime: { type: Date, required: true }, 
  // Thời gian dọn dẹp (phút) - Mặc định 10p, có thể chỉnh
  bufferTime: { type: Number, default: 0 },
// endTime = startTime + service.duration
  
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'], 
    default: 'pending' 
  },

  // Phân loại nguồn: online (khách đặt web) vs offline (nhân viên đặt)
  source: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },

  // Trạng thái thanh toán
  paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid'
  },
  
  // Thời gian thực tế: Check-in / Checkout
  actualStartTime: { type: Date },
  actualEndTime: { type: Date },

  // Dịch vụ thực tế đã làm (có thể upsell thêm)
  servicesDone: [{
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      name: String, // Snapshot name
      price: Number, // Snapshot price
      qty: { type: Number, default: 1 }
  }],
  
  // Sản phẩm mua thêm (Retail)
  productsBought: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' }, // Dùng bảng Service type='product'
      name: String,
      price: Number,
      qty: { type: Number, default: 1 }
  }],

  // Liên kết đơn con (khi +DV tạo booking riêng cho bảng biểu)
  parentBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },

  // Tổng tiền chốt sau khi hoàn thành dịch vụ
  finalPrice: { type: Number, default: 0 },

  // Khuyến mãi đã áp dụng
  appliedPromotions: [{
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
    code: String,
    discountAmount: Number,
    appliedAt: { type: Date, default: Date.now }
  }],
  totalDiscount: { type: Number, default: 0 }, // Sum of all discounts

  note: { type: String }
}, { timestamps: true });

// ---------------------------------------------------------
// DATABASE INDEXES (Performance Optimization)
// ---------------------------------------------------------
// Index 1: Time-based queries (checkAvailability, getAllBookings)
// Most common query: Find bookings by date range + status
BookingSchema.index({ startTime: 1, status: 1 });

// Index 2: Branch isolation (checkAvailability, createBooking)
// Queries filter by branch heavily
BookingSchema.index({ branchId: 1, startTime: 1 });

// Index 3: Room allocation (createBooking - overlap detection)
// Check concurrent bookings in same room
BookingSchema.index({ roomId: 1, startTime: 1, status: 1 });

// Index 4: Staff allocation (createBooking - overlap detection)
// Check staff busy times
BookingSchema.index({ staffId: 1, startTime: 1, status: 1 });

// Index 5: Customer history (getCustomerHistory)
BookingSchema.index({ phone: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', BookingSchema);
