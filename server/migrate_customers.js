const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Customer = require('./models/Customer');

mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
  .then(async () => {
    console.log('✅ Connected DB');
    
    // 1. Get All Bookings
    const bookings = await Booking.find({});
    console.log(`Found ${bookings.length} bookings to process.`);

    let createdCount = 0;
    let updatedCount = 0;

    // 2. Process each booking
    for (const b of bookings) {
        if (!b.phone) continue;

        let customer = await Customer.findOne({ phone: b.phone });
        
        // Calculate amount (approx if missing)
        // If finalPrice is set, use it. usage else 0
        const amount = b.finalPrice || 0; 
        // Note: For real accuracy we should sum invoices, but for migration from booking we guess
        
        if (!customer) {
            customer = new Customer({
                phone: b.phone,
                name: b.customerName,
                totalVisits: 1,
                totalSpent: amount,
                lastVisit: b.startTime,
                loyaltyPoints: Math.floor(amount / 100000)
            });
            createdCount++;
        } else {
            customer.totalVisits += 1;
            customer.totalSpent += amount;
            if (new Date(b.startTime) > new Date(customer.lastVisit)) {
                customer.lastVisit = b.startTime;
            }
            customer.loyaltyPoints += Math.floor(amount / 100000);
            updatedCount++;
        }
        await customer.save();
    }

    console.log(`✅ MIGRATION COMPLETE:`);
    console.log(`- Created New Customers: ${createdCount}`);
    console.log(`- Updated Existing Customers: ${updatedCount}`);
    
    process.exit();
  })
  .catch(err => console.error(err));
