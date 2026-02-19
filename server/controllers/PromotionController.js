const Promotion = require('../models/Promotion');
const PromotionUsage = require('../models/PromotionUsage');
const Booking = require('../models/Booking'); // [NEW] For conflict checking
const ActionLogController = require('./ActionLogController');

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

// [NEW] Suggest Applicable Promotions
exports.suggestPromotions = async (req, res) => {
    try {
        const { orderValue, branchId } = req.body; // Expecting current cart total
        const now = new Date();

        // Find active promotions
        const promotions = await Promotion.find({
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
            // Filter by Order Value
            minOrderValue: { $lte: orderValue || 0 }
        });

        // Further Filter by Branch (if specific) in memory or query
        const validPromotions = promotions.filter(p => {
            // Check Branch
            if (p.applicableBranches && p.applicableBranches.length > 0 && branchId) {
                return p.applicableBranches.map(b => b.toString()).includes(branchId);
            }
            return true; // No branch restriction = Global
        });

        res.json({ success: true, promotions: validPromotions });
    } catch (error) {
        console.error('Error suggesting promotions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create promotion
exports.createPromotion = async (req, res) => {
    try {
        console.log('[CREATE PROMOTION] Request body:', JSON.stringify(req.body, null, 2)); // [DEBUG] Log request
        const promotion = new Promotion(req.body);
        await promotion.save();
        ActionLogController.createLog(req, req.user, 'PROMOTION_CREATE', 'Promotion', promotion._id, promotion.name || promotion.code);
        res.json({
            success: true,
            message: 'Promotion created successfully',
            promotion
        });
    } catch (error) {
        console.error('Error creating promotion:', error);
        console.error('Error details:', error.message); // [DEBUG] Detailed error
        console.error('Stack:', error.stack); // [DEBUG] Stack trace
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message // [DEBUG] Send error message to frontend
        });
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
        ActionLogController.createLog(req, req.user, 'PROMOTION_UPDATE', 'Promotion', promotion._id, promotion.name || promotion.code);
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
        ActionLogController.createLog(req, req.user, 'PROMOTION_DELETE', 'Promotion', promotion._id, promotion.name || promotion.code);
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
        const { code, orderValue, serviceId, branchId, customerPhone, bookingId } = req.body; // [NEW] bookingId for conflict check
        
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
        
        // [NEW] ⚠️ COUPON CONFLICT CHECK ⚠️
        // Check if booking already has promotions that conflict
        if (bookingId) {
            const booking = await Booking.findById(bookingId).populate('appliedPromotions.promotionId');
            
            if (booking && booking.appliedPromotions && booking.appliedPromotions.length > 0) {
                // Booking already has at least one promotion
                const existingPromotion = booking.appliedPromotions[0].promotionId;
                
                // Check if EXISTING promotion allows combining
                if (existingPromotion && existingPromotion.allowCombine === false) {
                    return res.json({
                        success: false,
                        message: `⛔ Đơn hàng đã có mã "${existingPromotion.code}" không cho phép kết hợp với mã khác!`,
                        conflictReason: 'existing_promotion_no_combine',
                        existingPromotion: {
                            code: existingPromotion.code,
                            name: existingPromotion.name
                        }
                    });
                }
                
                // Check if NEW promotion allows combining
                if (promotion.allowCombine === false) {
                    return res.json({
                        success: false,
                        message: `⛔ Mã "${promotion.code}" không thể dùng chung với các ưu đãi khác! Vui lòng hủy mã hiện tại để sử dụng mã này.`,
                        conflictReason: 'new_promotion_no_combine',
                        existingPromotion: {
                            code: existingPromotion.code,
                            name: existingPromotion.name
                        }
                    });
                }
                
                // Both allow combining → Show warning but allow
                // (Optional: You can add more complex rules here, e.g. max 2 promotions)
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
                isFlashSale: promotion.isFlashSale,
                allowCombine: promotion.allowCombine // [NEW] Return conflict flag
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
        
        // [NEW] ⚠️ DOUBLE CHECK CONFLICT BEFORE APPLYING ⚠️
        // This is the FINAL gate - validateCode already checked, but we check again for safety
        const booking = await Booking.findById(bookingId).populate('appliedPromotions.promotionId');
        const promotion = await Promotion.findById(promotionId);
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }
        
        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
        }
        
        // Final conflict check
        if (booking.appliedPromotions && booking.appliedPromotions.length > 0) {
            const existingPromotion = booking.appliedPromotions[0].promotionId;
            
            if (existingPromotion.allowCombine === false || promotion.allowCombine === false) {
                return res.status(400).json({ 
                    success: false, 
                    message: '⛔ Không thể áp dụng mã này do xung đột với mã hiện tại!' 
                });
            }
        }
        
        // [NEW] Save promotion to booking
        booking.appliedPromotions.push({
            promotionId: promotion._id,
            code: promotion.code,
            discountAmount: discountAmount
        });
        
        // [NEW] Update total discount and final price
        booking.totalDiscount = (booking.totalDiscount || 0) + discountAmount;
        
        // Recalculate final price
        // Assume booking has a base price (from serviceId or calculated before)
        const basePrice = booking.finalPrice + (booking.totalDiscount - discountAmount) || 0;
        booking.finalPrice = Math.max(0, basePrice - booking.totalDiscount);
        
        await booking.save();
        
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
        if (promotion.isFlashSale && promotion.flashSaleStock !== null) {
            await Promotion.findByIdAndUpdate(promotionId, {
                $inc: { flashSaleStock: -1 }
            });
        }
        
        res.json({
            success: true,
            message: 'Áp dụng mã thành công!',
            booking: {
                appliedPromotions: booking.appliedPromotions,
                totalDiscount: booking.totalDiscount,
                finalPrice: booking.finalPrice
            }
        });
    } catch (error) {
        console.error('Error applying promotion:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
