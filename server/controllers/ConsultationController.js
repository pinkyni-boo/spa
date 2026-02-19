const Consultation = require('../models/Consultation');
const ActionLogController = require('./ActionLogController');

// Public: Khách gửi yêu cầu tư vấn
exports.createConsultation = async (req, res) => {
    try {
        const { customerName, phone, email, serviceInterest, concern, preferredDate, preferredBranch, source } = req.body;

        if (!customerName || !phone || !concern) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập họ tên, số điện thoại và nội dung tư vấn.' });
        }

        const consultation = new Consultation({
            customerName: customerName.trim(),
            phone: phone.trim(),
            email: email?.trim(),
            serviceInterest,
            concern: concern.trim(),
            preferredDate,
            preferredBranch: preferredBranch || undefined,
            branchId: preferredBranch || undefined,
            source: source || 'website',
        });

        await consultation.save();

        res.status(201).json({ success: true, message: 'Yêu cầu tư vấn đã được gửi thành công!', consultation });
    } catch (error) {
        console.error('createConsultation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Lấy danh sách tư vấn
exports.getAllConsultations = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const query = {};

        if (status) query.status = status;

        // Branch isolation: chỉ lọc nếu là admin có branch, nhưng vẫn hiện consultation không có branchId
        if (req.user?.role === 'admin' && req.user?.branchId) {
            query.$or = [
                { branchId: req.user.branchId },
                { branchId: null },
                { branchId: { $exists: false } },
            ];
        }

        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { concern: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Consultation.countDocuments(query);
        const consultations = await Consultation.find(query)
            .populate('preferredBranch', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        res.json({ success: true, consultations, total, page: Number(page), limit: Number(limit) });
    } catch (error) {
        console.error('getAllConsultations error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Cập nhật trạng thái / ghi chú
exports.updateConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, assignedStaff } = req.body;

        const consultation = await Consultation.findById(id);
        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu tư vấn.' });
        }

        if (status) consultation.status = status;
        if (adminNotes !== undefined) consultation.adminNotes = adminNotes;
        if (assignedStaff !== undefined) consultation.assignedStaff = assignedStaff;

        await consultation.save();

        ActionLogController.createLog(req, {
            action: 'SYSTEM_CONFIG',
            targetType: 'Consultation',
            targetId: consultation._id,
            targetName: consultation.customerName,
            details: { status, adminNotes, assignedStaff },
        });

        res.json({ success: true, message: 'Đã cập nhật.', consultation });
    } catch (error) {
        console.error('updateConsultation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Xóa yêu cầu tư vấn
exports.deleteConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const consultation = await Consultation.findByIdAndDelete(id);
        if (!consultation) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu tư vấn.' });
        }

        res.json({ success: true, message: 'Đã xóa.' });
    } catch (error) {
        console.error('deleteConsultation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
