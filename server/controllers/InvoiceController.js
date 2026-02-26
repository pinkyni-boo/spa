const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');
const CustomerController = require('./CustomerController');
const Promotion = require('../models/Promotion');
const PromotionUsage = require('../models/PromotionUsage');
const mongoose = require('mongoose');

// 1. Create Invoice (Checkout)
exports.createInvoice = async (req, res) => {
    try {
        const { bookingId, customerName, phone, items, subTotal, discount, tax, finalTotal, tipAmount, tipStaffName, surchargeFee, paymentMethod, cashierName, staffName, promotionId, pointsUsed } = req.body;

        // Validation
        if (!finalTotal && finalTotal !== 0) { // Check undefined/null but allow 0
            return res.status(400).json({ success: false, message: 'Tổng tiền không hợp lệ' });
        }

        // 1. Xử lý Khuyến mãi
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

                // Kiểm tra xung đột mã giảm giá + điểm tích lũy
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

        // 2. Xử lý Điểm Tích Lũy
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
            staffName: staffName || '',
            branchId: req.user?.branchId || null,
            note: promotionId ? `Used Promotion: ${promotionId}` : (pointsUsed ? `Used ${pointsUsed} pts` : '')
        });

        await newInvoice.save();

        // Cập nhật thống kê khách hàng và tích điểm
        if (phone) {
            await CustomerController.syncCustomerStats({
                phone,
                name: customerName,
                amount: finalTotal // Only award points for what they actually PAID
            });
        }

        // Update Booking Status if this invoice is linked to a booking
        if (bookingId) {
            const completedFields = {
                status: 'completed',
                paymentStatus: 'paid',
                finalPrice: finalTotal,
                actualEndTime: new Date()
            };
            await Booking.findByIdAndUpdate(bookingId, completedFields);
            // Also complete all child bookings (+DV) linked to this parent
            await Booking.updateMany(
                { parentBookingId: bookingId },
                { status: 'completed', paymentStatus: 'paid', actualEndTime: new Date() }
            );
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

// 4. Tạo đơn bán lẻ (Retail Invoice) — ACID Mongoose Session
// POST /api/invoices/retail
// Lễ tân tạo khi khách vãng lai mua sản phẩm, không có booking
exports.createRetailInvoice = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {
            customerName, phone, items,
            subTotal, discount = 0, tax = 0,
            finalTotal, paymentMethod = 'cash',
            cashierName, note
        } = req.body;

        if (!customerName || !items || items.length === 0 || finalTotal == null) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (tên KH, sản phẩm, tổng tiền)' });
        }

        const branchId = req.user?.branchId || null;
        const cashier  = cashierName || req.user?.username || 'Admin';

        // 1. Kiểm tra và trừ tồn kho từng sản phẩm
        for (const item of items) {
            if (!item.itemId) continue; // bỏ qua item không rõ nguyen gốc

            const product = await Service.findById(item.itemId).session(session);
            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({ success: false, message: `Không tìm thấy sản phẩm: ${item.name || item.itemId}` });
            }
            if (product.type !== 'product') {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: `"${product.name}" là dịch vụ, không phải sản phẩm bán lẻ` });
            }

            // Chỉ trừ tồn kho nếu sản phẩm đang được quản lý tồn kho
            if (product.stock !== null) {
                const qty = item.qty || 1;
                if (product.stock < qty) {
                    await session.abortTransaction();
                    return res.status(400).json({ success: false, message: `Tồn kho không đủ: "${product.name}" còn ${product.stock} ${product.stockUnit}, cần ${qty}` });
                }
                await Service.findByIdAndUpdate(
                    item.itemId,
                    { $inc: { stock: -qty } },
                    { session }
                );
            }
        }

        // 2. Tạo hóa đơn
        const [newInvoice] = await Invoice.create([{
            bookingId: null,
            customerName,
            phone: phone || '',
            items,
            subTotal,
            discount,
            tax,
            tipAmount: 0,
            surchargeFee: 0,
            finalTotal,
            paymentMethod,
            cashierName: cashier,
            branchId,
            note: note || '',
        }], { session });

        // 3. Tạo phiếu Thu vào bảng Transaction (sổ quỹ)
        await Transaction.create([{
            type: 'income',
            amount: finalTotal,
            reason: `Bán lẻ: ${items.map(i => i.name).join(', ')}`,
            category: 'retail',
            paymentMethod,
            branchId,
            createdBy: cashier,
            date: new Date(),
            bookingId: null,
        }], { session });

        // 4. Cập nhật CRM khách hàng (nếu có số điện thoại)
        await session.commitTransaction();

        // CRM chạy sau commit — không cần ACID
        if (phone) {
            CustomerController.syncCustomerStats({ phone, name: customerName, amount: finalTotal }).catch(() => {});
        }

        res.status(201).json({ success: true, message: 'Tạo đơn bán lẻ thành công', invoice: newInvoice });

    } catch (error) {
        await session.abortTransaction();
        console.error('createRetailInvoice Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi tạo đơn bán lẻ: ' + error.message });
    } finally {
        session.endSession();
    }
};
