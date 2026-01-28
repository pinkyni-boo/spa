
const mongoose = require('mongoose');
const Service = require('./models/Service');
const Staff = require('./models/Staff');

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('--- SERVICES ---');
    const services = await Service.find({});
    services.forEach(s => {
      console.log(`- ${s.name}: Duration ${s.duration}m, Break ${s.breakTime}m`);
    });

    console.log('\n--- STAFF ---');
    const staff = await Staff.find({});
    staff.forEach(s => {
      console.log(`- ${s.name} (${s._id}): BranchId: ${s.branchId}`);
      // Check shift end again
       if (s.shifts && s.shifts.length > 0) {
           console.log(`   Shift End: ${s.shifts[0].endTime}`);
       }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
