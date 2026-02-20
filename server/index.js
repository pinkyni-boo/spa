const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


// Cấu hình để React gọi được API
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // [NEW] Serve uploaded files


// --- 1. KẾT NỐI MONGODB ---
// Lưu ý: Nếu máy bạn chưa cài MongoDB, bước này sẽ báo lỗi.
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Đã kết nối thành công với MongoDB Cloud!'))
  .catch(err => console.error('❌ Lỗi kết nối:', err));

// --- 2. IMPORT MODELS ---
const Service = require('./models/Service');
const Staff = require('./models/Staff');
const Booking = require('./models/Booking');

const User = require('./models/User');

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
const { authLimiter } = require('./middleware/rateLimiter'); // [NEW] Rate Limiting
const ActionLogController = require('./controllers/ActionLogController'); // [NEW] Audit Logging
app.use('/api', apiRoutes);

// --- 6. API ĐĂNG NHẬP ---
app.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  console.log("React đang gửi lên:", username, password);

  try {
    // [UPDATED] Populate basic info
    const user = await User.findOne({ username, password }).populate('managedBranches', 'name');
    if (user) {
      if (!user.isActive) return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa!' });
      
      // [NEW] Generate Token
      const token = jwt.sign(
        { 
            id: user._id, 
            username: user.username,
            role: user.role, 
            branchId: user.managedBranches?.[0]?._id || null
        }, 
        process.env.JWT_SECRET || 'miu_spa_secret_2024',
        { expiresIn: '24h' }
      );

      // [AUDIT] Log login event
      ActionLogController.createLog(req, user, 'AUTH_LOGIN', 'User', user._id, user.username);

      res.json({ 
          success: true, 
          message: 'Đăng nhập thành công!',
          token, // [NEW] Send token
          user: {
              id: user._id,
              name: user.name,
              username: user.username,
              role: user.role,
              managedBranches: user.managedBranches || []
          }
      });
    } else {
      res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server!' });
  }
});

// --- KHỞI ĐỘNG SERVER ---
app.listen(PORT, () => {
  console.log(`✅ Server Spa đang chạy tại http://localhost:${PORT}`);
  seedData();
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
