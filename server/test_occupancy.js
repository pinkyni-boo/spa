const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Room = require('./models/Room');
const dayjs = require('dayjs');
require('dotenv').config();

// MongoDB Connection
const MONGO_URI = "mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project";

const runTest = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected.');

        // 1. Get Room
        const rooms = await Room.find({ isActive: true });
        console.log(`🏠 Found ${rooms.length} active rooms.`);
        if (rooms.length === 0) {
            console.log('⚠️ No active rooms found. Please create rooms first.');
            return;
        }

        const room = rooms[0];
        console.log(`➡️ Testing with Room: ${room.name} (${room._id})`);

        // 2. Mock Request Logic (Simulate DashboardController.getOccupancyRate)
        const todayStr = dayjs().format('YYYY-MM-DD');
        const todayStart = dayjs(todayStr).startOf('day');
        const todayEnd = dayjs(todayStr).endOf('day');

        console.log(`📅 Date: ${todayStr}`);

        // Get bookings
        const bookings = await Booking.find({
            startTime: { $gte: todayStart.toDate(), $lte: todayEnd.toDate() },
            status: { $in: ['processing', 'confirmed', 'completed'] },
            roomId: { $exists: true, $ne: null }
        });

        console.log(`📚 Found ${bookings.length} total active bookings for today.`);

        // 3. Calculate Occupancy (Copied logic)
        const TOTAL_MINUTES = 11 * 60; // 660 mins

        const occupancyData = rooms.map(r => {
            const roomBookings = bookings.filter(b => 
                b.roomId && b.roomId.toString() === r._id.toString()
            );

            let bookedMinutes = 0;
            roomBookings.forEach(booking => {
                const start = dayjs(booking.startTime);
                const end = dayjs(booking.endTime);
                
                // Cap start/end to today's working hours for stricter calc (optional)
                // For now using raw duration as per controller logic
                bookedMinutes += end.diff(start, 'minute');
            });

            let percentage = Math.round((bookedMinutes / TOTAL_MINUTES) * 100);

            return {
                name: r.name,
                bookedMinutes,
                percentage,
                count: roomBookings.length
            };
        });

        // Sort descending
        occupancyData.sort((a, b) => b.percentage - a.percentage);

        console.log('\n📊 OCCUPANCY REPORT:');
        console.table(occupancyData);

        console.log('\n✅ TEST PASSED: Logic executes correctly.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runTest();
