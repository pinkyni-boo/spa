
const mongoose = require('mongoose');
const Staff = require('./models/Staff');

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const Q1_ID = '696b653f88872bdaa4d9d2d8';
const Q3_ID = '696b653f88872bdaa4d9d2d9';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Assign Lan, Hue to Q1
    await Staff.updateMany(
        { _id: { $in: ['6960e26e048a4a7457735e07', '6960e26e048a4a7457735e08'] } },
        { $set: { branchId: Q1_ID } }
    );
    console.log('Assigned Lan and Hue to Q1');

    // Assign Cuc, Mai to Q3
    await Staff.updateMany(
        { _id: { $in: ['6960e26e048a4a7457735e0a', '6960e26e048a4a7457735e09'] } },
        { $set: { branchId: Q3_ID } }
    );
    console.log('Assigned Cuc and Mai to Q3');

    // Verify
    const staff = await Staff.find({});
    staff.forEach(s => console.log(`${s.name}: ${s.branchId}`));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
