const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');

mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
  .then(async () => {
    console.log('✅ Connected DB');
    
    const bookingCount = await Booking.countDocuments();
    const customerCount = await Customer.countDocuments();
    
    console.log(`📊 STATS:`);
    console.log(`- Bookings: ${bookingCount}`);
    console.log(`- Customers: ${customerCount}`);
    
    if (customerCount === 0 && bookingCount > 0) {
        console.log("⚠️ WARNING: No customers found in CRM, but Bookings exist. Need Migration!");
    } else if (customerCount > 0) {
        const sample = await Customer.findOne();
        console.log("Sample Customer:", sample);
    }

    process.exit();
  })
  .catch(err => console.error(err));
