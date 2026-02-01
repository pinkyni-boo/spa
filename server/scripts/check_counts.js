const mongoose = require('mongoose');
require('dotenv').config();
const Gallery = require('../models/Gallery');
const Feedback = require('../models/Feedback');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/spa_db');
        console.log('MongoDB Connected');
        
        const galleryCount = await Gallery.countDocuments();
        const feedbackCount = await Feedback.countDocuments();
        
        console.log(`Gallery Items: ${galleryCount}`);
        console.log(`Feedback Items: ${feedbackCount}`);
        
        const galleryItems = await Gallery.find({});
        console.log('Gallery Items:', JSON.stringify(galleryItems, null, 2));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
