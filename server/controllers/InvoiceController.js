const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const CustomerController = require('./CustomerController'); // [NEW] Link CRM
const Promotion = require('../models/Promotion'); // [NEW] Link Promotion
const PromotionUsage = require('../models/PromotionUsage'); // [NEW] Link Usage

// 1. Create Invoice (Checkout)
exports.createInvoice = async (req, res) => {
    try {
        const { bookingId, customerName, phone, items, subTotal, discount, tax, finalTotal, tipAmount, tipStaffName, surchargeFee, paymentMethod, cashierName, promotionId, pointsUsed } = req.body;

        // Validation
        if (!finalTotal && finalTotal !== 0) { // Check undefined/null but allow 0
            return res.status(400).json({ success: false, message: 'Tổng tiền không hợp lệ' });
        }

        // [LOGIC] 1. Handle Promotion Usage
        if (promotionId) {
            // Find Promotion
            const promotion = await Promotion.findById(promotionId);
            if (promotion) {
                // Record Usage
                const usage = new PromotionUsage({
                    promotionId: promotion._id,
                    bookingId: bookingId, // Can be null for retail
                    customerPhone: phone || 'GUEST',
                    discountAmount: discount || 0, // Assuming discount comes from promotion
                    usedAt: new Date()
                });
                await usage.save();
                
                // Increment Counter
                await Promotion.findByIdAndUpdate(promotionId, { $inc: { usageCount: 1 } });
                
                // Decrement Flash Sale Stock
                if (promotion.isFlashSale && promotion.flashSaleStock !== null) {
                    await Promotion.findByIdAndUpdate(promotionId, { $inc: { flashSaleStock: -1 } });
                }

                // [LOGIC] 3. Coupon Conflict Check (Double Dipping)
                if (pointsUsed && pointsUsed > 0) {
                     // Only block if explicitly set to FALSE (Legacy docs default to undefined -> Allow)
                     if (promotion.allowCombine === false) {
                         return res.status(400).json({ 
                             success: false, 
                             message: `Mã ${promotion.code} không áp dụng cùng lúc với Điểm tích lũy!` 
                         });
                     }
                }
            }
        }

        // [LOGIC] 2. Handle Loyalty Points Redemption
        if (pointsUsed && phone) {
            try {
                await CustomerController.deductPoints(phone, parseInt(pointsUsed));
            } catch (err) {
                return res.status(400).json({ success: false, message: 'Lỗi trừ điểm tích lũy: ' + err.message });
            }
        }

        // Create Invoice
        const newInvoice = new Invoice({
            bookingId,
            customerName,
            phone,
            items,
            subTotal,
            discount,
            tax,
            tipAmount: tipAmount || 0,
            tipStaffName: tipStaffName || '',
            surchargeFee: surchargeFee || 0,
            finalTotal,
            paymentMethod,
            cashierName,
            branchId: req.user?.branchId || null,
            note: promotionId ? `Used Promotion: ${promotionId}` : (pointsUsed ? `Used ${pointsUsed} pts` : '')
        });

        await newInvoice.save();

        // [CRM] Sync Customer Stats (Accumulate Points for the Amount PAID)
        if (phone) {
            await CustomerController.syncCustomerStats({
                phone,
                name: customerName,
                amount: finalTotal // Only award points for what they actually PAID
            });
        }

        // Update Booking Status if this invoice is linked to a booking
        if (bookingId) {
            await Booking.findByIdAndUpdate(bookingId, {
                status: 'completed',
                paymentStatus: 'paid', // [FIX] Sync payment status for Filter
                finalPrice: finalTotal,
                actualEndTime: new Date() // Set actual finish time now
            });
        }

        res.json({ success: true, message: 'Thanh toán thành công', invoice: newInvoice });

    } catch (error) {
        console.error("Create Invoice Error:", error);
        res.status(500).json({ success: false, message: 'Lỗi tạo hóa đơn' });
    }
};

// 2. Get All Invoices (History)
exports.getAllInvoices = async (req, res) => {
    try {
        const { date, bookingId } = req.query; // Optional filter by date or bookingId
        let query = {};

        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: start, $lte: end };
        }

        if (bookingId) {
            query.bookingId = bookingId;
        }

        const invoices = await Invoice.find(query)
            .populate('items.itemId', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách hóa đơn' });
    }
};

// 3. Void Invoice (Hủy hóa đơn - Only correct way to "edit")
exports.voidInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const invoice = await Invoice.findById(id);
        if (!invoice) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });

        invoice.note = (invoice.note || "") + ` [VOIDED: ${reason}]`;
        
        await invoice.save();

        res.json({ success: true, message: 'Đã hủy hóa đơn' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi hủy hóa đơn' });
    }
};
