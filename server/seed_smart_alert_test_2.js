
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Service = require('./models/Service');
const Waitlist = require('./models/Waitlist');
const Room = require('./models/Room');
const dayjs = require('dayjs');

// Config
const MONGO_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Get Service
    let service = await Service.findOne({ name: 'Massage Body Thụy Điển' });
    
    // 2. Get Room
    const room = await Room.findOne();
    if (!room) {
        console.log('❌ No rooms found.');
        process.exit(1);
    }

    // 3. Define Time (Fresh time: 15:00 - 16:00)
    const today = dayjs().format('YYYY-MM-DD');
    const startTime = dayjs(`${today} 15:00`).toDate();
    const endTime = dayjs(`${today} 16:00`).toDate();

    // 4. Create Waitlist Item
    console.log('Creating Waitlist Item...');
    await Waitlist.create({
        customerName: 'Khách Test Hàng Chờ 2',
        phone: '0999888222',
        serviceName: service.name,
        preferredTime: '15:00', 
        status: 'waiting',
        note: 'Test Smart Alert 2'
    });

    // 5. Create Conflicting Booking
    console.log('Creating Conflicting Booking...');
    await Booking.create({
        customerName: 'Khách Đang Giữ Chỗ 2',
        phone: '0123456222',
        serviceId: service._id,
        roomId: room._id,
        startTime: startTime,
        endTime: endTime,
        status: 'confirmed',
        source: 'offline',
        note: 'Hủy đơn này để test thông báo!'
    });

    console.log('🎉 Seed Data Success!');
    console.log('TEST CASE READY: (15:00 Today)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
