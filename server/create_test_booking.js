import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import Room from './models/Room.js';
import Service from './models/Service.js';
import Staff from './models/Staff.js';
import dayjs from 'dayjs';

// Hardcoded URI to avoid dotenv issues
const MONGO_URI = 'mongodb://localhost:27017/spa_db';

const createBooking = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB');

    // 1. Get Resources
    const room = await Room.findOne();
    const service = await Service.findOne();
    const staff = await Staff.findOne();

    if (!room || !service) {
        console.error('❌ Missing Room or Service data. Run seeds first.');
        process.exit(1);
    }

    // 2. Define "Today" at specific times
    const today = dayjs().startOf('day');
    
    // Create 3 bookings at different times/rooms
    const bookings = [
        {
            customerName: "Nguyễn Văn Test A",
            phone: "0909000111",
            serviceId: service._id,
            roomId: room._id, // Assign to first room
            staffId: staff ? staff._id : null,
            startTime: today.hour(9).minute(0).toDate(), // 9:00 AM
            endTime: today.hour(10).minute(30).toDate(), // 10:30 AM
            status: 'confirmed',
            source: 'admin_test'
        },
        {
            customerName: "Trần Thị Test B",
            phone: "0909000222",
            serviceId: service._id,
            roomId: room._id, // FORCE SAME ROOM to test collision later? No, let's put it later
            staffId: staff ? staff._id : null,
            startTime: today.hour(14).minute(0).toDate(), // 2:00 PM
            endTime: today.hour(15).minute(30).toDate(), // 3:30 PM
            status: 'pending',
            source: 'admin_test'
        }
    ];

    await Booking.deleteMany({ source: 'admin_test' }); // Clear old tests
    await Booking.insertMany(bookings);

    console.log('✅ Created 2 Test Bookings for TODAY (9:00 & 14:00)');
    console.log('👉 Refresh Admin Scheduler now!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createBooking();
