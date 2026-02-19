const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const Booking = require('../models/Booking');

const EXPENSE_CAT_LABELS = {
    supply: 'Mua vật tư / mỹ phẩm',
    food: 'Ăn uống / tiếp khách',
    salary: 'Lương / thưởng',
    utility: 'Điện / nước / internet',
    other: 'Chi khác',
};

// GET /api/reports/daily?date=YYYY-MM-DD
exports.getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;
        const branchId = req.branchId || req.user?.branchId;

        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay   = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

        const dateQuery = { createdAt: { $gte: startOfDay, $lte: endOfDay } };
        if (branchId) dateQuery.branchId = branchId;

        // 1. Lấy hóa đơn (THU) — populate booking để lấy nhân viên & dịch vụ
        const invoices = await Invoice.find(dateQuery)
            .populate({
                path: 'bookingId',
                select: 'staffId serviceId servicesDone startTime',
                populate: [
                    { path: 'staffId', select: 'name' },
                    { path: 'serviceId', select: 'name' },
                ]
            })
            .sort({ createdAt: 1 })
            .lean();

        // 2. Lấy phiếu chi (CHI)
        const expenseQuery = { date: { $gte: startOfDay, $lte: endOfDay } };
        if (branchId) expenseQuery.branchId = branchId;
        const expenses = await Expense.find(expenseQuery).sort({ date: 1 }).lean();

        // 3. Format dòng Thu
        let totalIncome = 0, totalTip = 0;
        const incomeRows = invoices.map((inv, idx) => {
            totalIncome += (inv.finalTotal || 0);
            totalTip    += (inv.tipAmount || 0);

            const booking = inv.bookingId;
            const staffName = booking?.staffId?.name || '—';
            const serviceName = booking?.servicesDone?.length
                ? booking.servicesDone.map(s => s.name).join(', ')
                : (booking?.serviceId?.name || inv.items?.map(i => i.name).join(', ') || '—');

            return {
                _id: inv._id,
                rowType: 'income',
                stt: idx + 1,
                time: inv.createdAt,
                customerName: inv.customerName || 'Khách lẻ',
                phone: inv.phone || '—',
                serviceName,
                staffName,
                price: inv.subTotal - (inv.discount || 0),
                tip: inv.tipAmount || 0,
                surchargeFee: inv.surchargeFee || 0,
                total: inv.finalTotal || 0,
                paymentMethod: inv.paymentMethod || 'cash',
                note: inv.note || '',
            };
        });

        // 4. Format dòng Chi
        let totalExpense = 0;
        const expenseRows = expenses.map(exp => {
            totalExpense += exp.amount;
            return {
                _id: exp._id,
                rowType: 'expense',
                time: exp.date,
                customerName: '— Phiếu Chi —',
                phone: '',
                serviceName: exp.category,
                staffName: exp.createdBy || '—',
                price: 0,
                tip: 0,
                surchargeFee: 0,
                total: -exp.amount,    // Số âm để nhận diện Chi
                amount: exp.amount,
                paymentMethod: exp.paymentMethod || 'cash',
                note: exp.reason,
            };
        });

        // 5. Gộp + sort theo giờ
        const tableData = [...incomeRows, ...expenseRows].sort(
            (a, b) => new Date(a.time) - new Date(b.time)
        );

        res.json({
            success: true,
            summary: {
                totalCustomers: invoices.length,
                totalIncome,
                totalTip,
                totalExpense,
                netCash: totalIncome - totalExpense,
            },
            tableData,
        });

    } catch (error) {
        console.error('getDailyReport error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/reports/cashflow?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// Sổ quỹ tổng hợp: Thu (Invoice) + Chi (Expense) trong khoảng ngày
exports.getCashflowReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const branchId = req.branchId || req.user?.branchId;

        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
        start.setHours(0, 0, 0, 0);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        const dateQuery = { createdAt: { $gte: start, $lte: end } };
        if (branchId) dateQuery.branchId = branchId;

        // 1. Invoices (THU)
        const invoices = await Invoice.find(dateQuery)
            .populate({
                path: 'bookingId',
                select: 'staffId serviceId servicesDone',
                populate: [
                    { path: 'staffId', select: 'name' },
                    { path: 'serviceId', select: 'name' },
                ]
            })
            .sort({ createdAt: 1 }).lean();

        // 2. Expenses (CHI)
        const expenseQuery = { date: { $gte: start, $lte: end } };
        if (branchId) expenseQuery.branchId = branchId;
        const expenses = await Expense.find(expenseQuery).sort({ date: 1 }).lean();

        // 3. Format Thu rows
        let totalIncome = 0, totalTip = 0;
        const incomeRows = invoices.map(inv => {
            totalIncome += (inv.finalTotal || 0);
            totalTip    += (inv.tipAmount || 0);
            const booking = inv.bookingId;
            const staffName = booking?.staffId?.name || '—';
            const serviceName = booking?.servicesDone?.length
                ? booking.servicesDone.map(s => s.name).join(', ')
                : (booking?.serviceId?.name || inv.items?.map(i => i.name).join(', ') || '—');
            return {
                _id: inv._id,
                rowType: 'income',
                time: inv.createdAt,
                customerName: inv.customerName || 'Khách lẻ',
                phone: inv.phone || '—',
                serviceName,
                staffName,
                price: inv.subTotal - (inv.discount || 0),
                tip: inv.tipAmount || 0,
                total: inv.finalTotal || 0,
                paymentMethod: inv.paymentMethod || 'cash',
                note: inv.note || '',
            };
        });

        // 4. Format Chi rows
        let totalExpense = 0;
        const expenseRows = expenses.map(exp => {
            totalExpense += exp.amount;
            return {
                _id: exp._id,
                rowType: 'expense',
                time: exp.date,
                customerName: exp.reason,
                phone: '',
                serviceName: EXPENSE_CAT_LABELS[exp.category] || exp.category || '—',
                staffName: exp.createdBy || '—',
                price: 0,
                tip: 0,
                total: exp.amount,
                paymentMethod: exp.paymentMethod || 'cash',
                note: '',
            };
        });

        const tableData = [...incomeRows, ...expenseRows].sort(
            (a, b) => new Date(a.time) - new Date(b.time)
        );

        res.json({
            success: true,
            summary: { totalIncome, totalTip, totalExpense, netCash: totalIncome - totalExpense },
            tableData,
        });
    } catch (error) {
        console.error('getCashflowReport error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
