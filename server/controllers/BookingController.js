const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

// ---------------------------------------------------------
// HELPER: MUTEX (Concurrency Control)
// ---------------------------------------------------------
// [RESTART TRIGGER: 19:55]
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
    const { date, serviceName, serviceId } = req.body; // Changed to body for POST, or query if GET

    // A. Validate Input
    if (!date || (!serviceName && !serviceId)) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin ngày hoặc dịch vụ' });
    }

    // B. Get Service Info (Duration)
    let service;
    if (serviceId) {
        service = await Service.findById(serviceId);
    } else {
        service = await Service.findOne({ name: serviceName });
    }

    if (!service) return res.status(404).json({ success: false, message: 'Dịch vụ không tồn tại' });
    
    // C. Get Resources
    // 1. Rooms (Active)
    const allRooms = await Room.find({ isActive: true });
    
    // 2. Staff (Active) - Updated: All staff can do all services
    const qualifiedStaff = await Staff.find({ 
        isActive: true
        // skills: service.name (REMOVED: User requirement "All staff do all services")
    });

    // D. Time Loop (9:00 -> 18:00)
    // TODO: Dynamic opening hours from config
    const availableSlots = [];
    const openTime = dayjs(`${date} 09:00`);
    const closeTime = dayjs(`${date} 18:00`);
    
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

        if (proposedEndService.isAfter(closeTime)) {
             break; // Exceed closing time
        }

        // --- CHECK 1: AVAILABLE ROOMS ---
        let freeRooms = allRooms.filter(room => {
            // Check if this room is busy in any booking today
            const isBusy = bookingsToday.some(booking => {
                 if (booking.roomId && booking.roomId.toString() === room._id.toString()) {
                     // Check overlap
                     // [Start, End] overlaps [ProposedStart, ProposedEndOccupied]
                     const bStart = dayjs(booking.startTime);
                     const bEnd = dayjs(booking.endTime).add(booking.bufferTime || 0, 'minute'); // Existing booking busy time
                     
                     return (
                        (proposedStart.isBefore(bEnd) && proposedEndOccupied.isAfter(bStart))
                     );
                 }
                 return false;
            });
            return !isBusy;
        });

        // --- CHECK 2: AVAILABLE STAFF ---
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
        if (freeRooms.length > 0 && freeStaff.length > 0) {
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
    const unlock = await bookingMutex.lock();
    try {
        const { customerName, phone, serviceName, date, time, roomId, staffId } = req.body; // [UPDATED] Accept roomId, staffId

        // 1. Parse Date/Time
        const startTime = dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
        if (!startTime.isValid()) throw new Error('Ngày giờ không hợp lệ');

        // 2. Get Service
        const service = await Service.findOne({ name: serviceName });
        if (!service) return res.status(404).json({ message: 'Dịch vụ k tồn tại' });
        
        const endTime = startTime.add(service.duration, 'minute');
        // [FIX] Buffer Time: If 0, keep 0. Only use 30 if undefined/null.
        const bufferTime = (service.breakTime !== undefined && service.breakTime !== null) ? service.breakTime : 30;
        const busyEndTime = endTime.add(bufferTime, 'minute');

        // 3. AUTO-ASSIGN RESOURCE (SIMPLE STRATEGY)
        // Find FIRST available Room and Staff
        // (Similar logic to checkAvailability but for specific slot)
        
        // ... (Re-query resource to be safe inside Mutex) ...
        const allRooms = await Room.find({ isActive: true });
        // REMOVED skill check: All active staff are qualified
        let qualifiedStaff = await Staff.find({ isActive: true }); // Let to modify

        // Overlap Range
        const dayStart = dayjs(`${date} 00:00`).toDate();
        const dayEnd = dayjs(`${date} 23:59`).toDate();
        const bookingsToday = await Booking.find({
            startTime: { $gte: dayStart, $lte: dayEnd },
            status: { $ne: 'cancelled' }
        });

        // [new] A. Find Room
        let assignedRoom = null;

        if (roomId) {
            // TARGETED BOOKING (Drag & Drop)
            const targetRoom = allRooms.find(r => r._id.toString() === roomId);
            if (targetRoom) {
                 const isBusy = bookingsToday.some(b => {
                     if (b.roomId?.toString() === targetRoom._id.toString()) {
                         const bStart = dayjs(b.startTime);
                         const bEnd = dayjs(b.endTime).add(b.bufferTime || 0, 'minute');
                         return (startTime.isBefore(bEnd) && busyEndTime.isAfter(bStart));
                     }
                     return false;
                 });
                 if (!isBusy) assignedRoom = targetRoom;
            }
        } else {
            // AUTO ASSIGN
            assignedRoom = allRooms.find(room => {
                const isBusy = bookingsToday.some(b => {
                    if (b.roomId?.toString() === room._id.toString()) {
                        const bStart = dayjs(b.startTime);
                        const bEnd = dayjs(b.endTime).add(b.bufferTime || 0, 'minute');
                        return (startTime.isBefore(bEnd) && busyEndTime.isAfter(bStart));
                    }
                    return false;
                });
                return !isBusy;
            });
        }

        if (!assignedRoom) {
            return res.status(409).json({ success: false, message: 'Hết phòng vào giờ này rồi!' });
        }

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

         // --- [NEW] CONCURRENCY DOUBLE CHECK ---
         // Check one last time if this specific Room/Staff is taken
         const doubleCheck = await Booking.findOne({
             $or: [
                 { roomId: assignedRoom._id },
                 { staffId: assignedStaff._id }
             ],
             startTime: { $lt: busyEndTime.toDate() }, // Overlap logic
             bookings_endTime_plus_buffer: { $gt: startTime.toDate() }, // *Pseudo-code logic, need simple overlap*
             status: { $ne: 'cancelled' }
         });
         
         // Real overlap logic for Double Check
         // New Booking: [Start, BusyEnd]
         // Existing: [b.Start, b.End + Buffer]
         const conflict = await Booking.find({
             $or: [
                 { roomId: assignedRoom._id },
                 { staffId: assignedStaff._id }
             ],
             startTime: { $gte: dayStart, $lte: dayEnd },
             status: { $ne: 'cancelled' }
         });
         
         const isConflict = conflict.some(b => {
              const bStart = dayjs(b.startTime);
              const bEnd = dayjs(b.endTime).add(b.bufferTime || 0, 'minute');
              return (startTime.isBefore(bEnd) && busyEndTime.isAfter(bStart));
         });

         if (isConflict) {
             return res.status(409).json({ success: false, message: 'Tiếc quá, có người nhanh tay hơn rồi! Vui lòng chọn giờ khác.' });
         }
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
             source: req.body.source || 'online'
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
    const { date, phone, staffId, paymentStatus } = req.query; // [UPDATED] Filters
    let query = {};

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

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
