const Booking = require('../models/Booking');
const Staff = require('../models/Staff');
const Room = require('../models/Room'); // [NEW] Import Room model
const dayjs = require('dayjs');

// Get occupancy rate for all rooms
exports.getOccupancyRate = async (req, res) => {
    try {
        const todayStr = req.query.date || dayjs().format('YYYY-MM-DD');
        const todayStart = dayjs(todayStr).startOf('day');
        const todayEnd = dayjs(todayStr).endOf('day');

        // 1. Get all active rooms for this branch
        const rooms = await Room.find({ 
            ...req.branchQuery, // [FIX] Isolation
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
            ...req.branchQuery, // [FIX] Isolation
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
            ...req.branchQuery, // [FIX] Isolation
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

        const bookings = await Booking.find({
            ...req.branchQuery, // [FIX] Isolation
            startTime: { $gte: startDate.toDate() },
            status: 'completed'
        }).populate('serviceId');

        // Group by period
        const revenueMap = {};
        
        bookings.forEach(booking => {
            const date = dayjs(booking.startTime);
            const key = groupBy === 'day' 
                ? date.format('DD/MM')
                : date.format('MM/YYYY');
            
            if (!revenueMap[key]) {
                revenueMap[key] = 0;
            }
            revenueMap[key] += booking.finalPrice || booking.serviceId?.price || 0;
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
            ...req.branchQuery, // [FIX] Isolation
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

        // Default to this month if not provided
        const start = startDate ? dayjs(startDate).startOf('day') : dayjs().startOf('month');
        const end = endDate ? dayjs(endDate).endOf('day') : dayjs().endOf('day');

        console.log(`[REPORT] Staff Performance: ${start.format('DD/MM')} - ${end.format('DD/MM')}`);

        // 1. Get all completed bookings in range
        const bookings = await Booking.find({
            startTime: { $gte: start.toDate(), $lte: end.toDate() },
            status: 'completed'
        }).populate('staffId', 'name');

        // 2. Aggregate per staff
        const staffMap = {};

        bookings.forEach(booking => {
            if (!booking.staffId) return;
            
            const staffId = booking.staffId._id.toString();
            const staffName = booking.staffId.name;
            const revenue = booking.finalPrice || booking.serviceId?.price || 0;

            if (!staffMap[staffId]) {
                staffMap[staffId] = {
                    key: staffId,
                    name: staffName,
                    totalBookings: 0,
                    totalRevenue: 0,
                    uniqueCustomers: new Set()
                };
            }

            staffMap[staffId].totalBookings += 1;
            staffMap[staffId].totalRevenue += revenue;
            staffMap[staffId].uniqueCustomers.add(booking.phone);
        });

        // 3. Convert to array & Sort by Revenue
        const reportData = Object.values(staffMap).map(staff => ({
            ...staff,
            uniqueCustomers: staff.uniqueCustomers.size
        })).sort((a, b) => b.totalRevenue - a.totalRevenue);

        res.json({
            success: true,
            data: reportData,
            period: {
                start: start.format('YYYY-MM-DD'),
                end: end.format('YYYY-MM-DD')
            }
        });

    } catch (error) {
        console.error('Error getting staff performance:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
