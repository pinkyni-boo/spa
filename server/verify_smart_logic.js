const mongoose = require('mongoose');
const Staff = require('./models/Staff');
const Service = require('./models/Service');
const Room = require('./models/Room');
const axios = require('axios'); // Standard fetch in Node
const dayjs = require('dayjs');

// Config
const TEST_SERVICE_NAME = "Massage Body Thụy Điển";
const API_URL = 'http://localhost:3000/api';

// 1. SETUP DATA (Direct DB Access)
const setupData = async () => {
    try {
        await mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project');
        console.log('✅ Connected DB for Setup');

        // A. Ensure Service Exists
        let service = await Service.findOne({ name: TEST_SERVICE_NAME });
        if (!service) {
            service = await Service.create({ name: TEST_SERVICE_NAME, price: 500000, duration: 60 });
            console.log('Created Service:', service.name);
        }

        // B. Update Staff (Force one staff to have Skill & Shift)
        const staff = await Staff.findOne();
        if (staff) {
            staff.skills = [TEST_SERVICE_NAME, "Gội đầu dưỡng sinh"];
            // Shift Full Week 9-18h
            staff.shifts = [0,1,2,3,4,5,6].map(d => ({
                dayOfWeek: d,
                startTime: "09:00",
                endTime: "18:00",
                isOff: false
            }));
            await staff.save();
            console.log(`✅ Updated Staff "${staff.name}" with Skill & Shifts`);
        } else {
            console.error('❌ No Staff found to update!');
        }

        // C. Check Room
        const roomCount = await Room.countDocuments({ isActive: true });
        console.log(`ℹ️ Active Rooms: ${roomCount}`);

    } catch (e) {
        console.error('Setup Error:', e);
    } finally {
        await mongoose.disconnect();
    }
};

// 2. CALL API CHECK
const testApi = async () => {
    try {
        const today = dayjs().format('YYYY-MM-DD');
        console.log(`\n📡 Calling API checkAvailability for ${today}...`);
        
        const res = await axios.post(`${API_URL}/bookings/check-slot`, {
            date: today,
            serviceName: TEST_SERVICE_NAME
        });

        console.log('--- API RESULT ---');
        console.log('Success:', res.data.success);
        console.log('Available Slots:', res.data.availableSlots.length);
        console.log('Slots:', res.data.availableSlots.join(', '));
        console.log('Debug Info:', res.data.debug);

    } catch (error) {
        console.error('❌ API Fail:', error.response ? error.response.data : error.message);
    }
};

// RUN
(async () => {
    await setupData();
    // Wait a bit for server to pick up changes if any cache (not likely but good practice)
    setTimeout(testApi, 1000); 
})();
