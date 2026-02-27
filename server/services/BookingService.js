const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const Branch = require('../models/Branch');
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

// Múi giờ Việt Nam — dùng xuyên suốt để parse input từ client
const VN_TZ = 'Asia/Ho_Chi_Minh';

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
// HELPER: Find service by name with fuzzy fallback
// Level 1: exact case-insensitive match
// Level 2: partial — DB name contains query or query contains DB name
// Level 3: longest common keyword (dịch vụ cũ vs mới)
// ---------------------------------------------------------
const findServiceByName = async (serviceName) => {
    if (!serviceName) return null;
    const q = serviceName.trim();

    // Level 1: exact (case-insensitive)
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let svc = await Service.findOne({ name: { $regex: new RegExp(`^${escaped}$`, 'i') }, type: 'service' });
    if (svc) return svc;

    // Level 2: partial substring match
    svc = await Service.findOne({ name: { $regex: new RegExp(escaped, 'i') }, type: 'service' });
    if (svc) return svc;

    // Level 3: keyword overlap — find service whose name shares most words with query
    const allServices = await Service.find({ type: 'service', isDeleted: { $ne: true } });
    if (!allServices.length) return null;

    const qWords = q.toLowerCase().split(/[\s,]+/).filter(w => w.length >= 2);
    let bestMatch = null;
    let bestScore = 0;
    for (const s of allServices) {
        const sWords = s.name.toLowerCase().split(/[\s,]+/);
        const score = qWords.filter(w => sWords.some(sw => sw.includes(w) || w.includes(sw))).length;
        if (score > bestScore) { bestScore = score; bestMatch = s; }
    }
    // Require at least 1 keyword match
    return bestScore >= 1 ? bestMatch : null;
};

// ---------------------------------------------------------
// 1. CHECK AVAILABILITY (Business Logic)
// ---------------------------------------------------------
const checkAvailability = async (date, serviceId, serviceName, branchId) => {
    // A. Validate Input
    if (!date || (!serviceName && !serviceId) || !branchId) {
        throw { status: 400, message: 'Thiếu thông tin ngày, dịch vụ hoặc chi nhánh' };
    }

    // Validate Date Range (Max 7 days)
    const bookingDate = dayjs.tz(date, VN_TZ);
    const today = dayjs().tz(VN_TZ).startOf('day');
    const maxDate = today.add(7, 'day').endOf('day');

    if (bookingDate.isAfter(maxDate)) {
        throw { status: 400, message: 'Chỉ được đặt lịch trước tối đa 7 ngày!' };
    }

    // B. Get Service Info
    let service;
    if (serviceId) {
        service = await Service.findById(serviceId);
    } else {
        service = await findServiceByName(serviceName);
    }

    if (!service) {
        throw { status: 404, message: `Dịch vụ "${serviceName}" không tồn tại` };
    }

    // C. Get Resources (Scoped by Branch)
    const allRooms = await Room.find({ isActive: true, branchId: branchId });
    const allBeds = await Bed.find({ isActive: true, branchId: branchId }).lean();
    const hasBeds = allBeds.length > 0;
    const qualifiedStaff = await Staff.find({ 
        isActive: true,
        branchId: branchId
    });
    
    const branch = await Branch.findById(branchId);
    if (!branch) throw { status: 404, message: 'Chi nhánh không tồn tại' };
    
    const openStr = branch.workingHours?.open || '09:00';
    const closeStr = branch.workingHours?.close || '20:00';

    // D. Time Loop (Dynamic)
    const availableSlots = [];
    const openTime = dayjs.tz(`${date} ${openStr}`, 'YYYY-MM-DD HH:mm', VN_TZ);
    const closeTime = dayjs.tz(`${date} ${closeStr}`, 'YYYY-MM-DD HH:mm', VN_TZ);
    const ALLOWED_OVERTIME = 30;
    const hardStop = closeTime.add(ALLOWED_OVERTIME, 'minute');
    
    let currentSlot = openTime;

    // Get all active bookings for that day (exclude cancelled + completed)
    const dayStart = dayjs.tz(`${date} 00:00`, 'YYYY-MM-DD HH:mm', VN_TZ).toDate();
    const dayEnd = dayjs.tz(`${date} 23:59`, 'YYYY-MM-DD HH:mm', VN_TZ).toDate();
    
    const bookingsToday = await Booking.find({
        branchId: branchId,
        startTime: { $gte: dayStart, $lte: dayEnd },
        status: { $in: ['pending', 'confirmed', 'processing'] }
    });

    while (currentSlot.isBefore(closeTime)) {
        const bufferMinutes = service.breakTime || 30;
        
        const proposedStart = currentSlot;
        const proposedEndService = currentSlot.add(service.duration, 'minute');
        const proposedEndOccupied = proposedEndService.add(bufferMinutes, 'minute');

        if (proposedEndService.isAfter(hardStop)) {
            break;
        }

        // CHECK 1: AVAILABLE BEDS (or fall back to room capacity)
        const suitableRooms = allRooms.filter(r => r.type === service.requiredRoomType);
        const suitableRoomIds = new Set(suitableRooms.map(r => r._id.toString()));

        let hasAvailableRoom;
        if (hasBeds) {
            const suitableBeds = allBeds.filter(b => suitableRoomIds.has(b.roomId.toString()));
            hasAvailableRoom = suitableBeds.some(bed => {
                const bedBusy = bookingsToday.some(booking => {
                    if (booking.bedId && booking.bedId.toString() === bed._id.toString()) {
                        const bStart = dayjs(booking.startTime);
                        const bEnd = dayjs(booking.endTime).add(booking.bufferTime || 0, 'minute');
                        return (proposedStart.isBefore(bEnd) && proposedEndOccupied.isAfter(bStart));
                    }
                    return false;
                });
                return !bedBusy;
            });
        } else {
            // Legacy: room capacity check
            hasAvailableRoom = suitableRooms.some(room => {
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
        }

        // CHECK 2: AVAILABLE STAFF
        const dayOfWeek = currentSlot.day();
        
        let freeStaff = qualifiedStaff.filter(staff => {
            const shift = staff.shifts?.find(s => s.dayOfWeek === dayOfWeek);
            if (!shift || shift.isOff) return false;

            const shiftStart = dayjs.tz(`${date} ${shift.startTime}`, 'YYYY-MM-DD HH:mm', VN_TZ);
            const shiftEnd = dayjs.tz(`${date} ${shift.endTime}`, 'YYYY-MM-DD HH:mm', VN_TZ);

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
            totalBeds: allBeds.length,
            qualifiedStaff: qualifiedStaff.length
        }
    };
};

// ---------------------------------------------------------
// 2. CREATE BOOKING (Business Logic)
// ---------------------------------------------------------
const createBooking = async (bookingData) => {
    const { customerName, phone, serviceName, serviceId: requestedServiceId, date, time, roomId, bedId: requestedBedId, staffId, branchId, status, source } = bookingData;
    
    const unlock = await bookingMutex.lock();
    try {
        // 0. Validate Branch
        if (!branchId) {
            throw { status: 400, message: 'Thiếu thông tin chi nhánh!' };
        }

        // 1. Parse Date/Time — parse as VN timezone (UTC+7)
        const startTime = dayjs.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', VN_TZ);
        if (!startTime.isValid()) {
            throw { status: 400, message: 'Ngày giờ không hợp lệ' };
        }

        // 2. Get Service — prefer exact ID, fallback to fuzzy name match
        let service = null;
        if (requestedServiceId) {
            service = await Service.findById(requestedServiceId);
        }
        if (!service && serviceName) {
            service = await findServiceByName(serviceName);
        }
        if (!service) {
            throw { status: 404, message: `Dịch vụ "${serviceName || requestedServiceId}" không tồn tại trong hệ thống` };
        }
        
        const endTime = startTime.add(service.duration, 'minute');
        const bufferTime = (service.breakTime !== undefined && service.breakTime !== null) ? service.breakTime : 30;
        const busyEndTime = endTime.add(bufferTime, 'minute');

        // 3. AUTO-ASSIGN RESOURCE
        const allRooms = await Room.find({ isActive: true, branchId: branchId });
        const allBeds = await Bed.find({ isActive: true, branchId: branchId }).lean();
        const hasBeds = allBeds.length > 0;
        let qualifiedStaff = await Staff.find({ isActive: true, branchId: branchId });

        const dayStart = dayjs.tz(`${date} 00:00`, 'YYYY-MM-DD HH:mm', VN_TZ).toDate();
        const dayEnd = dayjs.tz(`${date} 23:59`, 'YYYY-MM-DD HH:mm', VN_TZ).toDate();
        // Only include ACTIVE bookings: exclude cancelled + completed (completed means customer already left)
        const bookingsToday = await Booking.find({
            branchId: branchId,
            startTime: { $gte: dayStart, $lte: dayEnd },
            status: { $in: ['pending', 'confirmed', 'processing'] }
        });

        // A. Find Room + Bed
        let assignedRoom = null;
        let assignedBed = null;

        if (requestedBedId && hasBeds) {
            // TARGETED: specific bed requested
            const targetBed = allBeds.find(b => b._id.toString() === requestedBedId);
            if (targetBed) {
                const bedBusy = bookingsToday.some(b => {
                    if (b.bedId?.toString() === targetBed._id.toString()) {
                        const bStart = dayjs(b.startTime);
                        const bEnd = dayjs(b.endTime).add(b.bufferTime || 0, 'minute');
                        return (startTime.isBefore(bEnd) && busyEndTime.isAfter(bStart));
                    }
                    return false;
                });
                if (!bedBusy) {
                    assignedBed = targetBed;
                    assignedRoom = allRooms.find(r => r._id.toString() === targetBed.roomId.toString());
                }
            }
        } else if (roomId && !hasBeds) {
            // LEGACY: targeted room without beds
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
            // 1. Determine Target Type (Smart Heuristic)
            let targetType = service.requiredRoomType || 'BODY_SPA';
            const sName = (service.name || '').toLowerCase();

            // Override service type based on name keywords
            const headKeywords = ['gội', 'hair', 'tóc', 'head', 'dưỡng sinh', 'shampoo', 'wash'];
            const nailKeywords = ['nail', 'móng', 'sơn', 'gel', 'bột', 'dũa', 'úp', 'gắn', 'đắp', 'vẽ', 'ẩn', 'xà cừ', 'ombre', 'mắt mèo', 'cat eye', 'tháo'];

            if (headKeywords.some(k => sName.includes(k))) {
                targetType = 'HEAD_SPA';
            } else if (nailKeywords.some(k => sName.includes(k))) {
                targetType = 'NAIL_SPA';
            }

            // 2. Filter Suitable Rooms (checking Type AND Name fallback)
            const suitableRooms = allRooms.filter(r => {
                // Strict Type Match
                if (r.type === targetType) return true;
                
                // Fallback: Name Match (e.g. Room 'Nail 1' configured as BODY_SPA)
                const rName = (r.name || '').toLowerCase();
                if (targetType === 'NAIL_SPA' && (rName.includes('nail') || rName.includes('móng'))) return true;
                if (targetType === 'HEAD_SPA' && (rName.includes('gội') || rName.includes('hair'))) return true;
                
                return false;
            });

            if (hasBeds) {
                const suitableRoomIds = new Set(suitableRooms.map(r => r._id.toString()));
                const suitableBeds = allBeds
                    .filter(b => suitableRoomIds.has(b.roomId.toString()))
                    .sort((a, b) => a.sortOrder - b.sortOrder);

                for (const bed of suitableBeds) {
                    const bedBusy = bookingsToday.some(b => {
                        if (b.bedId?.toString() === bed._id.toString()) {
                            const bStart = dayjs(b.startTime);
                            const bEnd = dayjs(b.endTime).add(b.bufferTime || 0, 'minute');
                            const overlaps = startTime.isBefore(bEnd) && busyEndTime.isAfter(bStart);
                            return overlaps;
                        }
                        return false;
                    });
                    if (!bedBusy) {
                        assignedBed = bed;
                        assignedRoom = allRooms.find(r => r._id.toString() === bed.roomId.toString());
                        break;
                    }
                }
            } else {
                // Legacy capacity check
                assignedRoom = suitableRooms.find(room => {
                    const concurrentBookings = bookingsToday.filter(b => {
                        if (b.roomId?.toString() === room._id.toString()) {
                            const bStart = dayjs(b.startTime);
                            const bEnd = dayjs(b.endTime).add(b.bufferTime || 0, 'minute');
                            const overlaps = startTime.isBefore(bEnd) && busyEndTime.isAfter(bStart);
                            return overlaps;
                        }
                        return false;
                    });
                    return concurrentBookings.length < room.capacity;
                });
            }
        }

        if (!assignedRoom) {
            throw { status: 409, message: 'Hết phòng/giường vào giờ này rồi!' };
        }

        // B. Find Staff
        const dayOfWeek = startTime.day();
        const assignedStaff = qualifiedStaff.find(staff => {
            const shift = staff.shifts?.find(s => s.dayOfWeek === dayOfWeek);
            if (!shift || shift.isOff) return false;
            
            const shiftStart = dayjs.tz(`${date} ${shift.startTime}`, 'YYYY-MM-DD HH:mm', VN_TZ);
            const shiftEnd = dayjs.tz(`${date} ${shift.endTime}`, 'YYYY-MM-DD HH:mm', VN_TZ);
            
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
            bedId: assignedBed ? assignedBed._id : null,
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
            detail: `Phòng: ${assignedRoom.name}${assignedBed ? ` - ${assignedBed.name}` : ''} - NV: ${assignedStaff.name}`
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
