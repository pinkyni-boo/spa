const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Gọi thư viện Mongoose vừa cài
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app); // Wrap Express app with HTTP server
const PORT = 3000;

// Socket.io setup with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Store io in app.locals for safe dependency injection
app.locals.io = io;

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('🔌 Admin connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('❌ Admin disconnected:', socket.id);
    });
});

// Cấu hình để React gọi được API
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // [NEW] Serve uploaded files


// --- 1. KẾT NỐI MONGODB ---
// Lưu ý: Nếu máy bạn chưa cài MongoDB, bước này sẽ báo lỗi.
mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
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
app.use('/api', apiRoutes);

// --- 6. API ĐĂNG NHẬP ---
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("React đang gửi lên:", username, password);

  try {
    // [UPDATED] Populate basic info
    const user = await User.findOne({ username, password }).populate('managedBranches', 'name');
    if (user) {
      if (!user.isActive) return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa!' });
      
      res.json({ 
          success: true, 
          message: 'Đăng nhập thành công!',
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
// Use server.listen instead of app.listen to support Socket.io
server.listen(PORT, () => {
  console.log(`✅ Server Spa đang chạy tại http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for realtime notifications`);
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
