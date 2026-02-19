const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    // Thông tin khách hàng
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },

    // Nội dung tư vấn
    serviceInterest: { type: String }, // Dịch vụ quan tâm
    concern: { type: String, required: true }, // Vấn đề / câu hỏi của khách

    // Thời gian mong muốn
    preferredDate: { type: String }, // VD: "Sáng thứ 3", "Cuối tuần"
    preferredBranch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },

    // Trạng thái xử lý
    status: {
        type: String,
        enum: ['pending', 'contacted', 'done', 'cancelled'],
        default: 'pending'
    },

    // Admin notes
    adminNotes: { type: String },
    assignedStaff: { type: String }, // Tên nhân viên phụ trách

    // Branch (nếu khách chọn chi nhánh)
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },

    // Source
    source: { type: String, default: 'website' }, // website, phone, walk-in
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
