const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('../models/Service');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Staff = require('../models/Staff');

const debugAvailability = async () => {
    try {
        const uri = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        // 1. Service Info
        const service = await Service.findOne({ name: { $regex: "Massage Body Thụy Điển", $options: 'i' } });
        console.log(`\n--- SERVICE: ${service.name} ---`);
        console.log(`Required Room Type: ${service.requiredRoomType}`); // Check this
        console.log(`Duration: ${service.duration}`);

        // 2. Branch Info (District 1)
        // We need to find the branch ID for 'Quận 1'
        // Assuming we can find room with 'Quận 1' to get Branch ID or just list all Rooms/Staff
        
        console.log(`\n--- ROOMS (Quận 1) ---`);
        const allRooms = await Room.find({ isActive: true });
        const d1Rooms = allRooms.filter(r => r.name.includes('Quận 1'));
        
        d1Rooms.forEach(r => {
            console.log(`Room: ${r.name} | Type: ${r.type} | BranchID: ${r.branchId} | Capacity: ${r.capacity}`);
        });

        // 3. Staff Info (Quận 1)
        // Use the branchId from one of the rooms
        if (d1Rooms.length > 0) {
            const branchId = d1Rooms[0].branchId;
            const allStaff = await Staff.find({ isActive: true, branchId: branchId });
            console.log(`\n--- STAFF (Quận 1) Count: ${allStaff.length} ---`);
            
            // Check shifts for 2026-01-31 (Saturday)
            // Day 6 = Saturday (if 0 is Sunday)
            const checkDate = new Date('2026-01-31');
            const dayOfWeek = checkDate.getDay(); // 6
            console.log(`Checking Shifts for Day: ${dayOfWeek} (Sat)`);
            
            allStaff.forEach(s => {
                const shift = s.shifts.find(sh => sh.dayOfWeek === dayOfWeek);
                console.log(`Staff: ${s.name} | Shift: ${shift ? `${shift.startTime}-${shift.endTime}` : 'OFF'} | Skills: ${s.allowedServices?.length || 0} services`);
                // Check if they can do the Body Service
                const canDo = s.allowedServices?.includes(service._id.toString()); // Check by ID
                console.log(`   -> Can do 'Massage Body Thụy Điển'?: ${canDo}`);
                if (s.allowedServices) console.log(`   -> Skills: ${JSON.stringify(s.allowedServices)}`);
            });
        }


        // 3. Check Bookings for Today
        const startDay = new Date('2026-01-31T00:00:00.000Z');
        const endDay = new Date('2026-02-01T00:00:00.000Z');

        const bookings = await Booking.find({
            date: { $gte: startDay, $lt: endDay }
        }).populate('serviceId').populate('roomId'); // Assuming roomId field exists in Booking

        console.log(`\n--- BOOKINGS FOR 2026-01-31 ---`);
        const targetTimeBookings = bookings.filter(b => b.startTime === '15:00');
        console.log(`Bookings starting at 15:00: ${targetTimeBookings.length}`);
        
        targetTimeBookings.forEach(b => {
             console.log(`- Booking ID: ${b._id} | Guest: ${b.customerName} | Service: ${b.serviceId?.name} | Room: ${b.roomId?.name} | Status: ${b.status}`);
        });


    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

debugAvailability();
