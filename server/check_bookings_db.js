const mongoose = require('mongoose');
const Booking = require('./models/Booking');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const checkBookings = async () => {
    await connectDB();
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
    console.log('--- LATEST 5 BOOKINGS ---');
    bookings.forEach(b => {
        console.log(`- Customer: ${b.customerName} | Phone: ${b.phone} | Date: ${b.startTime} | Source: ${b.source}`);
    });
    process.exit();
};

checkBookings();
