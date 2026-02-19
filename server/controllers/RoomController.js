const Room = require('../models/Room');
const Bed = require('../models/Bed');
const ActionLogController = require('./ActionLogController');

// 1. Lấy danh sách tất cả phòng
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('branchId', 'name') // [FIX] Populate Branch Name
      .sort({ isActive: -1, name: 1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách phòng' });
  }
};

// 2. Tạo phòng mới
exports.createRoom = async (req, res) => {
  try {
    const { name, branchId, type, capacity, description } = req.body;
    
    // Check trùng tên
    const existing = await Room.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Tên phòng đã tồn tại' });

    const newRoom = new Room({ name, branchId, type, capacity, description });
    await newRoom.save();
    ActionLogController.createLog(req, req.user, 'ROOM_CREATE', 'Room', newRoom._id, newRoom.name);
    res.json({ success: true, message: 'Tạo phòng thành công', room: newRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo phòng' });
  }
};

// 3. Sửa phòng
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, branchId, type, capacity, description, isActive } = req.body;

        const room = await Room.findByIdAndUpdate(
            id, 
            { name, branchId, type, capacity, description, isActive }, 
            { new: true }
        ).populate('branchId', 'name');

        if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
        ActionLogController.createLog(req, req.user, 'ROOM_UPDATE', 'Room', room._id, room.name);
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
        const room = await Room.findByIdAndDelete(id);
        ActionLogController.createLog(req, req.user, 'ROOM_DELETE', 'Room', id, room?.name || id);
        res.json({ success: true, message: 'Xóa phòng thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi xóa phòng' });
    }
};

// ============================================================
// BED MANAGEMENT (Multi-bed per room)
// ============================================================

// 5. Lấy tất cả giường (có thể filter theo roomId hoặc branchId)
exports.getBeds = async (req, res) => {
    try {
        const { roomId, branchId } = req.query;
        const filter = {};
        if (roomId) filter.roomId = roomId;
        if (branchId) filter.branchId = branchId;

        const beds = await Bed.find(filter)
            .populate('roomId', 'name type')
            .populate('branchId', 'name')
            .sort({ roomId: 1, sortOrder: 1, name: 1 });

        res.json({ success: true, beds });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách giường' });
    }
};

// 6. Tạo giường mới trong phòng
exports.createBed = async (req, res) => {
    try {
        const { name, roomId, branchId, sortOrder } = req.body;
        if (!name || !roomId || !branchId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (name, roomId, branchId)' });
        }

        // Tự động tính sortOrder nếu không truyền
        const lastBed = await Bed.findOne({ roomId }).sort({ sortOrder: -1 });
        const nextOrder = sortOrder || (lastBed ? lastBed.sortOrder + 1 : 1);

        const bed = new Bed({ name, roomId, branchId, sortOrder: nextOrder });
        await bed.save();
        await bed.populate('roomId', 'name type');

        ActionLogController.createLog(req, req.user, 'BED_CREATE', 'Bed', bed._id, `${bed.name} (${bed.roomId?.name})`);
        res.json({ success: true, message: 'Tạo giường thành công', bed });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi tạo giường' });
    }
};

// 7. Cập nhật giường
exports.updateBed = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sortOrder, isActive } = req.body;

        const bed = await Bed.findByIdAndUpdate(
            id,
            { name, sortOrder, isActive },
            { new: true }
        ).populate('roomId', 'name type');

        if (!bed) return res.status(404).json({ success: false, message: 'Không tìm thấy giường' });
        ActionLogController.createLog(req, req.user, 'BED_UPDATE', 'Bed', bed._id, bed.name);
        res.json({ success: true, message: 'Cập nhật giường thành công', bed });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi cập nhật giường' });
    }
};

// 8. Xóa giường
exports.deleteBed = async (req, res) => {
    try {
        const { id } = req.params;
        const bed = await Bed.findByIdAndDelete(id);
        if (!bed) return res.status(404).json({ success: false, message: 'Không tìm thấy giường' });
        ActionLogController.createLog(req, req.user, 'BED_DELETE', 'Bed', id, bed.name);
        res.json({ success: true, message: 'Xóa giường thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi xóa giường' });
    }
};

// 9. Tự động tạo giường cho phòng dựa theo capacity (migration helper)
exports.autoCreateBedsForRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });

        const existingBeds = await Bed.countDocuments({ roomId });
        if (existingBeds > 0) {
            return res.status(400).json({ success: false, message: `Phòng đã có ${existingBeds} giường. Xóa hết trước khi tạo lại.` });
        }

        const capacity = room.capacity || 1;
        const bedsToCreate = [];
        for (let i = 1; i <= capacity; i++) {
            bedsToCreate.push({ name: `Giường ${i}`, roomId: room._id, branchId: room.branchId, sortOrder: i });
        }

        const created = await Bed.insertMany(bedsToCreate);
        res.json({ success: true, message: `Đã tạo ${created.length} giường cho phòng ${room.name}`, beds: created });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi tự động tạo giường' });
    }
};
