const Gallery = require('../models/Gallery');

// Get All Gallery Items
exports.getAllGalleryItems = async (req, res) => {
    try {
        const { type } = req.query;
        let query = { isActive: true };
        if (type) query.type = type;

        const items = await Gallery.find(query)
            .populate('serviceId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, gallery: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper to get file path
const getFilePath = (req, fieldName) => {
    if (req.files && req.files[fieldName]) {
        return `${req.protocol}://${req.get('host')}/uploads/${req.files[fieldName][0].filename}`;
    }
    return req.body[fieldName]; // Fallback to body if URL string sent
};

// Create Gallery Item
exports.createGalleryItem = async (req, res) => {
    try {
        const { title, description, serviceId, type } = req.body;
        
        const beforeImage = getFilePath(req, 'beforeImage');
        const afterImage = getFilePath(req, 'afterImage');
        const imageUrl = getFilePath(req, 'imageUrl');

        const newItem = new Gallery({
            title,
            beforeImage,
            afterImage,
            imageUrl,
            description,
            serviceId,
            type: type || 'result'
        });

        await newItem.save();
        res.json({ success: true, item: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Gallery Item
exports.updateGalleryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Update images if new files provided
        if (req.files) {
            if (req.files['beforeImage']) updateData.beforeImage = getFilePath(req, 'beforeImage');
            if (req.files['afterImage']) updateData.afterImage = getFilePath(req, 'afterImage');
            if (req.files['imageUrl']) updateData.imageUrl = getFilePath(req, 'imageUrl');
        }

        const updatedItem = await Gallery.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true, item: updatedItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Gallery Item
exports.deleteGalleryItem = async (req, res) => {
    try {
        const { id } = req.params;
        await Gallery.findByIdAndDelete(id);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
