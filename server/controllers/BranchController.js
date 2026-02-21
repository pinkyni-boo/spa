const Branch = require('../models/Branch');
const ActionLogController = require('./ActionLogController');

// Get all branches
exports.getAllBranches = async (req, res) => {
    try {
        const branches = await Branch.find()
            .populate('managerId', 'name phone email')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            branches
        });
    } catch (error) {
        console.error('Error getting branches:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get single branch
exports.getBranch = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id)
            .populate('managerId', 'name phone email');
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        res.json({
            success: true,
            branch
        });
    } catch (error) {
        console.error('Error getting branch:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create branch
exports.createBranch = async (req, res) => {
    try {
        const { name, address, phone, email, managerId, workingHours } = req.body;

        const branch = new Branch({
            name,
            address,
            phone,
            email,
            managerId,
            workingHours,
            status: 'active'
        });

        await branch.save();
        ActionLogController.createLog(req, req.user, 'BRANCH_CREATE', 'Branch', branch._id, branch.name);
        res.json({
            success: true,
            message: 'Branch created successfully',
            branch
        });
    } catch (error) {
        console.error('Error creating branch:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update branch
exports.updateBranch = async (req, res) => {
    try {
        const { name, address, phone, email, managerId, workingHours, status } = req.body;

        const branch = await Branch.findByIdAndUpdate(
            req.params.id,
            { name, address, phone, email, managerId, workingHours, status },
            { new: true, runValidators: true }
        ).populate('managerId', 'name phone email');

        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        ActionLogController.createLog(req, req.user, 'BRANCH_UPDATE', 'Branch', branch._id, branch.name);
        res.json({
            success: true,
            message: 'Branch updated successfully',
            branch
        });
    } catch (error) {
        console.error('Error updating branch:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete branch (soft delete - set inactive)
exports.deleteBranch = async (req, res) => {
    try {
        const branch = await Branch.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { new: true }
        );

        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }
        ActionLogController.createLog(req, req.user, 'BRANCH_DELETE', 'Branch', branch._id, branch.name);
        res.json({
            success: true,
            message: 'Branch deactivated successfully',
            branch
        });
    } catch (error) {
        console.error('Error deleting branch:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get branch statistics
exports.getBranchStats = async (req, res) => {
    try {
        const Booking = require('../models/Booking');
        const Room = require('../models/Room');
        const Staff = require('../models/Staff');

        const branchId = req.params.id;

        // Count resources
        const [totalBookings, totalRooms, totalStaff] = await Promise.all([
            Booking.countDocuments({ branchId }),
            Room.countDocuments({ branchId }),
            Staff.countDocuments({ branchId, status: 'active' })
        ]);

        res.json({
            success: true,
            stats: {
                totalBookings,
                totalRooms,
                totalStaff
            }
        });
    } catch (error) {
        console.error('Error getting branch stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
