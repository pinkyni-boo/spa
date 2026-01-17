
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
    if (!service) {
        console.log('⚠️ Service not found, creating mock service...');
        service = await Service.create({
            name: 'Massage Body Thụy Điển',
            price: 500000,
            duration: 60,
            category: 'Body'
        });
    }

    // 2. Get Room
    const room = await Room.findOne();
    if (!room) {
        console.log('❌ No rooms found. Cannot create booking.');
        process.exit(1);
    }

    // 3. Define Time (Today 14:00 - 15:00)
    // Using 14:00 as it's a typical robust test time
    const today = dayjs().format('YYYY-MM-DD');
    const startTime = dayjs(`${today} 14:00`).toDate();
    const endTime = dayjs(`${today} 15:00`).toDate();

    // 4. Create Waitlist Item (Matches Service & Preferred Time)
    console.log('Creating Waitlist Item...');
    await Waitlist.create({
        customerName: 'Khách Test Hàng Chờ',
        phone: '0999888777',
        serviceName: service.name,
        preferredTime: '14:00', // Matches booking start time
        status: 'waiting',
        note: 'Test Smart Alert'
    });

    // 5. Create Conflicting Booking
    console.log('Creating Conflicting Booking...');
    await Booking.create({
        customerName: 'Khách Đang Giữ Chỗ',
        phone: '0123456789',
        serviceId: service._id,
        roomId: room._id,
        startTime: startTime,
        endTime: endTime,
        status: 'confirmed',
        source: 'offline',
        note: 'Hủy đơn này để test thông báo!'
    });

    console.log('🎉 Seed Data Success!');
    console.log('------------------------------------------------');
    console.log('TEST CASE READY:');
    console.log('1. Open Booking Manager');
    console.log(`2. Find booking at 14:00 today (${today}) named "Khách Đang Giữ Chỗ"`);
    console.log('3. CANCEL this booking');
    console.log('4. Expect Notification finding "Khách Test Hàng Chờ"');
    console.log('------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
