
const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const services = await Service.find({ type: 'service' }); // Only check actual services, not products
        
        console.log('--- SERVICE ROOM ASSIGNMENTS ---');
        services.forEach(s => {
            console.log(`[${s.requiredRoomType}] ${s.name}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
run();
