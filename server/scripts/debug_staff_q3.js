
const mongoose = require('mongoose');
const Staff = require('../models/Staff');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    await mongoose.connect(MONGODB_URI);
    const Q3_ID = '696b653f88872bdaa4d9d2d9'; // From logs
    
    console.log(`Checking staff for Q3: ${Q3_ID}`);
    const staff = await Staff.find({ branchId: Q3_ID });
    console.log(`Found ${staff.length} staff.`);
    staff.forEach(s => {
        console.log(`- ${s.name} (Active: ${s.isActive})`);
        console.log('Shifts:', s.shifts);
    });
    
    await mongoose.disconnect();
};
run();
