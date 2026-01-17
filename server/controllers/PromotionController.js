const Promotion = require('../models/Promotion');
const PromotionUsage = require('../models/PromotionUsage');

// Get all promotions
exports.getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find()
            .populate('applicableServices', 'name')
            .populate('applicableBranches', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            promotions
        });
    } catch (error) {
        console.error('Error getting promotions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get active promotions
exports.getActivePromotions = async (req, res) => {
    try {
        const now = new Date();
        const promotions = await Promotion.find({
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).populate('applicableServices', 'name');
        
        res.json({
            success: true,
            promotions
        });
    } catch (error) {
        console.error('Error getting active promotions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create promotion
exports.createPromotion = async (req, res) => {
    try {
        const promotion = new Promotion(req.body);
        await promotion.save();
        
        res.json({
            success: true,
            message: 'Promotion created successfully',
            promotion
        });
    } catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update promotion
exports.updatePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }
        
        res.json({
            success: true,
            message: 'Promotion updated successfully',
            promotion
        });
    } catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete promotion
exports.deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            { status: 'inactive' },
            { new: true }
        );
        
        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }
        
        res.json({
            success: true,
            message: 'Promotion deactivated successfully',
            promotion
        });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Validate promotion code
exports.validateCode = async (req, res) => {
    try {
        const { code, orderValue, serviceId, branchId, customerPhone } = req.body;
        
        // Find promotion
        const promotion = await Promotion.findOne({ 
            code: code.toUpperCase(),
            status: 'active'
        });
        
        if (!promotion) {
            return res.json({
                success: false,
                message: 'Mã không hợp lệ hoặc đã hết hạn'
            });
        }
        
        // Check date range
        const now = new Date();
        if (now < promotion.startDate || now > promotion.endDate) {
            return res.json({
                success: false,
                message: 'Mã đã hết hạn hoặc chưa có hiệu lực'
            });
        }
        
        // Check usage limit
        if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
            return res.json({
                success: false,
                message: 'Mã đã hết lượt sử dụng'
            });
        }
        
        // Check per-user limit
        if (customerPhone) {
            const userUsageCount = await PromotionUsage.countDocuments({
                promotionId: promotion._id,
                customerPhone
            });
            
            if (userUsageCount >= promotion.perUserLimit) {
                return res.json({
                    success: false,
                    message: 'Bạn đã sử dụng hết lượt cho mã này'
                });
            }
        }
        
        // Check minimum order value
        if (orderValue < promotion.minOrderValue) {
            return res.json({
                success: false,
                message: `Đơn hàng tối thiểu ${promotion.minOrderValue.toLocaleString()} VNĐ`
            });
        }
        
        // Check applicable services
        if (promotion.applicableServices.length > 0 && serviceId) {
            const isApplicable = promotion.applicableServices.some(
                s => s.toString() === serviceId.toString()
            );
            if (!isApplicable) {
                return res.json({
                    success: false,
                    message: 'Mã không áp dụng cho dịch vụ này'
                });
            }
        }
        
        // Check applicable branches
        if (promotion.applicableBranches.length > 0 && branchId) {
            const isApplicable = promotion.applicableBranches.some(
                b => b.toString() === branchId.toString()
            );
            if (!isApplicable) {
                return res.json({
                    success: false,
                    message: 'Mã không áp dụng cho chi nhánh này'
                });
            }
        }
        
        // Check flash sale stock
        if (promotion.isFlashSale && promotion.flashSaleStock !== null) {
            if (promotion.flashSaleStock <= 0) {
                return res.json({
                    success: false,
                    message: 'Flash sale đã hết hàng'
                });
            }
        }
        
        // Calculate discount
        let discountAmount = 0;
        if (promotion.type === 'percentage') {
            discountAmount = Math.round((orderValue * promotion.value) / 100);
        } else {
            discountAmount = promotion.value;
        }
        
        // Ensure discount doesn't exceed order value
        discountAmount = Math.min(discountAmount, orderValue);
        
        res.json({
            success: true,
            message: 'Mã hợp lệ',
            promotion: {
                _id: promotion._id,
                code: promotion.code,
                name: promotion.name,
                type: promotion.type,
                value: promotion.value,
                isFlashSale: promotion.isFlashSale
            },
            discountAmount,
            finalPrice: orderValue - discountAmount
        });
    } catch (error) {
        console.error('Error validating code:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Apply promotion (track usage)
exports.applyPromotion = async (req, res) => {
    try {
        const { promotionId, bookingId, customerPhone, discountAmount } = req.body;
        
        // Create usage record
        const usage = new PromotionUsage({
            promotionId,
            bookingId,
            customerPhone,
            discountAmount
        });
        await usage.save();
        
        // Increment usage count
        await Promotion.findByIdAndUpdate(promotionId, {
            $inc: { usageCount: 1 }
        });
        
        // Decrement flash sale stock if applicable
        const promotion = await Promotion.findById(promotionId);
        if (promotion.isFlashSale && promotion.flashSaleStock !== null) {
            await Promotion.findByIdAndUpdate(promotionId, {
                $inc: { flashSaleStock: -1 }
            });
        }
        
        res.json({
            success: true,
            message: 'Promotion applied successfully'
        });
    } catch (error) {
        console.error('Error applying promotion:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
