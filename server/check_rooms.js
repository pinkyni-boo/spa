
const mongoose = require('mongoose');
const Room = require('./models/Room');

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('--- ROOMS ---');
    const rooms = await Room.find({});
    rooms.forEach(r => {
      console.log(`- ${r.name} (${r._id}): BranchId: ${r.branchId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
