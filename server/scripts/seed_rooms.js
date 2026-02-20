const mongoose = require('mongoose');
const Room = require('./models/Room');

// Kết nối DB (Copy từ index.js)
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedRooms = async () => {
    await connectDB();

    const rooms = [
        { name: 'Room 101', type: 'Standard', capacity: 1, description: 'Phòng đơn tiêu chuẩn' },
        { name: 'Room 102', type: 'Standard', capacity: 1, description: 'Phòng đơn tiêu chuẩn' },
        { name: 'Room 103', type: 'Standard', capacity: 1, description: 'Phòng đơn tiêu chuẩn' },
        { name: 'VIP 01', type: 'VIP', capacity: 1, description: 'Phòng VIP view đẹp' },
        { name: 'Couple 01', type: 'Couple', capacity: 2, description: 'Phòng đôi cho cặp đôi' }
    ];

    try {
        await Room.deleteMany({}); // Xóa cũ
        await Room.insertMany(rooms);
        console.log('✅ Đã tạo dữ liệu Phòng mẫu thành công!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedRooms();
