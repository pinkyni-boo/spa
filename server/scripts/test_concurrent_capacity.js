const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Branch = require('../models/Branch');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const run = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Get branch Q3
        const branch = await Branch.findOne({ name: /Quận 3/ });
        if (!branch) throw new Error('Branch not found');
        console.log(`Testing with Branch: ${branch.name} (${branch._id})`);

        // Get Gội đầu service
        const service = await Service.findOne({ name: /Gội đầu/ });
        if (!service) throw new Error('Service not found');
        console.log(`Service: ${service.name} (Duration: ${service.duration}m, Room: ${service.requiredRoomType})\n`);

        // Clear previous test bookings for tomorrow
        const testDate = '2026-01-29';
        const startOfDay = new Date(`${testDate}T00:00:00.000Z`);
        const endOfDay = new Date(`${testDate}T23:59:59.999Z`);
        
        await Booking.deleteMany({ 
            startTime: { $gte: startOfDay, $lte: endOfDay },
            customerName: { $regex: /^Test/ }
        });
        console.log(`Cleared test bookings for ${testDate}\n`);

        // Simulate 3 concurrent bookings
        const axios = require('axios');
        const API = 'http://localhost:3000/api/bookings';

        const bookingPayload = {
            customerName: 'Test Customer',
            phone: '0000000000',
            serviceName: service.name,
            date: testDate,
            time: '13:00',
            branchId: branch._id
        };

        console.log('=== SIMULATING 3 CONCURRENT REQUESTS ===\n');

        // Fire 3 requests almost simultaneously
        const requests = [
            axios.post(API, { ...bookingPayload, customerName: 'Test 1', phone: '0001' }),
            axios.post(API, { ...bookingPayload, customerName: 'Test 2', phone: '0002' }),
            axios.post(API, { ...bookingPayload, customerName: 'Test 3', phone: '0003' })
        ];

        const results = await Promise.allSettled(requests);

        console.log('\n=== RESULTS ===');
        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                console.log(`Request ${i + 1}: ✅ ${result.value.data.message}`);
            } else {
                console.log(`Request ${i + 1}: ❌ ${result.reason.response?.data?.message || result.reason.message}`);
            }
        });

        // Check DB
        const finalCount = await Booking.countDocuments({ 
            startTime: { $gte: startOfDay, $lte: endOfDay },
            customerName: { $regex: /^Test/ }
        });
        console.log(`\nFinal DB count: ${finalCount} (Expected: 2 for capacity=2)`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
