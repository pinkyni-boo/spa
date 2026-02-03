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
// MUTEX (Concurrency Control)
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
// 1. CHECK AVAILABILITY (Business Logic)
// ---------------------------------------------------------
const checkAvailability = async (date, serviceId, serviceName, branchId) => {
    // A. Validate Input
    if (!date || (!serviceName && !serviceId) || !branchId) {
        throw { status: 400, message: 'Thiếu thông tin ngày, dịch vụ hoặc chi nhánh' };
    }

    // Validate Date Range (Max 7 days)
    const bookingDate = dayjs(date);
    const today = dayjs().startOf('day');
    const maxDate = today.add(7, 'day').endOf('day');

    if (bookingDate.isAfter(maxDate)) {
        throw { status: 400, message: 'Chỉ được đặt lịch trước tối đa 7 ngày!' };
    }

    // B. Get Service Info
    let service;
    if (serviceId) {
        service = await Service.findById(serviceId);
    } else {
        service = await Service.findOne({ name: serviceName });
    }

    if (!service) {
        throw { status: 404, message: 'Dịch vụ không tồn tại' };
    }

    // C. Get Resources (Scoped by Branch)
    const allRooms = await Room.find({ isActive: true, branchId: branchId });
    const qualifiedStaff = await Staff.find({ 
        isActive: true,
        branchId: branchId
    });

    // D. Time Loop (9:00 -> 20:00) with Overtime Buffer
    const availableSlots = [];
    const openTime = dayjs(`${date} 09:00`);
    const closeTime = dayjs(`${date} 20:00`);
    const ALLOWED_OVERTIME = 30;
    const hardStop = closeTime.add(ALLOWED_OVERTIME, 'minute');
    
    let currentSlot = openTime;

    // Get all bookings for that day
    const dayStart = dayjs(`${date} 00:00`).toDate();
    const dayEnd = dayjs(`${date} 23:59`).toDate();
    
    const bookingsToday = await Booking.find({
        startTime: { $gte: dayStart, $lte: dayEnd },
        status: { $ne: 'cancelled' }
    });

    while (currentSlot.isBefore(closeTime)) {
        const bufferMinutes = service.breakTime || 30;
        
        const proposedStart = currentSlot;
        const proposedEndService = currentSlot.add(service.duration, 'minute');
        const proposedEndOccupied = proposedEndService.add(bufferMinutes, 'minute');

        if (proposedEndService.isAfter(hardStop)) {
            break;
        }

        // CHECK 1: AVAILABLE ROOMS
        const suitableRooms = allRooms.filter(r => r.type === service.requiredRoomType);
        
        let hasAvailableRoom = suitableRooms.some(room => {
            const concurrentBookings = bookingsToday.filter(booking => {
                if (booking.roomId && booking.roomId.toString() === room._id.toString()) {
                    const bStart = dayjs(booking.startTime);
                    const bEnd = dayjs(booking.endTime).add(booking.bufferTime || 0, 'minute');
                    return (proposedStart.isBefore(bEnd) && proposedEndOccupied.isAfter(bStart));
                }
                return false;
            });

            return concurrentBookings.length < room.capacity;
        });

        // CHECK 2: AVAILABLE STAFF
        const dayOfWeek = currentSlot.day();
        
        let freeStaff = qualifiedStaff.filter(staff => {
            const shift = staff.shifts?.find(s => s.dayOfWeek === dayOfWeek);
            if (!shift || shift.isOff) return false;

            const shiftStart = dayjs(`${date} ${shift.startTime}`, 'YYYY-MM-DD HH:mm');
            const shiftEnd = dayjs(`${date} ${shift.endTime}`, 'YYYY-MM-DD HH:mm');

            if (proposedStart.isBefore(shiftStart) || proposedEndService.isAfter(shiftEnd)) {
                return false;
            }

            const isBusy = bookingsToday.some(booking => {
                if (booking.staffId && booking.staffId.toString() === staff._id.toString()) {
                    const bStart = dayjs(booking.startTime);
                    const bEnd = dayjs(booking.endTime).add(booking.bufferTime || 0, 'minute');
                    
                    return (proposedStart.isBefore(bEnd) && proposedEndOccupied.isAfter(bStart));
                }
                return false;
            });
            return !isBusy;
        });

        // RESULT FOR SLOT
        if (hasAvailableRoom && freeStaff.length > 0) {
            availableSlots.push(currentSlot.format('HH:mm'));
        }

        currentSlot = currentSlot.add(30, 'minute');
    }

    return { 
        success: true, 
        availableSlots,
        debug: {
            totalRooms: allRooms.length,
            qualifiedStaff: qualifiedStaff.length
        }
    };
};

// ---------------------------------------------------------
// 2. CREATE BOOKING (Business Logic)
// ---------------------------------------------------------
const createBooking = async (bookingData) => {
    const { customerName, phone, serviceName, date, time, roomId, staffId, branchId, status, source } = bookingData;
    
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[${requestId}] ========= BOOKING REQUEST STARTED =========`);
    
    const unlock = await bookingMutex.lock();
    console.log(`[${requestId}] Mutex acquired`);
    
    try {
        // 0. Validate Branch
        if (!branchId) {
            throw { status: 400, message: 'Thiếu thông tin chi nhánh!' };
        }

        // 1. Parse Date/Time
        const startTime = dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
        if (!startTime.isValid()) {
            throw { status: 400, message: 'Ngày giờ không hợp lệ' };
        }

        // 2. Get Service
        const service = await Service.findOne({ name: serviceName });
        if (!service) {
            throw { status: 404, message: 'Dịch vụ k tồn tại' };
        }
        
        const endTime = startTime.add(service.duration, 'minute');
        const bufferTime = (service.breakTime !== undefined && service.breakTime !== null) ? service.breakTime : 30;
        const busyEndTime = endTime.add(bufferTime, 'minute');

        // 3. AUTO-ASSIGN RESOURCE
        const allRooms = await Room.find({ isActive: true, branchId: branchId });
        let qualifiedStaff = await Staff.find({ isActive: true, branchId: branchId });

        const dayStart = dayjs(`${date} 00:00`).toDate();
        const dayEnd = dayjs(`${date} 23:59`).toDate();
        const bookingsToday = await Booking.find({
            startTime: { $gte: dayStart, $lte: dayEnd },
            status: { $ne: 'cancelled' }
        });
        console.log(`[${requestId}] Found ${bookingsToday.length} existing bookings for ${date}`);

        // A. Find Room
        let assignedRoom = null;

        if (roomId) {
            // TARGETED BOOKING
            const targetRoom = allRooms.find(r => r._id.toString() === roomId);
            if (targetRoom) {
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
            const suitableRooms = allRooms.filter(r => r.type === service.requiredRoomType);
            console.log(`[${requestId}] Suitable rooms (${service.requiredRoomType}): ${suitableRooms.length}`);
            
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
            console.log(`[${requestId}] ❌ NO ROOM AVAILABLE`);
            throw { status: 409, message: 'Hết phòng vào giờ này rồi!' };
        }
        console.log(`[${requestId}] ✅ Assigned room: ${assignedRoom.name}`);

        // B. Find Staff
        const dayOfWeek = startTime.day();
        const assignedStaff = qualifiedStaff.find(staff => {
            const shift = staff.shifts?.find(s => s.dayOfWeek === dayOfWeek);
            if (!shift || shift.isOff) return false;
            
            const shiftStart = dayjs(`${date} ${shift.startTime}`, 'YYYY-MM-DD HH:mm');
            const shiftEnd = dayjs(`${date} ${shift.endTime}`, 'YYYY-MM-DD HH:mm');
            
            if (startTime.isBefore(shiftStart) || endTime.isAfter(shiftEnd)) return false;

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
            throw { status: 409, message: 'Không còn nhân viên phù hợp!' };
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
            status: status || 'pending',
            source: source || 'online',
            branchId: branchId
        });

        await newBooking.save();
        
        return { 
            success: true, 
            message: 'Đặt lịch thành công!', 
            booking: newBooking,
            detail: `Phòng: ${assignedRoom.name} - NV: ${assignedStaff.name}`
        };

    } finally {
        unlock();
    }
};

// ---------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------
module.exports = {
    checkAvailability,
    createBooking
};
