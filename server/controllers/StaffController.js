const Staff = require('../models/Staff');

// 1. Lấy danh sách nhân viên
exports.getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find().sort({ isActive: -1, name: 1 });
        res.json({ success: true, staff });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách nhân viên' });
    }
};

// 2. Cập nhật Kỹ năng & Ca làm việc (Quan trọng cho Booking)
exports.updateStaffDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { skills, shifts, isActive } = req.body;

        // Validate shifts logic (nếu cần)
        // VD: startTime < endTime

        const staff = await Staff.findByIdAndUpdate(
            id,
            { skills, shifts, isActive },
            { new: true }
        );

        if (!staff) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });

        res.json({ success: true, message: 'Cập nhật nhân viên thành công', staff });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật nhân viên' });
    }
};
