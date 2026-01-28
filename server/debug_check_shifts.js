
const mongoose = require('mongoose');
const Staff = require('./models/Staff');

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const staffMembers = await Staff.find({});
    console.log(`Found ${staffMembers.length} staff members.`);

    staffMembers.forEach(s => {
      console.log(`\nStaff: ${s.name} (${s._id})`);
      if (s.shifts && s.shifts.length > 0) {
        s.shifts.forEach(shift => {
            console.log(`  - Day ${shift.dayOfWeek}: ${shift.startTime} - ${shift.endTime}`);
        });
      } else {
        console.log('  - No shifts defined');
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
