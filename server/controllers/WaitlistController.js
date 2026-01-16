const Waitlist = require('../models/Waitlist');

exports.addToWaitlist = async (req, res) => {
    try {
        const { customerName, phone, serviceName, duration, note, preferredTime } = req.body;
        const newItem = new Waitlist({
            customerName,
            phone,
            serviceName,
            duration,
            preferredTime,
            note
        });
        await newItem.save();
        res.json({ success: true, item: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWaitlist = async (req, res) => {
    try {
        const items = await Waitlist.find({ status: 'waiting' }).sort({ createdAt: 1 }); // Oldest first
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
