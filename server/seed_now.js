const mongoose = require('mongoose');
const Service = require('./models/Service');
const Staff = require('./models/Staff');
const sampleServices = require('./data/services.json');
const sampleStaff = require('./data/staff.json');

mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
  .then(async () => {
    console.log('--- FORCING SEED DATA ---');

    console.log('1. Clearing old data...');
    await Service.deleteMany({});
    await Staff.deleteMany({});

    console.log('2. Inserting Services...');
    await Service.insertMany(sampleServices);

    console.log('3. Inserting Staff...');
    await Staff.insertMany(sampleStaff);

    console.log('✅ SEED COMPLETED!');
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
