const mongoose = require('mongoose');
const Staff = require('./models/Staff');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const updateShifts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const result = await Staff.updateMany(
      {},
      {
        $set: {
          "shifts.$[].endTime": "20:00"
        }
      }
    );

    console.log(`✅ Updated shifts for ${result.modifiedCount} staff members.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateShifts();
