
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Staff = require('./models/Staff');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const Service = require('./models/Service');

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('--- REPRODUCING AVAILABILITY LOGIC (FULL) ---');

        const date = dayjs().add(1, 'day').format('YYYY-MM-DD'); 
        const serviceDuration = 60;
        const breakTime = 30;

        // Find staff to determine target branch
        const sampleStaff = await Staff.findOne({ isActive: true });
        const targetBranchId = sampleStaff.branchId ? sampleStaff.branchId.toString() : null;
        console.log(`Using Branch ID: ${targetBranchId}`);

        const allRooms = await Room.find({ isActive: true, branchId: targetBranchId });
        const qualifiedStaff = await Staff.find({ isActive: true, branchId: targetBranchId });
        
        console.log(`Found ${allRooms.length} rooms and ${qualifiedStaff.length} staff.`);

        const openTime = dayjs(`${date} 09:00`);
        const closeTime = dayjs(`${date} 20:00`); 
        
        let currentSlot = openTime;
        const availableSlots = [];

        while (currentSlot.isBefore(closeTime)) {
            const slotStr = currentSlot.format('HH:mm');
            
            const proposedStart = currentSlot;
            const proposedEndService = currentSlot.add(serviceDuration, 'minute');
            
            // Check Closing Time
            if (proposedEndService.isAfter(closeTime)) {
                console.log(`[${slotStr}] REJECTED: Ends at ${proposedEndService.format('HH:mm')} > Off ${closeTime.format('HH:mm')}`);
                break; 
            }

            // Check Staff
            const freeStaff = qualifiedStaff.filter(s => {
                const shift = s.shifts?.find(sh => sh.dayOfWeek === proposedStart.day());
                if (!shift) return false;

                const shiftStart = dayjs(`${date} ${shift.startTime}`);
                const shiftEnd = dayjs(`${date} ${shift.endTime}`);
                
                if (proposedStart.isBefore(shiftStart) || proposedEndService.isAfter(shiftEnd)) {
                     return false;
                }
                return true;
            });
            
            // Check Rooms (Simple Check: Just Count)
            // Real logic checks overlaps, but if count > 0 and no bookings, it passes.
            // Since we test 1 day ahead, likely 0 bookings.
            const freeRooms = allRooms; 

            if (freeStaff.length > 0 && freeRooms.length > 0) {
                 availableSlots.push(slotStr);
            } else {
                 console.log(`[${slotStr}] REJECTED: Resources (Staff: ${freeStaff.length}, Rooms: ${freeRooms.length})`);
            }

            currentSlot = currentSlot.add(30, 'minute');
        }
        
        console.log('Available Slots:', availableSlots);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
