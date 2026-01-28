const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const Branch = require('../models/Branch');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        
        // Get Bình Thạnh branch
        const binhThanh = await Branch.findOne({ name: /Bình Thạnh/ });
        if (!binhThanh) {
            console.log('Bình Thạnh branch not found. Creating...');
            // Create if doesn't exist
            const newBranch = await Branch.create({
                name: 'MIU SPA - Bình Thạnh',
                address: '789 Điện Biên Phủ, Phường 1, Bình Thạnh',
                phone: '0333333333'
            });
            console.log(`Created branch: ${newBranch.name}`);
            return;
        }

        console.log(`Found branch: ${binhThanh.name} (${binhThanh._id})`);

        // Check existing staff
        const existingStaff = await Staff.find({ branchId: binhThanh._id });
        console.log(`Existing staff in Bình Thạnh: ${existingStaff.length}`);

        if (existingStaff.length === 0) {
            console.log('Creating 2 staff members for Bình Thạnh...');
            
            const defaultShifts = [];
            for (let day = 1; day <= 6; day++) {
                defaultShifts.push({
                    dayOfWeek: day,
                    startTime: '09:00',
                    endTime: '21:00',
                    isOff: false
                });
            }
            defaultShifts.push({
                dayOfWeek: 0, // Sunday
                startTime: '09:00',
                endTime: '21:00',
                isOff: true
            });

            await Staff.insertMany([
                {
                    name: 'KTV Hồng',
                    branchId: binhThanh._id,
                    isActive: true,
                    skills: ['Massage Body Thụy Điển', 'Gội đầu dưỡng sinh', 'Chăm sóc da mặt chuyên sâu'],
                    shifts: defaultShifts
                },
                {
                    name: 'KTV Tuyết',
                    branchId: binhThanh._id,
                    isActive: true,
                    skills: ['Massage Body Thụy Điển', 'Gội đầu dưỡng sinh', 'Chăm sóc da mặt chuyên sâu'],
                    shifts: defaultShifts
                }
            ]);

            console.log('✅ Created 2 staff members for Bình Thạnh');
        } else {
            console.log('Staff already exist in Bình Thạnh');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
run();
