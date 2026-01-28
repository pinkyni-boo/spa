
const mongoose = require('mongoose');
const Staff = require('../models/Staff');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    await mongoose.connect(MONGODB_URI);
    
    // Activate KTV Cúc
    await Staff.updateOne({ name: 'KTV Cúc' }, { isActive: true });
    console.log('Activated KTV Cúc');
    
    await mongoose.disconnect();
};
run();
