const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('managedBranches', 'name').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { username, password, name, role, managedBranches, phone } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const newUser = new User({
            username,
            password, // Plain text for now as requested
            name,
            role,
            managedBranches: role === 'admin' ? managedBranches : [], // Only admins have branches
            phone
        });

        await newUser.save();

        res.json({ success: true, user: newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, managedBranches, phone, password, isActive } = req.body;

        const updateData = {
            name,
            role,
            phone,
            isActive,
            managedBranches: role === 'admin' ? managedBranches : []
        };

        if (password) {
            updateData.password = password;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).populate('managedBranches', 'name');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
