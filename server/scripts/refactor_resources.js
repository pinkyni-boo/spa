
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Service = require('../models/Service');
const Branch = require('../models/Branch');

require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB...');

    // 1. DELETE OLD ROOMS
    console.log('Deleting old rooms...');
    await Room.deleteMany({});

    // 2. CREATE NEW MULTI-BED ROOMS PER BRANCH
    const branches = await Branch.find({});
    console.log(`Found ${branches.length} branches. Creating rooms...`);

    const roomData = [];

    for (const branch of branches) {
        roomData.push({
            name: `Phòng Gội (${branch.name})`,
            branchId: branch._id,
            type: 'HEAD_SPA',
            capacity: 2,
            description: 'Phòng gội đầu dưỡng sinh, sức chứa 2 khách.',
            isActive: true
        });

        roomData.push({
            name: `Phòng Body (${branch.name})`,
            branchId: branch._id,
            type: 'BODY_SPA',
            capacity: 6,
            description: 'Phòng Massage Body/Face, sức chứa 6 khách.',
            isActive: true
        });
    }

    await Room.insertMany(roomData);
    console.log(`Created ${roomData.length} new multi-bed rooms.`);

    // 3. UPDATE SERVICES
    console.log('Updating Services...');
    
    // Head Spa Services
    await Service.updateMany(
        { name: { $regex: /Gội|Tóc/i } }, 
        { $set: { requiredRoomType: 'HEAD_SPA' } }
    );

    // Body/Face Services
    await Service.updateMany(
        { name: { $not: { $regex: /Gội|Tóc/i } }, type: 'service' }, 
        { $set: { requiredRoomType: 'BODY_SPA' } }
    );

    console.log('Services updated.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
