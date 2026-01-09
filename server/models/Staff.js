const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  avatar: {
    type: String,
    default: ""
  },
  // Trạng thái làm việc: true = đang đi làm, false = nghỉ ốm/nghỉ phép
  isActive: { 
    type: Boolean, 
    default: true 
  },
  // Sau này có thể mở rộng thêm skills (NV này chỉ làm được Body, không làm được Face...)
  skills: [{
    type: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);
