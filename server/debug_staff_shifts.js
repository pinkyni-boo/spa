const mongoose = require('mongoose');
const Staff = require('./models/Staff');

const MONGO_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const checkShifts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const staffList = await Staff.find({});
    console.log(`Found ${staffList.length} staff members.`);

    staffList.forEach(s => {
      console.log(`\n👤 Staff: ${s.name} (${s.branchId})`);
      if (s.shifts && s.shifts.length > 0) {
        s.shifts.forEach(shift => {
             console.log(`   - Day ${shift.dayOfWeek}: ${shift.startTime} - ${shift.endTime}`);
        });
      } else {
        console.log('   ⚠️ No shifts defined.');
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkShifts();
