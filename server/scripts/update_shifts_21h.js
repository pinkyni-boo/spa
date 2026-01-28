const mongoose = require('mongoose');
const Staff = require('../models/Staff');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Updating all staff shifts to 21:00...');

        const result = await Staff.updateMany(
            { isActive: true },
            {
                $set: {
                    'shifts.$[].endTime': '21:00'
                }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} staff members`);
        
        // Verify
        const staff = await Staff.find({ isActive: true });
        console.log('\n--- VERIFICATION ---');
        staff.forEach(s => {
            const shift = s.shifts[0];
            console.log(`${s.name}: ${shift?.startTime} - ${shift?.endTime}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
run();
