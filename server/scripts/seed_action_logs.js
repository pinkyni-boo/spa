/**
 * Seed test ActionLog documents for UI testing
 * Run: node seed_action_logs.js
 */
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
    .then(async () => {
        console.log('MongoDB Connected');

        const ActionLog = require('./models/ActionLog');
        const User = require('./models/User');
        const Branch = require('./models/Branch');

        // Get real users & branches
        const users = await User.find().limit(3);
        const branches = await Branch.find().limit(2);

        if (users.length === 0) {
            console.error('No users found. Aborting.');
            process.exit(1);
        }

        const u = users[0];
        const u2 = users[1] || users[0];
        const branchId = branches[0]?._id || null;

        const now = new Date();
        const ago = (h) => new Date(now - h * 3600 * 1000);

        const logs = [
            // Auth
            { user: u._id, displayName: u.username, role: u.role, action: 'AUTH_LOGIN',       targetType: 'User',    targetId: u._id, targetName: u.username, ip: '127.0.0.1', branchId, timestamp: ago(0.5) },
            { user: u2._id, displayName: u2.username, role: u2.role, action: 'AUTH_LOGIN',     targetType: 'User',    targetId: u2._id, targetName: u2.username, ip: '192.168.1.5', branchId, timestamp: ago(1) },

            // Bookings
            { user: u._id, displayName: u.username, role: u.role, action: 'BOOKING_CREATE',   targetType: 'Booking', targetName: 'THẢO - Gội Đầu', details: { customerName: 'THẢO', service: 'Gội Đầu', date: '2026-02-19 19:00' }, ip: '127.0.0.1', branchId, timestamp: ago(2) },
            { user: u._id, displayName: u.username, role: u.role, action: 'BOOKING_APPROVE',  targetType: 'Booking', targetName: 'THẢO - Gội Đầu', ip: '127.0.0.1', branchId, timestamp: ago(1.8) },
            { user: u._id, displayName: u.username, role: u.role, action: 'BOOKING_CHECKIN',  targetType: 'Booking', targetName: 'THẢO - Gội Đầu', ip: '127.0.0.1', branchId, timestamp: ago(1.5) },
            { user: u._id, displayName: u.username, role: u.role, action: 'BOOKING_COMPLETE', targetType: 'Booking', targetName: 'THẢO - Gội Đầu', ip: '127.0.0.1', branchId, timestamp: ago(0.8) },

            { user: u2._id, displayName: u2.username, role: u2.role, action: 'BOOKING_CREATE', targetType: 'Booking', targetName: 'THANH - Uốn Tóc', details: { customerName: 'THANH', service: 'Uốn Tóc', date: '2026-02-19 19:30' }, ip: '10.0.0.2', branchId, timestamp: ago(3) },
            { user: u2._id, displayName: u2.username, role: u2.role, action: 'BOOKING_CANCEL', targetType: 'Booking', targetName: 'THANH - Uốn Tóc', details: { reason: 'Khách hủy' }, ip: '10.0.0.2', branchId, timestamp: ago(2.5) },

            // Services
            { user: u._id, displayName: u.username, role: u.role, action: 'SERVICE_CREATE',   targetType: 'Service', targetName: 'Nhuộm Tóc Premium', details: { price: 500000, duration: 120 }, ip: '127.0.0.1', branchId, timestamp: ago(24) },
            { user: u._id, displayName: u.username, role: u.role, action: 'SERVICE_UPDATE',   targetType: 'Service', targetName: 'Gội Đầu Dưỡng Sinh', details: { before: { price: 150000 }, after: { price: 180000 } }, ip: '127.0.0.1', branchId, timestamp: ago(48) },

            // Staff
            { user: u._id, displayName: u.username, role: u.role, action: 'STAFF_CREATE',     targetType: 'Staff',   targetName: 'Nguyễn Thị Lan', details: { role: 'ktv' }, ip: '127.0.0.1', branchId, timestamp: ago(72) },

            // Promotions
            { user: u._id, displayName: u.username, role: u.role, action: 'PROMOTION_CREATE', targetType: 'Promotion', targetName: 'Tết 2026 - Giảm 20%', details: { discount: '20%', startDate: '2026-01-20', endDate: '2026-02-10' }, ip: '127.0.0.1', branchId, timestamp: ago(120) },
        ];

        await ActionLog.deleteMany({});
        const result = await ActionLog.insertMany(logs);
        console.log(`✅ Inserted ${result.length} test ActionLog documents`);
        process.exit(0);
    })
    .catch(e => { console.error(e.message); process.exit(1); });
