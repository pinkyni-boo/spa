
const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const Branch = require('../models/Branch');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        
        console.log('--- BRANCH AUDIT ---');
        const branches = await Branch.find({});
        
        for (const branch of branches) {
            console.log(`\nBRANCH: ${branch.name} (${branch._id})`);
            const staff = await Staff.find({ branchId: branch._id });
            
            if (staff.length === 0) {
                console.log('  No staff found.');
            } else {
                staff.forEach(s => {
                    const shift = s.shifts[0];
                    const endTime = shift ? shift.endTime : 'N/A';
                    console.log(`  - ${s.name} (Active: ${s.isActive}) | First Shift End: ${endTime}`);
                });
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
run();
