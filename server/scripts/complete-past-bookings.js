// Auto-complete all past bookings
const today = new Date();
today.setHours(0, 0, 0, 0);

const result = db.bookings.updateMany(
  { 
    startTime: { $lt: today },
    status: { $in: ['pending', 'confirmed'] }
  },
  { 
    $set: { status: 'completed' } 
  }
);

print(`Updated ${result.modifiedCount} bookings to completed status`);
