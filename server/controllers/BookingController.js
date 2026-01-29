const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const Waitlist = require('../models/Waitlist');
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

// ---------------------------------------------------------
// HELPER: MUTEX (Concurrency Control)
// ---------------------------------------------------------
// [RESTART TRIGGER: 16:17 - Bulk Complete API]
class Mutex {
    constructor() {
        this._locking = Promise.resolve();
        this._locked = false;
    }

    lock() {
        let unlockNext;
        const willLock = new Promise(resolve => unlockNext = resolve);
        const willUnlock = this._locking.then(() => unlockNext);
        this._locking = this._locking.then(() => willLock);
        return willUnlock;
    }
}
const bookingMutex = new Mutex();

// ---------------------------------------------------------
// 1. CHECK AVAILABILITY (SMART CORE)
// ---------------------------------------------------------
exports.checkAvailability = async (req, res) => {
  try {
    const { date, serviceName, serviceId, branchId } = req.body; // [UPDATED] Accept branchId

    // A. Validate Input
    if (!date || (!serviceName && !serviceId) || !branchId) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin ngày, dịch vụ hoặc chi nhánh' });
    }

    // [New] Validate Date Range (Max 7 days)
    const bookingDate = dayjs(date);
    const today = dayjs().startOf('day');
    const maxDate = today.add(7, 'day').endOf('day');

    if (bookingDate.isAfter(maxDate)) {
         return res.status(400).json({ success: false, message: 'Chỉ được đặt lịch trước tối đa 7 ngày!' });
    }

    // B. Get Service Info (Duration)
    let service;
    if (serviceId) {
        service = await Service.findById(serviceId);
    } else {
        service = await Service.findOne({ name: serviceName });
    }

    if (!service) return res.status(404).json({ success: false, message: 'Dịch vụ không tồn tại' });
    
    // C. Get Resources (Scoped by Branch)
    // 1. Rooms (Active & In Branch)
    const allRooms = await Room.find({ isActive: true, branchId: branchId });
    
    // 2. Staff (Active & In Branch)
    const qualifiedStaff = await Staff.find({ 
        isActive: true,
        branchId: branchId
    });

    // D. Time Loop (9:00 -> 20:00) with Overtime Buffer
    const availableSlots = [];
    const openTime = dayjs(`${date} 09:00`);
    const closeTime = dayjs(`${date} 20:00`); // Business closing time
    const ALLOWED_OVERTIME = 30; // Allow services to end 30 mins after close
    const hardStop = closeTime.add(ALLOWED_OVERTIME, 'minute'); // 20:30
    
    // Slot loop (30 mins step)
    let currentSlot = openTime;

    // Get all bookings for that day to check overlap
    const dayStart = dayjs(`${date} 00:00`).toDate();
    const dayEnd = dayjs(`${date} 23:59`).toDate();
    
    const bookingsToday = await Booking.find({
        startTime: { $gte: dayStart, $lte: dayEnd },
        status: { $ne: 'cancelled' }
    });

    while (currentSlot.isBefore(closeTime)) {
        // Calculate Proposed Time Range
        // Booking End = Start + Duration
        // Occupied End = Start + Duration + Buffer (cleanup)
        const durationMs = service.duration * 60 * 1000;
        const bufferMinutes = service.breakTime || 30; // Use Service Buffer or Default 30
        
        const proposedStart = currentSlot;
        const proposedEndService = currentSlot.add(service.duration, 'minute');
        const proposedEndOccupied = proposedEndService.add(bufferMinutes, 'minute'); // Time resource is busy (Duration + Buffer)

        if (proposedEndService.isAfter(hardStop)) {
             break; // Exceed hard stop time (20:00 + 30m buffer)
        }

        // --- CHECK 1: AVAILABLE ROOMS (CAPACITY & TYPE CHECK) ---
        // Filter rooms by Required Type
        const suitableRooms = allRooms.filter(r => r.type === service.requiredRoomType);
        
        // Check capacity for each suitable room
        // A room is available if concurrent bookings < capacity
        let hasAvailableRoom = suitableRooms.some(room => {
             // Count overlapping bookings for this specific room
             const concurrentBookings = bookingsToday.filter(booking => {
                 if (booking.roomId && booking.roomId.toString() === room._id.toString()) {
                     const bStart = dayjs(booking.startTime);
                     const bEnd = dayjs(booking.endTime).add(booking.bufferTime || 0, 'minute');
                     // Check overlap with PROPOSED slot
                     return (proposedStart.isBefore(bEnd) && proposedEndOccupied.isAfter(bStart));
                 }
                 return false;
             });

             return concurrentBookings.length < room.capacity;
        });

        // --- CHECK 2: AVAILABLE STAFF (UNIVERSAL - NO SKILL CHECK) ---
        // 2.1 Check Shift
        // 2.2 Check Overlap
        const dayOfWeek = currentSlot.day(); // 0: Sun, 1: Mon...
        
        let freeStaff = qualifiedStaff.filter(staff => {
             // 2.1 Shift Check
             const shift = staff.shifts?.find(s => s.dayOfWeek === dayOfWeek);
             if (!shift || shift.isOff) return false; // Not working today

             // Check if slot is within Shift Time
             const shiftStart = dayjs(`${date} ${shift.startTime}`, 'YYYY-MM-DD HH:mm');
             const shiftEnd = dayjs(`${date} ${shift.endTime}`, 'YYYY-MM-DD HH:mm');

             if (proposedStart.isBefore(shiftStart) || proposedEndService.isAfter(shiftEnd)) {
                 return false; // Slot outside shift
             }

             // 2.2 Booking Overlap Check
             const isBusy = bookingsToday.some(booking => {
                 if (booking.staffId && booking.staffId.toString() === staff._id.toString()) {
                      const bStart = dayjs(booking.startTime);
                      const bEnd = dayjs(booking.endTime).add(booking.bufferTime || 0, 'minute');
                      
                      return (
                        (proposedStart.isBefore(bEnd) && proposedEndOccupied.isAfter(bStart))
                     );
                 }
                 return false;
             });
             return !isBusy;
        });

        // --- RESULT FOR SLOT ---
        if (hasAvailableRoom && freeStaff.length > 0) {
            availableSlots.push(currentSlot.format('HH:mm'));
        }

        // Next slot
        currentSlot = currentSlot.add(30, 'minute');
    }

    res.json({ 
        success: true, 
        availableSlots,
        debug: {
            totalRooms: allRooms.length,
            qualifiedStaff: qualifiedStaff.length
        }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra lịch' });
  }
};

// ---------------------------------------------------------
// 2. CREATE BOOKING (UPDATED)
// ---------------------------------------------------------
exports.createBooking = async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] ========= BOOKING REQUEST STARTED =========`);
    const unlock = await bookingMutex.lock();
    console.log(`[${requestId}] Mutex acquired`);
    try {
        const { customerName, phone, serviceName, date, time, roomId, staffId, branchId } = req.body; // [UPDATED] Accept branchId

        // 0. Validate Branch
        if (!branchId) return res.status(400).json({ success: false, message: 'Thiếu thông tin chi nhánh!' });

        // 1. Parse Date/Time
        const startTime = dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
        if (!startTime.isValid()) throw new Error('Ngày giờ không hợp lệ');

        // 2. Get Service
        const service = await Service.findOne({ name: serviceName });
        if (!service) return res.status(404).json({ message: 'Dịch vụ k tồn tại' });
        
        const endTime = startTime.add(service.duration, 'minute');
        const bufferTime = (service.breakTime !== undefined && service.breakTime !== null) ? service.breakTime : 30;
        const busyEndTime = endTime.add(bufferTime, 'minute');

        // 3. AUTO-ASSIGN RESOURCE (SCOPED BY BRANCH)
        // Find FIRST available Room and Staff in THIS BRANCH
        
        const allRooms = await Room.find({ isActive: true, branchId: branchId }); // [FIX] Filter by Branch
        let qualifiedStaff = await Staff.find({ isActive: true, branchId: branchId }); // [FIX] Filter by Branch

        // Overlap Range
        const dayStart = dayjs(`${date} 00:00`).toDate();
        const dayEnd = dayjs(`${date} 23:59`).toDate();
        const bookingsToday = await Booking.find({
            startTime: { $gte: dayStart, $lte: dayEnd },
            status: { $ne: 'cancelled' }
        });
        console.log(`[${requestId}] Found ${bookingsToday.length} existing bookings for ${date}`);

        // [new] A. Find Room
        let assignedRoom = null;

        if (roomId) {
            // TARGETED BOOKING (Drag & Drop)
            const targetRoom = allRooms.find(r => r._id.toString() === roomId);
            if (targetRoom) {
                 // Check Capacity
                 const concurrentBookings = bookingsToday.filter(b => {
                     if (b.roomId?.toString() === targetRoom._id.toString()) {
                         const bStart = dayjs(b.startTime);
                         const bEnd = dayjs(b.endTime).add(b.bufferTime || 0, 'minute');
                         return (startTime.isBefore(bEnd) && busyEndTime.isAfter(bStart));
                     }
                     return false;
                 });
                 
                 if (concurrentBookings.length < targetRoom.capacity) {
                     assignedRoom = targetRoom;
                 }
            }
        } else {
            // AUTO ASSIGN
            // 1. Filter by Required Type
            const suitableRooms = allRooms.filter(r => r.type === service.requiredRoomType);
            console.log(`[${requestId}] Suitable rooms (${service.requiredRoomType}): ${suitableRooms.length}`);
            
            // 2. Find first room with available capacity
            assignedRoom = suitableRooms.find(room => {
                const concurrentBookings = bookingsToday.filter(b => {
                    if (b.roomId?.toString() === room._id.toString()) {
                        const bStart = dayjs(b.startTime);
                        const bEnd = dayjs(b.endTime).add(b.bufferTime || 0, 'minute');
                        const overlaps = startTime.isBefore(bEnd) && busyEndTime.isAfter(bStart);
                        if (overlaps) {
                            console.log(`[${requestId}]   - Overlap found: Booking ${b._id} (${bStart.format('HH:mm')}-${bEnd.format('HH:mm')})`);
                        }
                        return overlaps;
                    }
                    return false;
                });
                const hasCapacity = concurrentBookings.length < room.capacity;
                console.log(`[${requestId}] Room "${room.name}": ${concurrentBookings.length}/${room.capacity} - ${hasCapacity ? 'AVAILABLE' : 'FULL'}`);
                return hasCapacity;
            });
        }

        if (!assignedRoom) {
            console.log(`[${requestId}] ❌ NO ROOM AVAILABLE - Rejecting booking`);
            return res.status(409).json({ success: false, message: 'Hết phòng vào giờ này rồi!' });
        }
        console.log(`[${requestId}] ✅ Assigned room: ${assignedRoom.name}`);

        // Find Staff
         const dayOfWeek = startTime.day();
         const assignedStaff = qualifiedStaff.find(staff => {
             // Shift Check
             const shift = staff.shifts?.find(s => s.dayOfWeek === dayOfWeek);
             if (!shift || shift.isOff) return false;
             const shiftStart = dayjs(`${date} ${shift.startTime}`, 'YYYY-MM-DD HH:mm');
             const shiftEnd = dayjs(`${date} ${shift.endTime}`, 'YYYY-MM-DD HH:mm');
             
             // Check if Booking fits in Shift
             if (startTime.isBefore(shiftStart) || endTime.isAfter(shiftEnd)) return false;

             // Busy Check
             const isBusy = bookingsToday.some(b => {
                 if (b.staffId?.toString() === staff._id.toString()) {
                     const bStart = dayjs(b.startTime);
                     const bEnd = dayjs(b.endTime).add(b.bufferTime || 0, 'minute');
                     return (startTime.isBefore(bEnd) && busyEndTime.isAfter(bStart));
                 }
                 return false;
             });
             return !isBusy;
         });

         if (!assignedStaff) {
             return res.status(409).json({ success: false, message: 'Không còn nhân viên phù hợp!' });
         }

         // -------------------------------------
         // [NOTE] Double Check removed as it conflicted with Multi-bed Logic. 
         // Mutex + earlier checks are sufficient.
         // -------------------------------------
         // -------------------------------------

         // 4. Create Booking
         const newBooking = new Booking({
             customerName,
             phone,
             serviceId: service._id,
             staffId: assignedStaff._id,
             roomId: assignedRoom._id,
             startTime: startTime.toDate(),
             endTime: endTime.toDate(),
             bufferTime: bufferTime,
             status: req.body.status || 'pending', // [FIX] Accept status from request
             source: req.body.source || 'online',
             branchId: branchId // [NEW] Save Branch
         });

         await newBooking.save();
         
         res.json({ 
             success: true, 
             message: 'Đặt lịch thành công!', 
             booking: newBooking,
             detail: `Phòng: ${assignedRoom.name} - NV: ${assignedStaff.name}`
         });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Lỗi server khi đặt lịch' });
    } finally {
        unlock();
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
