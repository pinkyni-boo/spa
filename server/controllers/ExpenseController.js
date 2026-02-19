const Expense = require('../models/Expense');

// POST /api/expenses — Tạo phiếu chi
exports.createExpense = async (req, res) => {
    try {
        const { amount, reason, category, paymentMethod, date } = req.body;
        if (!amount || !reason) return res.status(400).json({ success: false, message: 'Thiếu số tiền hoặc nội dung' });

        const expense = new Expense({
            amount,
            reason,
            category: category || 'other',
            paymentMethod: paymentMethod || 'cash',
            branchId: req.user?.branchId || null,
            createdBy: req.user?.name || req.user?.username || 'Admin',
            date: date ? new Date(date) : new Date(),
        });

        await expense.save();
        res.json({ success: true, expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/expenses — Lấy danh sách phiếu chi
exports.getExpenses = async (req, res) => {
    try {
        const { startDate, endDate, date } = req.query;
        const branchId = req.user?.branchId;

        let query = {};
        if (branchId) query.branchId = branchId;

        if (date) {
            const start = new Date(date); start.setHours(0, 0, 0, 0);
            const end = new Date(date);   end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        } else if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) {
                const e = new Date(endDate); e.setHours(23, 59, 59, 999);
                query.date.$lte = e;
            }
        }

        const expenses = await Expense.find(query).sort({ date: -1 });
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        res.json({ success: true, expenses, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
