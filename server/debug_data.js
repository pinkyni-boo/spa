const mongoose = require('mongoose');
const Service = require('./models/Service');
const Room = require('./models/Room');
const path = require('path');

const run = async () => {
    try {
        const MONGO_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const services = await Service.find({}).sort({ name: 1 });
        console.log('\n--- SERVICES (Name | Type | RequiredRoomType) ---');
        services.forEach(s => {
            console.log(`[${s.name}] Type: ${s.type} | ReqRoom: ${s.requiredRoomType} | ID: ${s._id}`);
        });

        const rooms = await Room.find({}).sort({ name: 1 });
        console.log('\n--- ROOMS (Name | Type | BranchID) ---');
        rooms.forEach(r => {
            console.log(`[${r.name}] Type: ${r.type} | Branch: ${r.branchId} | ID: ${r._id}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
