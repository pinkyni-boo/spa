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

// --- 2. TẠO KHUÔN MẪU (SCHEMA) ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// --- 3. TỰ ĐỘNG TẠO USER ĐỂ TEST ---
const createSampleUser = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create({ username: 'admin', password: '123' });
      console.log('⚠️ Đã tự động tạo tài khoản mẫu: admin / 123');
    }
  } catch (e) {
    console.log('Chưa kết nối DB nên chưa tạo user được');
  }
};
createSampleUser();

// --- 4. API ĐĂNG NHẬP ---
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