const mongoose = require('mongoose');
const Staff = require('./models/Staff');

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

const fixShifts = async () => {
    await connectDB();

    try {
        const allStaff = await Staff.find({});
        console.log(`Tìm thấy ${allStaff.length} nhân viên.`);

        const defaultShifts = [0, 1, 2, 3, 4, 5, 6].map(day => ({
             dayOfWeek: day,
             startTime: '09:00',
             endTime: '18:00',
             isOff: false
        }));

        for (const staff of allStaff) {
             staff.shifts = defaultShifts;
             // Xóa skills cũ nếu muốn, hoặc giữ nguyên. Ở đây giữ nguyên.
             await staff.save();
             console.log(`✅ Đã cập nhật ca làm việc cho: ${staff.name}`);
        }

        console.log('🎉 Hoàn tất! Tất cả nhân viên đã có lịch làm việc 9h-18h cả tuần.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixShifts();
