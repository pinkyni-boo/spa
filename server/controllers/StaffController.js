const Staff = require('../models/Staff');
const ActionLogController = require('./ActionLogController');

// 1. Lấy danh sách nhân viên
exports.getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find({ isDeleted: { $ne: true } }) // [FIX] Soft Delete Filter
            .populate('branchId', 'name') // [FIX] Populate Branch Name
            .sort({ isActive: -1, name: 1 });
        res.json({ success: true, staff });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách nhân viên' });
    }
};

// 2. Tạo nhân viên mới
exports.createStaff = async (req, res) => {
    try {
        const { name, phone, branchId, role, shifts, isActive } = req.body; // [UPDATED] add role
        
        const newStaff = new Staff({
            name,
            phone,
            branchId,
            role, // [NEW]
            shifts: shifts || [],
            isActive: isActive !== undefined ? isActive : true
        });
        
        await newStaff.save();
        ActionLogController.createLog(req, req.user, 'STAFF_CREATE', 'Staff', newStaff._id, newStaff.name);
        res.json({ success: true, message: 'Tạo nhân viên thành công', staff: newStaff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi tạo nhân viên' });
    }
};

// 3. Cập nhật Kỹ năng & Ca làm việc (Quan trọng cho Booking)
exports.updateStaffDetails = async (req, res) => {
    try {
        const { id } = req.params;
        // [FIX] Allow updating name, phone, branchId
        const { name, phone, branchId, role, skills, shifts, isActive } = req.body; // [UPDATED] add role

        // Validate shifts logic (nếu cần)
        // VD: startTime < endTime

        const staff = await Staff.findByIdAndUpdate(
            id,
            { name, phone, branchId, role, skills, shifts, isActive }, // [UPDATED]
            { new: true }
        );

        if (!staff) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        ActionLogController.createLog(req, req.user, 'STAFF_UPDATE', 'Staff', staff._id, staff.name);
        res.json({ success: true, message: 'Cập nhật nhân viên thành công', staff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật nhân viên' });
    }
};

// 4. Xóa nhân viên (Soft Delete)
exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!staff) return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên' });
        ActionLogController.createLog(req, req.user, 'STAFF_DELETE', 'Staff', id, staff.name);
        res.json({ success: true, message: 'Đã xóa nhân viên (Soft Delete)' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi xóa nhân viên' });
    }
};
