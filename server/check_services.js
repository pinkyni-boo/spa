
const mongoose = require('mongoose');
const Service = require('./models/Service');

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const services = await Service.find({});
    console.log(`Found ${services.length} services.`);

    services.forEach(s => {
      console.log(`- ${s.name}: ${s.duration} mins`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
