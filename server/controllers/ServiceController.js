const Service = require('../models/Service');
const ActionLogController = require('./ActionLogController');

exports.getAllServices = async (req, res) => {
    try {
        const { type } = req.query;
        let query = { isDeleted: { $ne: true } };

        if (type === 'service') {
            // Legacy support: old docs may not have 'type' field
            query = {
                ...query,
                $or: [
                    { type: 'service' },
                    { type: { $exists: false } },
                    { type: null }
                ]
            };
        } else if (type === 'product') {
            query = { ...query, type: 'product' };
        }

        const services = await Service.find(query).sort({ createdAt: -1 });
        
        res.json({ success: true, services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createService = async (req, res) => {
    try {
        const { name, price, duration, breakTime, category, description, image, type } = req.body;
        const newService = new Service({
            name,
            price,
            duration,
            breakTime: breakTime || 30,
            category,
            description,
            image,
            type: type || 'service'
        });
        await newService.save();
        ActionLogController.createLog(req, req.user, 'SERVICE_CREATE', 'Service', newService._id, newService.name);
        res.json({ success: true, service: newService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true });
        ActionLogController.createLog(req, req.user, 'SERVICE_UPDATE', 'Service', updatedService._id, updatedService.name);
        res.json({ success: true, service: updatedService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const svc = await Service.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        ActionLogController.createLog(req, req.user, 'SERVICE_DELETE', 'Service', id, svc?.name || id);
        res.json({ success: true, message: 'Deleted successfully (Soft)' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.seedServices = async (req, res) => {
    try {
        // 1. Delete all existing SERVICES (keep products if any, or delete all as requested)
        // User said "xóa hết data mẫu cũ của dịch vụ", implying services. 
        // Safest is to delete items with type='service' or missing type.
        await Service.deleteMany({ 
            $or: [
                { type: 'service' }, 
                { type: { $exists: false } }, 
                { type: null }
            ] 
        });

        // 2. Insert Sample Data
        const samples = [
            { name: "Massage Body Thụy Điển", price: 450000, duration: 60, breakTime: 15, category: "Body", type: "service", image: "" },
            { name: "Massage Thái Cổ Truyền", price: 500000, duration: 90, breakTime: 20, category: "Body", type: "service", image: "" },
            { name: "Chăm Sóc Da Mặt Cơ Bản", price: 350000, duration: 45, breakTime: 15, category: "Face", type: "service", image: "" },
            { name: "Trị Liệu Da Mụn Chuyên Sâu", price: 600000, duration: 75, breakTime: 20, category: "Face", type: "service", image: "" },
            { name: "Gội Đầu Dưỡng Sinh (Thường)", price: 150000, duration: 30, breakTime: 10, category: "Head", type: "service", image: "" },
            { name: "Gội Đầu Thảo Dược VIP", price: 250000, duration: 60, breakTime: 15, category: "Head", type: "service", image: "" },
            { name: "Combo Thư Giãn (Gội + Massage)", price: 700000, duration: 120, breakTime: 30, category: "Combo", type: "service", image: "" }
        ];

        await Service.insertMany(samples);
        res.json({ success: true, message: 'Seeded services successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
