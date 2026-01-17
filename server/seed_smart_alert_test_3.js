
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Service = require('./models/Service');
const Waitlist = require('./models/Waitlist');
const Room = require('./models/Room');
const dayjs = require('dayjs');

const MONGO_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find Service (CRITICAL: Use exact name)
    let service = await Service.findOne({ name: 'Massage Body Thụy Điển' });
    if (!service) {
        console.log('⚠️ Service not found, using first available service...');
        service = await Service.findOne();
    }
    
    console.log('📋 Using Service:', service.name);

    // 2. Get Room
    const room = await Room.findOne();
    if (!room) {
        console.log('❌ No rooms found.');
        process.exit(1);
    }

    // 3. Define Time (17:00 - 18:00 TODAY)
    const today = dayjs().format('YYYY-MM-DD');
    const startTime = dayjs(`${today} 17:00`).toDate();
    const endTime = dayjs(`${today} 18:00`).toDate();

    console.log(`📅 Creating booking for: ${dayjs(startTime).format('HH:mm DD/MM/YYYY')}`);

    // 4. Create Waitlist Item (MUST match service name EXACTLY)
    console.log('Creating Waitlist Item...');
    const waitlistItem = await Waitlist.create({
        customerName: 'Nguyễn Văn Test',
        phone: '0912345678',
        serviceName: service.name, // EXACT match
        preferredTime: '17:00', 
        status: 'waiting',
        note: 'TEST SMART ALERT - Hủy đơn 17:00 để thấy thông báo'
    });
    console.log('✅ Waitlist created:', waitlistItem);

    // 5. Create Conflicting Booking
    console.log('Creating Conflicting Booking...');
    const booking = await Booking.create({
        customerName: 'Trần Thị Giữ Chỗ',
        phone: '0987654321',
        serviceId: service._id,
        roomId: room._id,
        startTime: startTime,
        endTime: endTime,
        status: 'confirmed',
        source: 'offline',
        note: '🎯 HỦY ĐỔN NÀY ĐỂ TEST THÔNG BÁO!'
    });
    console.log('✅ Booking created:', booking);

    console.log('\n🎉 SEED SUCCESS!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 HƯỚNG DẪN TEST:');
    console.log('1. F5 trang Admin');
    console.log('2. Click vào đơn "Trần Thị Giữ Chỗ" lúc 17:00');
    console.log('3. Bấm nút "HỦY ĐƠN"');
    console.log('4. 🎉 Chờ thông báo góc phải màn hình:');
    console.log(`   "Tìm thấy 1 khách hàng phù hợp!"`);
    console.log(`   • Nguyễn Văn Test - 0912345678 (Mong: 17:00)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedData();
