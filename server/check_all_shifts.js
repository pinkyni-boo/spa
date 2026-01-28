
const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const Branch = require('../models/Branch');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        
        console.log('--- CHECKING STAFF SHIFTS ---');
        const staffList = await Staff.find({ isActive: true }).populate('branchId');
        
        let count18 = 0;
        let count20 = 0;

        for (const staff of staffList) {
            // Check first shift (assuming Monday/Tuesday usually same)
            const shift = staff.shifts[0]; 
            if (!shift) continue;

            const branchName = staff.branchId ? staff.branchId.name : 'NO BRANCH';
            console.log(`[${branchName}] ${staff.name}: ${shift.startTime} - ${shift.endTime}`);

            if (shift.endTime === '18:00') count18++;
            if (shift.endTime === '20:00') count20++;
        }

        console.log('-----------------------------');
        console.log(`Total 18:00: ${count18}`);
        console.log(`Total 20:00: ${count20}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
run();
