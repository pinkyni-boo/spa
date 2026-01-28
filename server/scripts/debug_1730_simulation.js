
const mongoose = require('mongoose');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
dayjs.extend(isBetween);

require('dotenv').config();
const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        
        const serviceName = 'Gội đầu dưỡng sinh'; // Or verify Massage
        const branchName = 'MIU SPA - Quận 3'; // Check Q3 as likely target
        const date = dayjs().add(2, 'day').format('YYYY-MM-DD'); 
        
        console.log(`--- SIMULATING 17:30 CHECK for [${serviceName}] on [${date}] ---`);

        // 1. Get Service
        const service = await Service.findOne({ name: serviceName });
        if (!service) throw new Error('Service not found');
        console.log(`Service Duration: ${service.duration} mins, Required Room: ${service.requiredRoomType}`);

        // 2. Get Branch
        // We need branchId. Let's assume we find staff first to get branchId or just query Branch.
        // Actually Branch ID for Q3 from prev logs: 696b653f88872bdaa4d9d2d9
        const branchId = '696b653f88872bdaa4d9d2d9'; 

        // 3. Get Resources
        const allRooms = await Room.find({ isActive: true, branchId, type: service.requiredRoomType });
        console.log(`Suitable Rooms Found: ${allRooms.length}`);
        
        const qualifiedStaff = await Staff.find({ isActive: true, branchId });
        console.log(`Staff Found: ${qualifiedStaff.length}`);

        // 4. Simulate Slot 17:30
        const slotTime = dayjs(`${date} 17:30`);
        const closeTime = dayjs(`${date} 20:00`);
        const duration = service.duration;
        const buffer = service.breakTime || 30;

        const proposedEnd = slotTime.add(duration, 'minute');
        const proposedOccupied = proposedEnd.add(buffer, 'minute');

        console.log(`Slot: 17:30 -> End Service: ${proposedEnd.format('HH:mm')} -> End Occupied: ${proposedOccupied.format('HH:mm')}`);
        console.log(`Close Time: ${closeTime.format('HH:mm')}`);

        // Check 1: Closing Time
        if (proposedEnd.isAfter(closeTime)) {
             console.log('FAIL: Exceeds Closing Time!');
             return;
        } else {
            console.log('PASS: Within Closing Time.');
        }

        // Check 2: Rooms
        const bookingsToday = []; // Assume empty for "new day"
        
        const suitableRooms = allRooms.filter(r => r.type === service.requiredRoomType);
        const hasRoom = suitableRooms.some(room => {
             // Capacity check with 0 bookings -> should pass
             return 0 < room.capacity;
        });
        console.log(`Room Check: ${hasRoom ? 'PASS' : 'FAIL'}`);

        // Check 3: Staff
        const dayOfWeek = slotTime.day(); 
        console.log(`Day of Week: ${dayOfWeek}`);
        
        const freeStaff = qualifiedStaff.filter(staff => {
             const shift = staff.shifts.find(s => s.dayOfWeek === dayOfWeek);
             if (!shift || shift.isOff) {
                 console.log(`- ${staff.name}: No Shift or Off`);
                 return false;
             }
             
             const shiftStart = dayjs(`${date} ${shift.startTime}`, 'YYYY-MM-DD HH:mm');
             const shiftEnd = dayjs(`${date} ${shift.endTime}`, 'YYYY-MM-DD HH:mm');
             
             console.log(`- ${staff.name}: Shift ${shift.startTime}-${shift.endTime}`);
             
             // Logic Check
             if (slotTime.isBefore(shiftStart) || proposedEnd.isAfter(shiftEnd)) {
                 console.log(`  -> FAIL: Slot outside shift`);
                 return false; 
             }
             console.log(`  -> PASS`);
             return true;
        });

        console.log(`Available Staff: ${freeStaff.length}`);
        
        if (hasRoom && freeStaff.length > 0) {
            console.log('>>> SLOT 17:30 IS AVAILABLE <<<');
        } else {
            console.log('>>> SLOT 17:30 IS UNAVAILABLE <<<');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
run();
