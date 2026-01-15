const mongoose = require('mongoose');
const Service = require('./models/Service');
require('dotenv').config(); 

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/spa_db";

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB for migration...");
        
        // 1. Update docs missing 'type'
        const res1 = await Service.updateMany(
            { type: { $exists: false } }, 
            { $set: { type: 'service' } }
        );
        console.log(`Matched (Missing Type): ${res1.matchedCount}, Modified: ${res1.modifiedCount}`);

        // 2. Update docs where type is null or empty
        const res2 = await Service.updateMany(
            { $or: [{ type: null }, { type: '' }] }, 
            { $set: { type: 'service' } }
        );
        console.log(`Matched (Null/Empty Type): ${res2.matchedCount}, Modified: ${res2.modifiedCount}`);

        console.log("Migration Complete. All legacy items are now 'service'.");

    } catch (e) {
        console.error("Migration Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
