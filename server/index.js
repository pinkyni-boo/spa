const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Gọi thư viện Mongoose vừa cài

const app = express();
const PORT = 3000;

// Cấu hình để React gọi được API
app.use(cors());
app.use(express.json());

// --- 1. KẾT NỐI MONGODB ---
// Lưu ý: Nếu máy bạn chưa cài MongoDB, bước này sẽ báo lỗi.
mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
  .then(() => console.log('✅ Đã kết nối thành công với MongoDB Cloud!'))
  .catch(err => console.error('❌ Lỗi kết nối:', err));

// --- 2. IMPORT MODELS ---
const Service = require('./models/Service');
const Staff = require('./models/Staff');
const Booking = require('./models/Booking');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// --- 3. SEEDING DATA (TẠO DỮ LIỆU MẪU) ---
// Load dữ liệu từ file JSON để dễ chỉnh sửa
const sampleServices = require('./data/services.json');
const sampleStaff = require('./data/staff.json');

const seedData = async () => {
  try {
    // 1. Tạo User Admin
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({ username: 'admin', password: '123' });
      console.log('⚠️ Đã tạo User: admin / 123');
    }

    // 2. Tạo Dịch vụ mẫu (Nếu chưa có)
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(sampleServices); // Lấy từ services.json
      console.log(`⚠️ Đã tạo ${sampleServices.length} Dịch vụ mẫu từ file JSON`);
    }

    // 3. Tạo Nhân viên mẫu
    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      await Staff.insertMany(sampleStaff); // Lấy từ staff.json
      console.log(`⚠️ Đã tạo ${sampleStaff.length} Nhân viên mẫu từ file JSON`);
    }

  } catch (e) {
    console.log('Lỗi Seed Data:', e.message);
  }
};
seedData();

const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// --- 6. API ĐĂNG NHẬP ---
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("React đang gửi lên:", username, password);

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ success: true, message: 'Đăng nhập thành công!' });
    } else {
      res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server!' });
  }
});

app.listen(PORT, () => {
  console.log('--- RESTARTING SERVER FOR SEARCH FEATURE ---');
  console.log(`Server chạy tại: http://localhost:${PORT}`);
});
// --- API ĐĂNG KÝ TÀI KHOẢN MỚI ---
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });
    }

    // 2. Lưu user mới vào Database
    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ success: true, message: 'Đăng ký tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký!' });
  }
});
