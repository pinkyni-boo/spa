const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const VN_TZ = 'Asia/Ho_Chi_Minh';

const EXPENSE_CAT_LABELS = {
    supply: 'Mua vật tư / mỹ phẩm',
    food: 'Ăn uống / tiếp khách',
    salary: 'Lương / thưởng',
    utility: 'Điện / nước / internet',
    other: 'Chi khác',
    other_expense: 'Chi khác',
};

// GET /api/reports/daily?date=YYYY-MM-DD
exports.getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;
        const branchId = req.branchId || req.user?.branchId;

        const startOfDay = dayjs.tz(date || new Date(), VN_TZ).startOf('day').toDate();
        const endOfDay   = dayjs.tz(date || new Date(), VN_TZ).endOf('day').toDate();

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

        // 2. Lấy phiếu chi (CHI) — từ cả Expense model và Transaction model
        const expenseQuery = { date: { $gte: startOfDay, $lte: endOfDay } };
        if (branchId) expenseQuery.branchId = branchId;
        const expenses = await Expense.find(expenseQuery).sort({ date: 1 }).lean();

        const txExpenseQuery = { type: 'expense', date: { $gte: startOfDay, $lte: endOfDay } };
        if (branchId) txExpenseQuery.branchId = branchId;
        const txExpenses = await Transaction.find(txExpenseQuery).sort({ date: 1 }).lean();

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

        // 4. Format dòng Chi (Expense model)
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
                total: -exp.amount,
                amount: exp.amount,
                paymentMethod: exp.paymentMethod || 'cash',
                note: exp.reason,
            };
        });

        // 4b. Format dòng Chi (Transaction model)
        const txExpenseRows = txExpenses.map(tx => {
            totalExpense += tx.amount;
            return {
                _id: tx._id,
                rowType: 'expense',
                time: tx.date,
                customerName: '— Phiếu Chi —',
                phone: '',
                serviceName: EXPENSE_CAT_LABELS[tx.category] || tx.category || '—',
                staffName: tx.createdBy || '—',
                price: 0,
                tip: 0,
                surchargeFee: 0,
                total: -tx.amount,
                amount: tx.amount,
                paymentMethod: tx.paymentMethod || 'cash',
                note: tx.reason || '',
            };
        });

        // 5. Gộp + sort theo giờ
        const tableData = [...incomeRows, ...expenseRows, ...txExpenseRows].sort(
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

        const start = dayjs.tz(startDate || dayjs().tz(VN_TZ).startOf('month').toDate(), VN_TZ).startOf('day').toDate();
        const end   = dayjs.tz(endDate || new Date(), VN_TZ).endOf('day').toDate();

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

        // 2. Expenses (CHI) — từ cả Expense model và Transaction model
        const expenseQuery = { date: { $gte: start, $lte: end } };
        if (branchId) expenseQuery.branchId = branchId;
        const expenses = await Expense.find(expenseQuery).sort({ date: 1 }).lean();

        const txExpenseQuery = { type: 'expense', date: { $gte: start, $lte: end } };
        if (branchId) txExpenseQuery.branchId = branchId;
        const txExpenses = await Transaction.find(txExpenseQuery).sort({ date: 1 }).lean();

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

        // 4. Format Chi rows (Expense model)
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

        // 4b. Format Chi rows (Transaction model)
        const txExpenseRows = txExpenses.map(tx => {
            totalExpense += tx.amount;
            return {
                _id: tx._id,
                rowType: 'expense',
                time: tx.date,
                customerName: tx.reason,
                phone: '',
                serviceName: EXPENSE_CAT_LABELS[tx.category] || tx.category || '—',
                staffName: tx.createdBy || '—',
                price: 0,
                tip: 0,
                total: tx.amount,
                paymentMethod: tx.paymentMethod || 'cash',
                note: tx.note || '',
            };
        });

        const tableData = [...incomeRows, ...expenseRows, ...txExpenseRows].sort(
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
