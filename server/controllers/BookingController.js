const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const Waitlist = require('../models/Waitlist');
const BookingService = require('../services/BookingService'); // [NEW] Service Layer
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
        const io = req.app.locals.io; // Get Socket.io instance from app.locals
        const result = await BookingService.createBooking(req.body, io);
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
    const { date, phone, staffId, paymentStatus, branchId } = req.query; // [UPDATED] Added branchId
    
    console.log('\n========== GET ALL BOOKINGS DEBUG ==========');
    console.log('Request Query:', req.query);
    console.log('Date:', date);
    console.log('BranchId:', branchId);
    console.log('StaffId:', staffId);
    console.log('PaymentStatus:', paymentStatus);
    
    let query = {};

    if (branchId) {
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

    // [NEW] ADVANCED FILTERS
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

    const bookings = await Booking.find(query)
      .populate('serviceId', 'name price duration') 
      .populate('staffId', 'name') // New
      .populate('roomId', 'name')  // New
      .sort({ createdAt: -1 }); // Xếp theo mới tạo nhất (để Admin dễ thấy đơn vừa đặt)

    console.log('Final Query:', JSON.stringify(query, null, 2));
    console.log('Found Bookings:', bookings.length);
    console.log('==========================================\n');

    // [FIX] Return consistent format { success: true, bookings: [...] }
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
    // Note: Update logic should also check availability if time changes
    // For now, keep simple update
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
        res.json({ success: true, message: 'Đã hủy đơn' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [FIX] Add approve booking endpoint
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
        res.json({ success: true, booking, message: 'Đã duyệt đơn' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [FIX] Add complete booking endpoint
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
// 4. SMART OPERATIONS (PHASE 4)
// ---------------------------------------------------------

// A. CHECK-IN (Khách đến)
exports.checkIn = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        
        if (!booking) return res.status(404).json({ message: 'Không tìm thấy đơn' });
        if (booking.status !== 'confirmed') return res.status(400).json({ message: 'Chỉ đơn đã xác nhận mới được Check-in' });

        // [LOGIC MOI] Shift Booking to NOW
        const now = new Date();
        const duration = booking.endTime - booking.startTime; // Ms
        
        booking.startTime = now;
        booking.endTime = new Date(now.getTime() + duration);
        
        booking.status = 'processing';
        booking.actualStartTime = now;
        
        await booking.save();

        res.json({ success: true, message: 'Check-in thành công! Đã chuyển lịch về giờ hiện tại.', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi Check-in' });
    }
};

// B. SMART UPSELL (Thêm dịch vụ & Check xung đột)
// C. GLOBAL SEARCH (For "Sync Search" feature)
exports.searchBookings = async (req, res) => {
    try {
        const { query } = req.query; // Search text (name or phone)
        if (!query) return res.json({ success: true, bookings: [] });

        // Search logic: Find bookings with matching customerName Or Phone
        // Case insensitive regex
        const regex = new RegExp(query, 'i');
        
        const bookings = await Booking.find({
            $or: [
                { customerName: regex },
                { phone: regex }
            ],
            status: { $ne: 'cancelled' } // Optional: Exclude cancelled? User might want to find them too. Let's keep them but maybe sort by active first.
        })
        .populate('serviceId', 'name') // Just need basic info
        .sort({ startTime: 1 }) // Future first
        .limit(20); // Limit results for speed

        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBookingServices = async (req, res) => {
    const unlock = await bookingMutex.lock(); // Dùng Mutex để tránh tranh chấp
    try {
        const { id } = req.params;
        const { servicesDone, newEndTime } = req.body; 
        
        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Logic: If extending time, CHECK CONFLICT
        if (newEndTime && new Date(newEndTime) > booking.endTime) {
            const proposedEnd = new Date(newEndTime);
            const buffer = booking.bufferTime || 0;
            const busyEnd = dayjs(proposedEnd).add(buffer, 'minute');

            const conflict = await Booking.findOne({
                _id: { $ne: booking._id },
                roomId: booking.roomId,
                startTime: { $lt: busyEnd.toDate() },
                endTime: { $gt: booking.endTime }
            });

            if (conflict) {
                 return res.status(409).json({ 
                     success: false, 
                     message: 'XUNG ĐỘT: Không thể thêm dịch vụ vì vướng khách sau!',
                     conflictDetails: conflict
                 });
            }
            booking.endTime = proposedEnd;
        }

        if (servicesDone) {
            booking.servicesDone = servicesDone;
        }

        await booking.save();
        res.json({ success: true, message: 'Cập nhật dịch vụ thành công!', booking });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật dịch vụ' });
    } finally {
        unlock();
    }
};

// ---------------------------------------------------------
// [NEW] CRM - GET CUSTOMER HISTORY
// ---------------------------------------------------------
exports.getCustomerHistory = async (req, res) => {
    try {
        const { phone } = req.params;
        
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Thiếu số điện thoại' });
        }

        // Find all bookings for this phone number
        const bookings = await Booking.find({ phone })
            .populate('serviceId', 'name price duration')
            .populate('staffId', 'name')
            .populate('roomId', 'name')
            .sort({ startTime: -1 }) // Newest first
            .lean();

        // Map to include serviceName for frontend compatibility
        const mappedBookings = bookings.map(b => ({
            ...b,
            serviceName: b.serviceId?.name || 'N/A',
            staffName: b.staffId?.name || 'N/A',
            roomName: b.roomId?.name || 'N/A'
        }));

        res.json({ success: true, bookings: mappedBookings });
    } catch (error) {
        console.error('Error fetching customer history:', error);
        res.status(500).json({ success: false, message: 'Lỗi tải lịch sử khách hàng' });
    }
};

// ---------------------------------------------------------
// [UTILITY] BULK COMPLETE PAST BOOKINGS
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
// [UTILITY] FIX FUTURE COMPLETED BOOKINGS
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
