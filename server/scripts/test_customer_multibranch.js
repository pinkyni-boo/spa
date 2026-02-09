const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Branch = require('../models/Branch');

// Connect to MongoDB
mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
    .then(() => console.log('✅ Connected to DB'))
    .catch(err => console.error(err));

async function testVisibility() {
    try {
        console.log('--- STARTING MULTI-BRANCH VISIBILITY TEST ---');

        // 0. Setup Dummy Data
        const phone = '0999888777'; // Test User
        const customerName = 'Test MultiBranch';
        
        // Mock Branch IDs (assuming these exist or we use random ones for the query test)
        // We don't strictly need real branches for the Booking query to work, just matching IDs
        const branchA = new mongoose.Types.ObjectId();
        const branchB = new mongoose.Types.ObjectId();
        const branchC = new mongoose.Types.ObjectId();

        console.log(`Branch A: ${branchA}`);
        console.log(`Branch B: ${branchB}`);
        console.log(`Branch C: ${branchC} (No bookings here)`);

        // 1. Create Booking at Branch A
        await Booking.create({
            branchId: branchA,
            customerName,
            phone,
            startTime: new Date(),
            endTime: new Date(Date.now() + 3600000), // +1 hour
            status: 'completed',
            serviceId: new mongoose.Types.ObjectId(), // Fake
            staffId: new mongoose.Types.ObjectId() // Fake
        });
        console.log(`✅ Created Booking for ${phone} at Branch A`);

        // 2. Create Booking at Branch B
        await Booking.create({
            branchId: branchB,
            customerName,
            phone,
            startTime: new Date(),
            endTime: new Date(Date.now() + 3600000), // +1 hour
            status: 'completed',
            serviceId: new mongoose.Types.ObjectId(),
            staffId: new mongoose.Types.ObjectId()
        });
        console.log(`✅ Created Booking for ${phone} at Branch B`);

        // 3. Simulate Admin A View (Filter by Branch A)
        console.log('\n--- Simulating Admin A View ---');
        const resultsA = await Booking.find({ branchId: branchA }).select('phone customerName');
        const foundA = resultsA.some(b => b.phone === phone);
        console.log(`Admin A sees customer? ${foundA ? 'YES ✅' : 'NO ❌'}`);

        // 4. Simulate Admin B View (Filter by Branch B)
        console.log('\n--- Simulating Admin B View ---');
        const resultsB = await Booking.find({ branchId: branchB }).select('phone customerName');
        const foundB = resultsB.some(b => b.phone === phone);
        console.log(`Admin B sees customer? ${foundB ? 'YES ✅' : 'NO ❌'}`);

        // 5. Simulate Admin C View (Filter by Branch C)
        console.log('\n--- Simulating Admin C View ---');
        const resultsC = await Booking.find({ branchId: branchC }).select('phone customerName');
        const foundC = resultsC.some(b => b.phone === phone);
        console.log(`Admin C sees customer? ${foundC ? 'YES ❌' : 'NO ✅ (Correct)'}`);

        // Cleanup
        await Booking.deleteMany({ phone: '0999888777' });
        console.log('\nCleaned up test data.');

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

testVisibility();
