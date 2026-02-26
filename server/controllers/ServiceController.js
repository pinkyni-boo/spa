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
        const { name, price, duration, breakTime, category, description, image, type, requiredRoomType } = req.body;
        const newService = new Service({
            name,
            price,
            duration,
            breakTime: breakTime || 30,
            category,
            description,
            image,
            type: type || 'service',
            requiredRoomType: requiredRoomType || 'BODY_SPA'
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


