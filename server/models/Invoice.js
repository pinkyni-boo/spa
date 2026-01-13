const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  // Liên kết ngược về Booking (nếu có)
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking',
    default: null // Null nếu là hóa đơn mua lẻ (Retail Only)
  },

  // Thông tin khách hàng (Snapshot)
  customerName: { type: String, required: true },
  phone: { type: String, default: "" },

  // Chi tiết hóa đơn (Gộp cả Service + Product)
  items: [{
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      type: { type: String, enum: ['service', 'product'], required: true },
      name: String,   // Snapshot
      price: Number,  // Snapshot at checkout time
      qty: Number,
      subtotal: Number
  }],

  // Tài chính
  subTotal: { type: Number, required: true }, // Trước giảm giá
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  finalTotal: { type: Number, required: true }, // Khách phải trả

  // Phương thức thanh toán
  paymentMethod: {
      type: String,
      enum: ['cash', 'banking', 'card'],
      default: 'cash'
  },

  // Người lập hóa đơn
  cashierName: { type: String, default: "Admin" },

  // Ghi chú
  note: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
