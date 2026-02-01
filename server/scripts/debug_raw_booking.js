const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('../models/Booking');

const checkRawBooking = async () => {
    try {
        const uri = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';
        await mongoose.connect(uri);
        
        // Fetch ONE booking to check structure
        const booking = await Booking.findOne().sort({ createdAt: -1 });
        console.log('--- LATEST BOOKING RAW ---');
        console.log(JSON.stringify(booking, null, 2));
        
        // Count all bookings
        const count = await Booking.countDocuments();
        console.log(`Total Bookings in DB: ${count}`);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};
checkRawBooking();
