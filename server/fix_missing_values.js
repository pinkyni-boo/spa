import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import Room from './models/Room.js';
import dotenv from 'dotenv';
import dayjs from 'dayjs';

dotenv.config();

const MONGO_URI = 'mongodb://localhost:27017/spa_db';

const fixBookings = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB');

    // 1. Get all Rooms
    const rooms = await Room.find({});
    if (rooms.length === 0) {
      console.log('❌ No rooms found! Please run seed_rooms.js first.');
      process.exit(1);
    }
    console.log(`✅ Found ${rooms.length} rooms.`);

    // 2. Get all Bookings
    const bookings = await Booking.find({});
    console.log(`🔍 Found ${bookings.length} bookings.`);

    let updatedCount = 0;
    const today = dayjs().startOf('day');

    for (let i = 0; i < bookings.length; i++) {
        const booking = bookings[i];
        let needsUpdate = false;

        // A. Assign Room if missing
        if (!booking.roomId) {
            const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
            booking.roomId = randomRoom._id;
            needsUpdate = true;
            console.log(`   - Booking ${booking._id}: Assigned to Room ${randomRoom.name}`);
        }

        // B. (Optional) Force some bookings to TODAY for testing
        // Just move the last 3 bookings to Today at different times
        if (i >= bookings.length - 3) {
             const startHour = 9 + i; // 9:00, 10:00, 11:00...
             const newStart = today.hour(startHour).minute(0).toDate();
             const newEnd = today.hour(startHour + 1).minute(30).toDate(); // 1.5 hours
             
             booking.startTime = newStart;
             booking.endTime = newEnd;
             booking.status = 'confirmed'; // Ensure they are active
             needsUpdate = true;
             console.log(`   - Booking ${booking._id}: Moved to TODAY at ${startHour}:00`);
        }

        if (needsUpdate) {
            await booking.save();
            updatedCount++;
        }
    }

    console.log(`🎉 FIXED ${updatedCount} bookings!`);
    console.log('👉 Please refresh the Admin Scheduler Page now.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing bookings:', error);
    process.exit(1);
  }
};

fixBookings();
