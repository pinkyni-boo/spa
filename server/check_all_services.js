
const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const services = await Service.find({}); // Get ALL
        
        console.log(`Found ${services.length} services/products.`);
        services.forEach(s => {
            console.log(`- ${s.name} | Type: ${s.type} | Room: ${s.requiredRoomType} | Dur: ${s.duration}m | Break: ${s.breakTime || 0}m`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};
run();
