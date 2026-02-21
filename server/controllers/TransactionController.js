const Transaction = require('../models/Transaction');
const dayjs = require('dayjs');

// Tạo phiếu thu/chi
exports.createTransaction = async (req, res) => {
    try {
        const { type, amount, reason, category, paymentMethod, note, date, bookingId } = req.body;
        if (!type || !amount || !reason) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
        }

        const branchId = req.user?.branchId || null;
        const createdBy = req.user?.username || req.user?.name || 'Admin';

        const transaction = new Transaction({
            type, amount: Number(amount), reason, category, paymentMethod,
            note, branchId, createdBy,
            date: date ? new Date(date) : new Date(),
            bookingId: bookingId || null,
        });
        await transaction.save();
        res.status(201).json({ success: true, transaction });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Lấy danh sách + tổng hợp theo ngày
exports.getTransactions = async (req, res) => {
    try {
        const { date, startDate, endDate, type, page = 1, limit = 50 } = req.query;
        const query = {};

        // Branch isolation (admin thấy tất cả chi nhánh mình quản lý)
        if (req.user?.role === 'admin') {
            if (req.user.managedBranches?.length > 0) {
                query.branchId = { $in: req.user.managedBranches };
            } else if (req.user.branchId) {
                query.branchId = req.user.branchId;
            }
        }

        if (type) query.type = type;

        // Date filter
        if (date) {
            const d = dayjs(date);
            query.date = { $gte: d.startOf('day').toDate(), $lte: d.endOf('day').toDate() };
        } else if (startDate && endDate) {
            query.date = {
                $gte: dayjs(startDate).startOf('day').toDate(),
                $lte: dayjs(endDate).endOf('day').toDate(),
            };
        }

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        // Summary
        const allOfPeriod = await Transaction.find(query).lean();
        const totalIncome  = allOfPeriod.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = allOfPeriod.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        res.json({
            success: true, transactions, total,
            summary: { totalIncome, totalExpense, net: totalIncome - totalExpense }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Xóa phiếu
exports.deleteTransaction = async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Đã xóa' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
