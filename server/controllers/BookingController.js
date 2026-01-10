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
        const bufferMs = 10 * 60 * 1000; // Hardcode 10 mins buffer for now
        
        const proposedStart = currentSlot;
        const proposedEndService = currentSlot.add(service.duration, 'minute');
        const proposedEndOccupied = proposedEndService.add(10, 'minute'); // Time resource is busy

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
        const { customerName, phone, serviceName, date, time } = req.body;

        // 1. Parse Date/Time
        const startTime = dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
        if (!startTime.isValid()) throw new Error('Ngày giờ không hợp lệ');

        // 2. Get Service
        const service = await Service.findOne({ name: serviceName });
        if (!service) return res.status(404).json({ message: 'Dịch vụ k tồn tại' });
        
        const endTime = startTime.add(service.duration, 'minute');
        const bufferTime = 10; // Default buffer
        const busyEndTime = endTime.add(bufferTime, 'minute');

        // 3. AUTO-ASSIGN RESOURCE (SIMPLE STRATEGY)
        // Find FIRST available Room and Staff
        // (Similar logic to checkAvailability but for specific slot)
        
        // ... (Re-query resource to be safe inside Mutex) ...
        const allRooms = await Room.find({ isActive: true });
        // REMOVED skill check: All active staff are qualified
        const qualifiedStaff = await Staff.find({ isActive: true });
        
        // Overlap Range
        const dayStart = dayjs(`${date} 00:00`).toDate();
        const dayEnd = dayjs(`${date} 23:59`).toDate();
        const bookingsToday = await Booking.find({
            startTime: { $gte: dayStart, $lte: dayEnd },
            status: { $ne: 'cancelled' }
        });

        // Find Room
        const assignedRoom = allRooms.find(room => {
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

        if (!assignedRoom) {
            return res.status(409).json({ success: false, message: 'Hết phòng vào giờ này rồi!' });
        }

        // Find Staff
         const dayOfWeek = startTime.day();
         const assignedStaff = qualifiedStaff.find(staff => {
             // Shift Check
             const shift = staff.shifts?.find(s => s.dayOfWeek === dayOfWeek);
             if (!shift || shift.isOff) return false;
             const shiftStart = dayjs(`${date} ${shift.startTime}`);
             const shiftEnd = dayjs(`${date} ${shift.endTime}`);
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
             status: 'pending',
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
    const { date } = req.query;
    let query = {};

    if (date) {
        const start = dayjs(date).startOf('day').toDate();
        const end = dayjs(date).endOf('day').toDate();
        query.startTime = { $gte: start, $lte: end };
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
