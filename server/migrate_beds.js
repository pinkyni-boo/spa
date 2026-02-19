/**
 * MIGRATION: Create Beds from Room Capacity + Assign bedId to existing Bookings
 * 
 * Run: node migrate_beds.js
 * 
 * Steps:
 *  1. For each Room, create Bed documents (count = room.capacity)
 *  2. For each existing Booking (non-cancelled), assign a bedId:
 *     - Sort bookings by startTime
 *     - For each booking, find the first bed in its room that isn't occupied at that time
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');
const Bed = require('./models/Bed');
const Booking = require('./models/Booking');
const dayjs = require('dayjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // -------------------------------------------------------
    // STEP 1: Create beds for all rooms
    // -------------------------------------------------------
    const rooms = await Room.find({});
    console.log(`Found ${rooms.length} rooms\n`);

    const bedByRoomAndIndex = {}; // roomId -> [bed1, bed2, ...]

    for (const room of rooms) {
        const existing = await Bed.find({ roomId: room._id });
        if (existing.length > 0) {
            console.log(`  Room "${room.name}": already has ${existing.length} beds — skipping creation`);
            bedByRoomAndIndex[room._id.toString()] = existing;
            continue;
        }

        const capacity = room.capacity || 1;
        const beds = [];
        for (let i = 1; i <= capacity; i++) {
            const bed = await Bed.create({
                name: `Giường ${i}`,
                roomId: room._id,
                branchId: room.branchId,
                sortOrder: i
            });
            beds.push(bed);
        }
        bedByRoomAndIndex[room._id.toString()] = beds;
        console.log(`  Room "${room.name}" (capacity ${capacity}): created ${beds.length} beds`);
    }

    // -------------------------------------------------------
    // STEP 2: Assign bedId to existing bookings
    // -------------------------------------------------------
    console.log('\n--- Assigning bedId to existing bookings ---');

    const bookings = await Booking.find({ 
        status: { $ne: 'cancelled' },
        roomId: { $ne: null },
        bedId: null   // Only bookings without a bed yet
    }).sort({ startTime: 1 });

    console.log(`Found ${bookings.length} bookings to process\n`);

    let assigned = 0;
    let skipped = 0;

    // Track which beds are occupied per booking assignment (in-memory)
    // Structure: bedId -> [ { start, end } ]
    const bedOccupied = {}; 

    for (const booking of bookings) {
        const roomId = booking.roomId.toString();
        const beds = bedByRoomAndIndex[roomId];

        if (!beds || beds.length === 0) {
            console.log(`  ⚠️  Booking ${booking._id}: no beds found for room ${roomId}`);
            skipped++;
            continue;
        }

        const bStart = dayjs(booking.startTime);
        const bEnd = dayjs(booking.endTime).add(booking.bufferTime || 0, 'minute');

        // Find first available bed
        let pickedBed = null;
        for (const bed of beds) {
            const bedIdStr = bed._id.toString();
            const slots = bedOccupied[bedIdStr] || [];
            const conflict = slots.some(s => bStart.isBefore(s.end) && bEnd.isAfter(s.start));
            if (!conflict) {
                pickedBed = bed;
                if (!bedOccupied[bedIdStr]) bedOccupied[bedIdStr] = [];
                bedOccupied[bedIdStr].push({ start: bStart, end: bEnd });
                break;
            }
        }

        if (pickedBed) {
            await Booking.updateOne({ _id: booking._id }, { $set: { bedId: pickedBed._id } });
            console.log(`  ✅ Booking ${booking._id} (${bStart.format('YYYY-MM-DD HH:mm')}) → ${pickedBed.name}`);
            assigned++;
        } else {
            console.log(`  ❌ Booking ${booking._id}: all beds occupied at ${bStart.format('HH:mm')} — assigning bed 1 as fallback`);
            await Booking.updateOne({ _id: booking._id }, { $set: { bedId: beds[0]._id } });
            assigned++;
        }
    }

    console.log(`\n=== DONE ===`);
    console.log(`Beds created/verified, Bookings assigned: ${assigned}, Skipped: ${skipped}`);
    await mongoose.connection.close();
}

run().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
