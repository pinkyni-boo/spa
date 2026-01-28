
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const dayjs = require('dayjs');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    await mongoose.connect(MONGODB_URI);
    
    // Check Room
    const rooms = await Room.find({ type: 'HEAD_SPA' });
    console.log('Head Spa Rooms:');
    rooms.forEach(r => console.log(`- ${r.name} (Cap: ${r.capacity}, Branch: ${r.branchId})`));

    // Check Bookings
    const date = dayjs().add(2, 'day').format('YYYY-MM-DD'); 
    const start = dayjs(`${date} 00:00`).toDate();
    const end = dayjs(`${date} 23:59`).toDate();

    const bookings = await Booking.find({ startTime: { $gte: start, $lte: end } });
    console.log(`\nBookings on ${date}: ${bookings.length}`);
    bookings.forEach(b => console.log(`- Room: ${b.roomId}, Start: ${b.startTime}`));

    await mongoose.disconnect();
};
run();
