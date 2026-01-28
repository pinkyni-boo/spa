
const mongoose = require('mongoose');
const Branch = require('./models/Branch');

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const branches = await Branch.find({});
    console.log('Branches:', branches);
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
