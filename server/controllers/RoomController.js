const Room = require('../models/Room');

// 1. Lấy danh sách tất cả phòng
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ isActive: -1, name: 1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách phòng' });
  }
};

// 2. Tạo phòng mới
exports.createRoom = async (req, res) => {
  try {
    const { name, type, capacity } = req.body;
    
    // Check trùng tên
    const existing = await Room.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Tên phòng đã tồn tại' });

    const newRoom = new Room({ name, type, capacity });
    await newRoom.save();
    
    res.json({ success: true, message: 'Tạo phòng thành công', room: newRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo phòng' });
  }
};

// 3. Sửa phòng
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, capacity, isActive } = req.body;

        const room = await Room.findByIdAndUpdate(
            id, 
            { name, type, capacity, isActive }, 
            { new: true }
        );

        if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
        res.json({ success: true, message: 'Cập nhật thành công', room });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi cập nhật' });
    }
};

// 4. Xóa phòng
exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        // Todo: Check if room has active bookings before delete
        await Room.findByIdAndDelete(id);
        res.json({ success: true, message: 'Xóa phòng thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi xóa phòng' });
    }
};
