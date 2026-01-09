const mongoose = require('mongoose');
const Staff = require('./models/Staff');
const Booking = require('./models/Booking');
const Service = require('./models/Service');

// Connect to DB
mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
  .then(async () => {
    console.log('--- DEBUG INFO ---');
    
    // 1. Check Staff
    const allStaff = await Staff.find({});
    console.log(`Total Staff in DB: ${allStaff.length}`);
    const activeStaff = await Staff.countDocuments({ isActive: true });
    console.log(`Active Staff: ${activeStaff}`);
    console.log('Staff List:', allStaff.map(s => `${s.name} (${s.isActive ? 'Active' : 'Inactive'})`));

    // 2. Check Services
    const services = await Service.find({});
    console.log(`Total Services: ${services.length}`);
    console.log('Services:', services.map(s => s.name));

    // 3. Check Bookings
    const bookings = await Booking.find({});
    console.log(`Total Bookings: ${bookings.length}`);
    
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
