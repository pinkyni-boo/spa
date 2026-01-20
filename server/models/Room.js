const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }, // [NEW]
  type: { 
    type: String, 
    enum: ['Standard', 'VIP', 'Couple'], 
    default: 'Standard' 
  },
  description: {
      type: String,
      default: ""
  },
  // Sức chứa (Standard/VIP = 1, Couple = 2)
  capacity: { 
    type: Number, 
    default: 1 
  },
  // Phòng có đang hoạt động không (hay đang bảo trì)
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
