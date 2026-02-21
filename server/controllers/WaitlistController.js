const Waitlist = require('../models/Waitlist');

exports.addToWaitlist = async (req, res) => {
    try {
        const { customerName, phone, serviceName, duration, note, preferredTime, branchId } = req.body;
        const newItem = new Waitlist({
            customerName,
            phone,
            serviceName,
            duration,
            preferredTime,
            note,
            branchId: branchId || null,
        });
        await newItem.save();
        res.json({ success: true, item: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWaitlist = async (req, res) => {
    try {
        const query = { status: 'waiting' };

        // Branch isolation: admin chỉ thấy waitlist của chi nhánh mình quản lý
        if (req.user?.role === 'owner') {
            // owner thấy tất cả
        } else if (req.user?.managedBranches?.length > 0) {
            query.branchId = { $in: req.user.managedBranches };
        } else if (req.user?.branchId) {
            query.branchId = req.user.branchId;
        }

        const items = await Waitlist.find(query).sort({ createdAt: 1 }); // Oldest first
        res.json({ success: true, items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteWaitlist = async (req, res) => {
    try {
        const { id } = req.params;
        await Waitlist.findByIdAndDelete(id);
        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
