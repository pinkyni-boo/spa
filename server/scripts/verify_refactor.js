
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Branch = require('../models/Branch');
const Staff = require('../models/Staff');
const Room = require('../models/Room');
const BookingController = require('../controllers/BookingController');
const dayjs = require('dayjs');

require('dotenv').config();
const MONGODB_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

// Mock Response
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const run = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected DB');

    // 1. Setup Data
    const branch = await Branch.findOne({});
    const headService = await Service.findOne({ requiredRoomType: 'HEAD_SPA' });
    const staff = await Staff.findOne({ branchId: branch._id }); // Any staff

    if (!headService || !branch) {
        console.error('Missing data');
        return;
    }

    console.log(`Testing with Service: ${headService.name} (Type: ${headService.requiredRoomType})`);
    console.log(`Branch: ${branch.name}`);

    const date = dayjs().add(2, 'day').format('YYYY-MM-DD'); 
    const time = '10:00';

    // Clear bookings for this time
    const startOfDay = dayjs(date).startOf('day').toDate();
    const endOfDay = dayjs(date).endOf('day').toDate();
    await Booking.deleteMany({ startTime: { $gte: startOfDay, $lte: endOfDay } });
    console.log('Cleared bookings for', date);

    // 2. Book Slot 1
    console.log('\n--- Booking Slot 1 ---');
    let req1 = {
        body: {
            customerName: 'Test 1', phone: '0001',
            serviceName: headService.name, date, time, branchId: branch._id
        }
    };
    let res1 = mockRes();
    await BookingController.createBooking(req1, res1);
    console.log('Result 1:', res1.data || res1.statusCode);
    console.log('DB Count:', await Booking.countDocuments({ date: { $regex: date } }));

    // 3. Book Slot 2
    console.log('\n--- Booking Slot 2 ---');
    let req2 = {
        body: {
            customerName: 'Test 2', phone: '0002',
            serviceName: headService.name, date, time, branchId: branch._id
        }
    };
    let res2 = mockRes();
    await BookingController.createBooking(req2, res2);
    console.log('Result 2:', res2.data || res2.statusCode);
    console.log('DB Count:', await Booking.countDocuments({ date: { $regex: date } }));

    // 4. Book Slot 3 (Should Fail if Capacity is 2)

    // 4. Book Slot 3 (Should Fail if Capacity is 2)
    console.log('\n--- Booking Slot 3 (Expect Fail) ---');
    let req3 = {
        body: {
            customerName: 'Test 3', phone: '0003',
            serviceName: headService.name, date, time, branchId: branch._id
        }
    };
    let res3 = mockRes();
    await BookingController.createBooking(req3, res3);
    console.log('Result 3 (Should be 409):', res3.data || res3.statusCode);
    if (res3.data?.message) console.log('Message:', res3.data.message);


    // 5. Check Availability API
    console.log('\n--- Checking Availability 10:00 ---');
    let reqAvail = {
        body: { date, serviceName: headService.name, branchId: branch._id }
    };
    let resAvail = mockRes();
    await BookingController.checkAvailability(reqAvail, resAvail);
    const slots = resAvail.data?.availableSlots || [];
    console.log(`Is 10:00 available? ${slots.includes('10:00')}`);
    console.log('Slots:', slots.slice(0, 5)); // Show first few

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
