const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const Waitlist = require('../models/Waitlist');
const BookingService = require('../services/BookingService'); 
const ActionLogController = require('./ActionLogController');
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

// ---------------------------------------------------------
// 1. CHECK AVAILABILITY (SMART CORE)
// ---------------------------------------------------------
exports.checkAvailability = async (req, res) => {
  try {
    const { date, serviceName, serviceId, branchId } = req.body;
    
    const result = await BookingService.checkAvailability(date, serviceId, serviceName, branchId);
    res.json(result);
    
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    const message = error.message || 'Lỗi kiểm tra lịch';
    res.status(status).json({ success: false, message });
  }
};

// ---------------------------------------------------------
// 2. CREATE BOOKING (UPDATED)
// ---------------------------------------------------------
exports.createBooking = async (req, res) => {
    try {
        // Nếu admin/staff/owner tạo thủ công → auto confirm, đánh dấu source manual
        const isStaff = req.user && ['admin', 'owner', 'staff'].includes(req.user.role);
        const bodyWithDefaults = isStaff
            ? { ...req.body, source: 'manual', status: 'confirmed' }
            : req.body;
        const result = await BookingService.createBooking(bodyWithDefaults);
        
        if (result.success && result.booking) {
             ActionLogController.createLog(req, req.user, 'BOOKING_CREATE', 'Booking', result.booking._id, result.booking.customerName);
        }

        res.json(result);
        
    } catch (error) {
        console.error(error);
        const status = error.status || 500;
        const message = error.message || 'Lỗi server khi đặt lịch';
        res.status(status).json({ success: false, message });
    }
};

// ---------------------------------------------------------
// 3. OTHER CRUD
// ---------------------------------------------------------
exports.getAllBookings = async (req, res) => {
  try {
    const { date, phone, staffId, paymentStatus, branchId, page, limit } = req.query;

    let query = { ...req.branchQuery };
    
    // Allow filtering by specific branch if Owner (override empty branchQuery)
    // But if Admin (branchQuery has value), ignore param to prevent hopping
    if (branchId && !query.branchId) {
        query.branchId = branchId;
    }

    if (date) {
        const start = dayjs(date).startOf('day').toDate();
        const end = dayjs(date).endOf('day').toDate();
        query.startTime = { $gte: start, $lte: end };
    }

    if (phone) {
        query.phone = phone; // Filter by phone
        delete query.startTime; // If searching history, ignore date
    }

    if (staffId) {
        query.staffId = staffId;
    }
    
    // Logic: Nếu chọn unpaid, bao gồm cả (unpaid) VÀ (không có trường paymentStatus - dữ liệu cũ)
    if (paymentStatus === 'unpaid') {
        const { paymentStatus: _, ...rest } = query; // Remove simple assignment
        query = { 
            ...rest, 
            $or: [
                { paymentStatus: 'unpaid' }, 
                { paymentStatus: { $exists: false } },
                { paymentStatus: null }
            ]
        };
    } else if (paymentStatus) {
         query.paymentStatus = paymentStatus;
    }

    const safePage  = page  ? parseInt(page)  : null;
    const safeLimit = limit ? parseInt(limit) : null;

    const total = safePage ? await Booking.countDocuments(query) : null;

    const bookingsQuery = Booking.find(query)
      .populate('serviceId', 'name price duration') 
      .populate('staffId', 'name')
      .populate('roomId', 'name')
      .populate('bedId', 'name sortOrder')
      .sort({ createdAt: -1 });

    if (safePage && safeLimit) {
      bookingsQuery.skip((safePage - 1) * safeLimit).limit(safeLimit);
    }

    const bookings = await bookingsQuery;
    const resp = { success: true, bookings };
    if (safePage) { resp.total = total; resp.page = safePage; resp.limit = safeLimit; }
    res.json(resp);
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { startTime, endTime, bedId, ...rest } = req.body;

        // Nếu đổi giờ hoặc giường → kiểm tra xung đột
        if (startTime || bedId !== undefined) {
            const current = await Booking.findById(bookingId);
            if (!current) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });

            const newStart = startTime ? new Date(startTime) : current.startTime;
            const newEnd   = endTime   ? new Date(endTime)   : current.endTime;
            const targetBed = bedId !== undefined ? bedId : (current.bedId ? current.bedId.toString() : null);

            if (targetBed) {
                const conflict = await Booking.findOne({
                    _id: { $ne: bookingId },
                    bedId: targetBed,
                    status: { $nin: ['cancelled'] },
                    startTime: { $lt: newEnd },
                    endTime:   { $gt: newStart }
                });
                if (conflict) {
                    return res.status(409).json({
                        success: false,
                        message: `Giường đã có lịch ${dayjs(conflict.startTime).format('HH:mm')}–${dayjs(conflict.endTime).format('HH:mm')} (${conflict.customerName})`
                    });
                }
            }
        }

        const updateData = { ...rest };
        if (startTime)          updateData.startTime = startTime;
        if (endTime)            updateData.endTime   = endTime;
        if (bedId !== undefined) updateData.bedId    = bedId;

        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true })
            .populate('serviceId', 'name duration price')
            .populate('staffId',   'name')
            .populate('roomId',    'name')
            .populate('bedId',     'name sortOrder');

        if (updatedBooking) {
            ActionLogController.createLog(req, req.user, 'BOOKING_UPDATE', 'Booking', updatedBooking._id, updatedBooking.customerName, req.body);
        }

        res.json({ success: true, booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
        
        ActionLogController.createLog(req, req.user, 'BOOKING_CANCEL', 'Booking', req.params.id);

        res.json({ success: true, message: 'Đã hủy đơn' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { status: 'confirmed' },
            { new: true }
        );
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
        }
        
        ActionLogController.createLog(req, req.user, 'BOOKING_APPROVE', 'Booking', booking._id, booking.customerName);

        res.json({ success: true, booking, message: 'Đã duyệt đơn' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.completeBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: 'completed', paymentStatus: 'paid' },
            { new: true }
        );
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
        }
        res.json({ success: true, booking, message: 'Hoàn thành đơn' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------------------------------------
// 4. SMART OPERATIONS
// ---------------------------------------------------------

// A. CHECK-IN (Khách đến)
exports.checkIn = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        
        if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn' });
        if (booking.status !== 'confirmed') return res.status(400).json({ message: 'Chỉ đơn đã xác nhận mới được Check-in' });

        // Shift booking time to now
        const now = new Date();
        const duration = booking.endTime - booking.startTime; // Ms
        
        booking.startTime = now;
        booking.endTime = new Date(now.getTime() + duration);
        
        booking.status = 'processing';
        booking.actualStartTime = now;
        
        await booking.save();

        ActionLogController.createLog(req, req.user, 'BOOKING_CHECKIN', 'Booking', booking._id, booking.customerName);

        res.json({ success: true, message: 'Check-in thành công! Đã chuyển lịch về giờ hiện tại.', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi Check-in' });
    }
};

// B. SMART UPSELL (Thêm dịch vụ & Check xung đột)
// C. GLOBAL SEARCH (For "Sync Search" feature)
// C. GLOBAL SEARCH (For "Sync Search" feature)
exports.searchBookings = async (req, res) => {
    try {
        const { query } = req.query; // Search text (name or phone)
        if (!query) return res.json({ success: true, bookings: [] });

        // Search logic: Find bookings with matching customerName Or Phone
        // Case insensitive regex
        const regex = new RegExp(query, 'i');
        
        // [GLOBAL CRM] Allow searching ALL customers across branches
        const filter = {
            $or: [
                { customerName: regex },
                { phone: regex }
            ],
            status: { $ne: 'cancelled' } 
        };

        const bookings = await Booking.find(filter)
        .populate('serviceId', 'name') // Just need basic info
        .sort({ startTime: 1 }) // Future first
        .limit(20); // Limit results for speed

        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBookingServices = async (req, res) => {
    try {
        const { items } = req.body; // Expect items array: [{ name, price, quantity }]
        const { id } = req.params;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ success: false, message: 'Dữ liệu dịch vụ không hợp lệ' });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Initialize if empty
        if (!booking.servicesDone) booking.servicesDone = [];

        // Append new items
        items.forEach(item => {
            booking.servicesDone.push({
                name: item.name,
                price: item.price,
                qty: item.quantity || 1
            });
        });
        
        // Recalculate Total? (If total field exists)
        // booking.totalPrice = ... (If we track it) - usually computed on frontend or separate field
        
        await booking.save();

        res.json({ success: true, booking, message: 'Đã thêm dịch vụ thành công' });
    } catch (error) {
        console.error('Error updating services:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ...

// ---------------------------------------------------------
// CRM - GET CUSTOMER HISTORY
// ---------------------------------------------------------
exports.getCustomerHistory = async (req, res) => {
    try {
        const { phone } = req.params;
        
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Thiếu số điện thoại' });
        }

        // [GLOBAL CRM] Show FULL history across all branches
        const bookings = await Booking.find({ phone })
            .populate('serviceId', 'name price duration')
            .populate('staffId', 'name')
            .populate('branchId', 'name address')
            .populate('roomId', 'name')
            .sort({ startTime: -1 }) // Newest first
            .lean();

        // Map to include serviceName for frontend compatibility
        const mappedBookings = bookings.map(b => ({
            ...b,
            serviceName: b.serviceId?.name || 'N/A',
            staffName: b.staffId?.name || 'N/A',
            roomName: b.roomId?.name || 'N/A',
            branchName: b.branchId?.name || 'Chi nhánh khác'
        }));

        res.json({ success: true, bookings: mappedBookings });
    } catch (error) {
        console.error('Error fetching customer history:', error);
        res.status(500).json({ success: false, message: 'Lỗi tải lịch sử khách hàng' });
    }
};

// ---------------------------------------------------------
// BULK COMPLETE PAST BOOKINGS
// ---------------------------------------------------------
exports.completePastBookings = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await Booking.updateMany(
            { 
                startTime: { $lt: today },
                status: { $in: ['pending', 'confirmed'] }
            },
            { 
                $set: { status: 'completed' } 
            }
        );

        res.json({ 
            success: true, 
            message: `Đã hoàn thành ${result.modifiedCount} đơn hàng cũ`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error completing past bookings:', error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật đơn hàng' });
    }
};

// ---------------------------------------------------------
// FIX FUTURE COMPLETED BOOKINGS
// ---------------------------------------------------------
exports.fixFutureBookings = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await Booking.updateMany(
            { 
                startTime: { $gte: today },
                status: 'completed'
            },
            { 
                $set: { status: 'confirmed' } 
            }
        );

        res.json({ 
            success: true, 
            message: `Đã sửa ${result.modifiedCount} đơn tương lai về 'confirmed'`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error fixing future bookings:', error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật đơn hàng' });
    }
};

// ---------------------------------------------------------
// [SMART ALERT] FIND MATCHING WAITLIST
// ---------------------------------------------------------
exports.findMatchingWaitlist = async (req, res) => {
    try {
        const { startTime, endTime, serviceName } = req.body;

        if (!startTime || !endTime || !serviceName) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: startTime, endTime, serviceName' 
            });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        // 1. Find waitlist items with matching service
        const waitlistItems = await Waitlist.find({ serviceName });

        if (waitlistItems.length === 0) {
            return res.json({ success: true, matches: [] });
        }

        // 2. Check room availability for each waitlist item
        const matches = [];

        for (const item of waitlistItems) {
            // Find available rooms for this time slot
            const allRooms = await Room.find();
            const conflictingBookings = await Booking.find({
                startTime: { $lt: end },
                endTime: { $gt: start },
                status: { $in: ['confirmed', 'processing'] }
            }).select('roomId');

            const occupiedRoomIds = conflictingBookings.map(b => b.roomId.toString());
            const availableRooms = allRooms.filter(r => !occupiedRoomIds.includes(r._id.toString()));

            if (availableRooms.length > 0) {
                matches.push({
                    waitlistItem: item,
                    availableRooms: availableRooms.map(r => ({ id: r._id, name: r.name }))
                });
            }
        }

        res.json({ 
            success: true, 
            matches,
            message: matches.length > 0 
                ? `Tìm thấy ${matches.length} khách hàng phù hợp trong hàng chờ!`
                : 'Không có khách hàng phù hợp trong hàng chờ'
        });
    } catch (error) {
        console.error('Error finding matching waitlist:', error);
        res.status(500).json({ success: false, message: 'Lỗi tìm kiếm hàng chờ' });
    }
};
