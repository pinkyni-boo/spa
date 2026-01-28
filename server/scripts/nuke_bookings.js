
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    await mongoose.connect(MONGODB_URI);
    
    // Clear ALL bookings to be safe
    await Booking.deleteMany({});
    console.log('Cleared ALL bookings.');
    
    await mongoose.disconnect();
};
run();
