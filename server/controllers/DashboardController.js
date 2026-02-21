const Booking = require('../models/Booking');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const dayjs = require('dayjs');

// Get occupancy rate for all rooms
exports.getOccupancyRate = async (req, res) => {
    try {
        const todayStr = req.query.date || dayjs().format('YYYY-MM-DD');
        const todayStart = dayjs(todayStr).startOf('day');
        const todayEnd = dayjs(todayStr).endOf('day');

        // 1. Get all active rooms for this branch
        const rooms = await Room.find({ 
            ...req.branchQuery,
            isActive: true 
        });

        // 2. Get today's bookings
        const bookings = await Booking.find({
            ...req.branchQuery,
            startTime: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
            status: { $in: ['processing', 'confirmed', 'completed'] },
            roomId: { $exists: true, $ne: null } // Only bookings with rooms
        });

        // 3. Calculate occupancy per room
        // Standard operating hours: 11 hours (09:00 - 20:00) = 660 minutes
        const TOTAL_MINUTES = 11 * 60; 

        const occupancyData = rooms.map(room => {
            // Find bookings for this room
            const roomBookings = bookings.filter(b => 
                b.roomId && b.roomId.toString() === room._id.toString()
            );

            // Calculate total booked minutes
            let bookedMinutes = 0;
            roomBookings.forEach(booking => {
                const start = dayjs(booking.startTime);
                const end = dayjs(booking.endTime);
                bookedMinutes += end.diff(start, 'minute');
            });

            // Calculate percentage (capped at 100% just in case of overtime)
            let percentage = Math.round((bookedMinutes / TOTAL_MINUTES) * 100);
            
            return {
                name: room.name,
                capacity: room.capacity,
                bookedMinutes,
                percentage: percentage,
                bookingsCount: roomBookings.length
            };
        });

        // Sort by occupancy descending
        occupancyData.sort((a, b) => b.percentage - a.percentage);

        res.json({
            success: true,
            date: todayStr,
            data: occupancyData
        });
    } catch (error) {
        console.error('Error getting occupancy rate:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get dashboard statistics
exports.getStats = async (req, res) => {
    try {
        const today = dayjs().startOf('day');
        const todayEnd = dayjs().endOf('day');

        // Today's completed bookings
        const todayBookings = await Booking.find({
            ...req.branchQuery,
            startTime: { $gte: today.toDate(), $lte: todayEnd.toDate() },
            status: { $in: ['completed', 'processing', 'confirmed'] }
        }).populate('serviceId');

        // Calculate today's revenue (only completed)
        const completedToday = todayBookings.filter(b => b.status === 'completed');
        const todayRevenue = completedToday.reduce((sum, booking) => {
            return sum + (booking.finalPrice || booking.serviceId?.price || 0);
        }, 0);

        // Customer count today
        const customerCount = todayBookings.length;

        // Total bookings today
        const totalBookings = todayBookings.length;

        // Pending bookings
        const pendingBookings = await Booking.countDocuments({
            ...req.branchQuery,
            status: 'pending'
        });

        res.json({
            success: true,
            stats: {
                todayRevenue,
                customerCount,
                totalBookings,
                pendingBookings
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get revenue chart data
exports.getRevenueChart = async (req, res) => {
    try {
        const { period = 'week' } = req.query; // 'week' or 'month'
        const Invoice = require('../models/Invoice');

        let startDate, groupBy, dateFormat;
        
        if (period === 'week') {
            // Last 7 days
            startDate = dayjs().subtract(6, 'day').startOf('day');
            groupBy = 'day';
            dateFormat = 'DD/MM';
        } else {
            // Last 6 months
            startDate = dayjs().subtract(5, 'month').startOf('month');
            groupBy = 'month';
            dateFormat = 'MM/YYYY';
        }

        const invoices = await Invoice.find({
            ...(req.branchQuery || {}),
            createdAt: { $gte: startDate.toDate() },
        }).lean();

        // Group by period
        const revenueMap = {};
        
        invoices.forEach(inv => {
            const date = dayjs(inv.createdAt);
            const key = groupBy === 'day' 
                ? date.format('DD/MM')
                : date.format('MM/YYYY');
            
            if (!revenueMap[key]) revenueMap[key] = 0;
            revenueMap[key] += inv.finalTotal || 0;
        });

        // Generate full date range
        const chartData = [];
        let current = startDate;
        const end = dayjs();

        while (current.isBefore(end) || current.isSame(end, groupBy)) {
            const key = current.format(dateFormat);
            chartData.push({
                date: key,
                revenue: revenueMap[key] || 0
            });
            current = current.add(1, groupBy);
        }

        res.json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Error getting revenue chart:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get top services
exports.getTopServices = async (req, res) => {
    try {
        const startOfMonth = dayjs().startOf('month');
        
        const bookings = await Booking.find({
            ...req.branchQuery,
            startTime: { $gte: startOfMonth.toDate() },
            status: { $in: ['completed', 'processing', 'confirmed'] }
        }).populate('serviceId');

        // Count services
        const serviceCount = {};
        bookings.forEach(booking => {
            const serviceName = booking.serviceId?.name || 'Unknown';
            if (!serviceCount[serviceName]) {
                serviceCount[serviceName] = { count: 0, revenue: 0 };
            }
            serviceCount[serviceName].count++;
            if (booking.status === 'completed') {
                serviceCount[serviceName].revenue += booking.finalPrice || booking.serviceId?.price || 0;
            }
        });

        // Convert to array and sort
        const topServices = Object.entries(serviceCount)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json({
            success: true,
            services: topServices
        });
    } catch (error) {
        console.error('Error getting top services:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get staff status
exports.getStaffStatus = async (req, res) => {
    try {
        const now = dayjs();
        const todayStart = now.startOf('day');
        const todayEnd = now.endOf('day');

        // Get all staff
        const allStaff = await Staff.find({ status: 'active' });

        // Get today's bookings
        const todayBookings = await Booking.find({
            startTime: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
            status: { $in: ['processing', 'confirmed'] }
        }).populate('staffId');

        // Determine staff status
        const staffStatus = allStaff.map(staff => {
            // Check if staff is currently busy
            const currentBooking = todayBookings.find(booking => {
                if (!booking.staffId || booking.staffId._id.toString() !== staff._id.toString()) {
                    return false;
                }
                const start = dayjs(booking.startTime);
                const end = dayjs(booking.endTime);
                return now.isAfter(start) && now.isBefore(end);
            });

            // Count today's bookings
            const todayCount = todayBookings.filter(b => 
                b.staffId && b.staffId._id.toString() === staff._id.toString()
            ).length;

            return {
                _id: staff._id,
                name: staff.name,
                status: currentBooking ? 'busy' : 'available',
                currentBooking: currentBooking ? {
                    customerName: currentBooking.customerName,
                    endTime: currentBooking.endTime
                } : null,
                todayBookings: todayCount
            };
        });

        res.json({
            success: true,
            staff: staffStatus
        });
    } catch (error) {
        console.error('Error getting staff status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Staff Performance
exports.getStaffPerformance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const start = startDate ? dayjs(startDate).startOf('day') : dayjs().startOf('month');
        const end = endDate ? dayjs(endDate).endOf('day') : dayjs().endOf('day');

        // 1. Get completed bookings in range
        const bookings = await Booking.find({
            startTime: { $gte: start.toDate(), $lte: end.toDate() },
            status: 'completed'
        }).populate('staffId', 'name');

        // 2. Get invoices in range to pull real revenue + tip
        const Invoice = require('../models/Invoice');
        const invoices = await Invoice.find({
            createdAt: { $gte: start.toDate(), $lte: end.toDate() }
        }).lean();

        // Map bookingId -> invoice
        const invoiceByBooking = {};
        invoices.forEach(inv => {
            if (inv.bookingId) invoiceByBooking[inv.bookingId.toString()] = inv;
        });

        // 3. Aggregate per staff from bookings
        const staffMap = {};

        bookings.forEach(booking => {
            if (!booking.staffId) return;
            const staffId = booking.staffId._id.toString();
            const staffName = booking.staffId.name;
            const inv = invoiceByBooking[booking._id.toString()];
            const revenue = inv ? inv.finalTotal - (inv.tipAmount || 0) : (booking.finalPrice || 0);
            const dateKey = dayjs(booking.startTime).format('YYYY-MM-DD');

            if (!staffMap[staffId]) {
                staffMap[staffId] = {
                    key: staffId,
                    name: staffName,
                    totalBookings: 0,
                    totalRevenue: 0,
                    uniqueCustomers: new Set(),
                    workingDays: new Set(),
                    totalTip: 0,
                    tipCount: 0,
                };
            }

            staffMap[staffId].totalBookings += 1;
            staffMap[staffId].totalRevenue += revenue;
            staffMap[staffId].uniqueCustomers.add(booking.phone);
            staffMap[staffId].workingDays.add(dateKey);
        });

        // 4. Aggregate tip by tipStaffName from invoices
        invoices.forEach(inv => {
            if (!inv.tipAmount || inv.tipAmount <= 0 || !inv.tipStaffName) return;
            // Find staff in map by name
            const entry = Object.values(staffMap).find(s => s.name === inv.tipStaffName);
            if (entry) {
                entry.totalTip += inv.tipAmount;
                entry.tipCount += 1;
            } else {
                // Staff got tip but no booking in range (edge case) — still record
                const fakeKey = 'tip_' + inv.tipStaffName;
                if (!staffMap[fakeKey]) {
                    staffMap[fakeKey] = {
                        key: fakeKey,
                        name: inv.tipStaffName,
                        totalBookings: 0,
                        totalRevenue: 0,
                        uniqueCustomers: new Set(),
                        workingDays: new Set(),
                        totalTip: 0,
                        tipCount: 0,
                    };
                }
                staffMap[fakeKey].totalTip += inv.tipAmount;
                staffMap[fakeKey].tipCount += 1;
            }
        });

        // 5. Convert & sort
        const reportData = Object.values(staffMap).map(s => ({
            ...s,
            uniqueCustomers: s.uniqueCustomers.size,
            workingDays: s.workingDays.size,
        })).sort((a, b) => b.totalRevenue - a.totalRevenue);

        res.json({
            success: true,
            data: reportData,
            period: { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') }
        });

    } catch (error) {
        console.error('Error getting staff performance:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Báo cáo cuối ngày — giống tờ giấy spa thực tế
exports.getDailyReport = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? dayjs(date) : dayjs();
        const startOfDay = targetDate.startOf('day').toDate();
        const endOfDay = targetDate.endOf('day').toDate();

        const bookings = await Booking.find({
            ...req.branchQuery,
            startTime: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['completed', 'processing', 'confirmed'] }
        })
        .populate('serviceId', 'name price')
        .populate('staffId', 'name')
        .sort({ startTime: 1 })
        .lean();

        const rows = bookings.map((b, idx) => ({
            stt: idx + 1,
            customerName: b.customerName || b.phone,
            phone: b.phone,
            serviceName: b.serviceId?.name || b.serviceName || '—',
            staffName: b.staffId?.name || '—',
            price: b.finalPrice || b.serviceId?.price || 0,
            tip: b.tip || 0,
            total: (b.finalPrice || b.serviceId?.price || 0) + (b.tip || 0),
            paymentMethod: b.paymentMethod || 'cash',
            startTime: b.startTime,
            status: b.status,
            note: b.note || '',
        }));

        const totalRevenue = rows.reduce((s, r) => s + r.price, 0);
        const totalTip = rows.reduce((s, r) => s + r.tip, 0);
        const totalAll = rows.reduce((s, r) => s + r.total, 0);

        res.json({
            success: true,
            date: targetDate.format('YYYY-MM-DD'),
            rows,
            summary: { totalRevenue, totalTip, totalAll, count: rows.length }
        });
    } catch (error) {
        console.error('getDailyReport error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
