const mongoose = require('mongoose');

// Schema cho Ca làm việc
const ShiftSchema = new mongoose.Schema({
  dayOfWeek: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 6 // 0: Chủ Nhật, 1: Thứ 2...
  },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "18:00"
  isOff: { type: Boolean, default: false }     // Ngày nghỉ
});

const StaffSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }, // [NEW]
  avatar: {
    type: String,
    default: ""
  },
  // Trạng thái làm việc: true = đang đi làm, false = nghỉ ốm/nghỉ phép
  isActive: { 
    type: Boolean, 
    default: true 
  },
  // Skills: Danh sách các dịch vụ nhân viên này làm được (VD: ["Massage Body", "Gội đầu"])
  // Sẽ map với Service Name hoặc Category
  skills: [{
    type: String
  }],
  // Ca làm việc cố định trong tuần
  shifts: [ShiftSchema]
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);
