const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const CustomerController = require('./CustomerController'); // [NEW] Link CRM

// 1. Create Invoice (Checkout)
exports.createInvoice = async (req, res) => {
    try {
        const { bookingId, customerName, phone, items, subTotal, discount, tax, finalTotal, paymentMethod, cashierName } = req.body;

        // Validation
        if (!finalTotal || finalTotal < 0) {
            return res.status(400).json({ success: false, message: 'Tổng tiền không hợp lệ' });
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
            finalTotal,
            paymentMethod,
            cashierName
        });

        await newInvoice.save();

        // [CRM] Sync Customer Stats
        if (phone) {
            await CustomerController.syncCustomerStats({
                phone,
                name: customerName,
                amount: finalTotal
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
