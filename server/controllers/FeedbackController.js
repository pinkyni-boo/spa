const Feedback = require('../models/Feedback');

// Get all feedbacks (admin)
exports.getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('serviceId', 'name')
            .populate('bookingId')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            feedbacks
        });
    } catch (error) {
        console.error('Error getting feedbacks:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get approved feedbacks (public)
exports.getApprovedFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ status: 'approved' })
            .populate('serviceId', 'name')
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.json({
            success: true,
            feedbacks
        });
    } catch (error) {
        console.error('Error getting approved feedbacks:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create feedback
exports.createFeedback = async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        
        res.json({
            success: true,
            message: 'Feedback submitted successfully',
            feedback
        });
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Approve feedback
exports.approveFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'approved',
                reviewedAt: new Date()
            },
            { new: true }
        );
        
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }
        
        res.json({
            success: true,
            message: 'Feedback approved',
            feedback
        });
    } catch (error) {
        console.error('Error approving feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Reject feedback
exports.rejectFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'rejected',
                reviewedAt: new Date()
            },
            { new: true }
        );
        
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }
        
        res.json({
            success: true,
            message: 'Feedback rejected',
            feedback
        });
    } catch (error) {
        console.error('Error rejecting feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }
        
        res.json({
            success: true,
            message: 'Feedback deleted'
        });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
