
const mongoose = require('mongoose');
const Room = require('./models/Room');

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const Q1_ID = '696b653f88872bdaa4d9d2d8';
const Q3_ID = '696b653f88872bdaa4d9d2d9';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Room 101, 102, 103 -> Q1
    await Room.updateMany(
        { name: { $in: ['Room 101', 'Room 102', 'Room 103'] } },
        { $set: { branchId: Q1_ID } }
    );
    console.log('Assigned Rooms 101-103 to Q1');

    // VIP, Couple, fdsf -> Q3
    await Room.updateMany(
        { name: { $nin: ['Room 101', 'Room 102', 'Room 103'] } },
        { $set: { branchId: Q3_ID } }
    );
    console.log('Assigned Others to Q3');

    // Verify
    const rooms = await Room.find({});
    rooms.forEach(r => console.log(`${r.name}: ${r.branchId}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
