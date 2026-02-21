const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['owner', 'admin', 'staff'], 
    default: 'staff' 
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  },
  // If role is 'admin', this array contains Branch IDs they manage
  managedBranches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  phone: String,
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
