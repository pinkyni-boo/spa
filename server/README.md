# ⚙️ Miu Spa — Backend Server

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

REST API cho hệ thống quản lý spa đa chi nhánh. Entry point: `index.js`, port mặc định `3000`.

---

## Cài Đặt

```bash
cd server
npm install
cp .env.example .env   # Điền thông tin thực vào .env
npm run dev            # http://localhost:3000
```

### Biến Môi Trường (`.env`)

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/spa_project

# JWT signing secret — đặt chuỗi ngẫu nhiên dài, không share
JWT_SECRET=your_secret_key_here

# Port (mặc định 3000)
PORT=3000
```

### Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm start` | Chạy production |
| `npm run dev` | Chạy development với nodemon (auto-reload) |

---

## Cấu Trúc Thư Mục

```
server/
├── controllers/        # Xử lý request/response (14 controllers)
│   ├── BookingController.js
│   ├── InvoiceController.js
│   ├── ActionLogController.js
│   └── ...
├── models/             # Mongoose schemas
│   ├── Booking.js      # Lịch hẹn — startTime, endTime, bedId, staffId
│   ├── Bed.js          # Giường vật lý trong phòng
│   ├── Room.js
│   ├── Branch.js
│   ├── Staff.js        # Ca làm việc theo từng ngày trong tuần
│   ├── Service.js      # Dịch vụ — duration, breakTime, requiredRoomType
│   ├── Invoice.js      # Hóa đơn — tip, discount, loyaltyPoints
│   ├── Promotion.js / PromotionUsage.js
│   ├── Customer.js
│   ├── Waitlist.js
│   ├── User.js         # Tài khoản admin/staff
│   └── ActionLog.js    # Audit log mọi thao tác
├── middleware/
│   ├── auth.js         # verifyToken, checkRole, optionalAuth
│   ├── branchCheck.js  # Data isolation — inject req.branchQuery
│   ├── rateLimiter.js  # express-rate-limit chống brute-force
│   └── upload.js       # multer — upload ảnh gallery
├── routes/
│   └── api.js          # Toàn bộ route tập trung tại đây
├── services/
│   └── BookingService.js   # Business logic cốt lõi
├── scripts/            # Seed data (chạy thủ công khi cần)
├── data/               # JSON seed files (services, staff...)
├── uploads/            # Static files đã upload
├── .env.example
└── index.js
```

---

## 🔥 Technical Highlights

### 1. Mutex Lock — Chống Race Condition Khi Đặt Lịch Đồng Thời

**Vấn đề:** Nhiều khách đặt cùng một slot, tất cả cùng pass kiểm tra "còn chỗ trống" trước khi bất kỳ request nào ghi xong — dẫn đến double booking.

**Giải pháp:** Implement `Mutex` bằng Promise chain trong `BookingService.js`. Mỗi request phải acquire lock trước khi kiểm tra và ghi booking.

```js
// services/BookingService.js
class Mutex {
    constructor() { this._locking = Promise.resolve(); }
    lock() {
        let unlock;
        const willLock = new Promise(resolve => (unlock = resolve));
        const willUnlock = this._locking.then(() => unlock);
        this._locking = this._locking.then(() => willLock);
        return willUnlock;
    }
}
const bookingMutex = new Mutex();

const createBooking = async (data) => {
    const unlock = await bookingMutex.lock(); // Chờ turn
    try {
        // Kiểm tra phòng/giường/nhân viên trống...
        // Ghi Booking vào DB...
    } finally {
        unlock(); // Giải phóng cho request tiếp theo
    }
};
```

Kết quả: 3 request đến cùng lúc → xử lý tuần tự → chỉ 1 thành công, 2 còn lại nhận "hết chỗ".

---

### 2. Middleware Data Isolation — Cô Lập Dữ Liệu Theo Chi Nhánh

**Vấn đề:** Hệ thống 3 chi nhánh — nếu filter `branchId` viết riêng trong từng controller thì dễ bỏ sót khi thêm route mới.

**Giải pháp:** Middleware `branchCheck.js` inject `req.branchQuery` một lần, controller chỉ cần spread vào query Mongoose — không cần tự lo phân quyền.

```js
// middleware/branchCheck.js
exports.branchCheck = (req, res, next) => {
    const { role, branchId } = req.user;

    if (role === 'owner') {
        req.branchQuery = {};                    // Xem tất cả
    } else {
        req.branchQuery = { branchId: branchId }; // Chỉ xem chi nhánh mình
    }
    next();
};

// controllers/BookingController.js
exports.getAllBookings = async (req, res) => {
    const query = { ...req.branchQuery };        // Isolation tự động
    // ... thêm filter ngày, staff, v.v.
    const bookings = await Booking.find(query);
};
```

---

### 3. Role-Based Access Control (RBAC) + optionalAuth

**Phân quyền theo role** qua middleware chain:

```js
// routes/api.js
router.get('/bookings', verifyToken, branchCheck, BookingController.getAll);
router.delete('/users/:id', verifyToken, checkRole('owner'), UserController.delete);
```

**`optionalAuth`** cho endpoint public nhưng cần audit khi admin dùng:

```js
// POST /api/bookings — khách đặt online không cần login
// nhưng nếu admin tạo thủ công → ghi audit log
router.post('/bookings', optionalAuth, BookingController.create);

// Trong controller
if (req.user && ['admin', 'owner'].includes(req.user.role)) {
    // Auto confirm + ghi ActionLog
}
```

**Phân quyền theo vai trò:**

| Role | Quyền |
|------|-------|
| `owner` | Toàn quyền, xem tất cả chi nhánh |
| `admin` | Quản lý đầy đủ, chỉ thấy chi nhánh được gán |
| `staff` / `ktv` | Quyền nghiệp vụ hạn chế |

---

## API Endpoints Chính

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/login` | — | Đăng nhập |
| `POST` | `/api/bookings/check-slot` | — | Kiểm tra slot trống |
| `POST` | `/api/bookings` | Optional | Tạo booking (khách/admin) |
| `GET` | `/api/bookings` | Admin | Danh sách booking |
| `PUT` | `/api/bookings/:id` | Admin | Cập nhật booking |
| `POST` | `/api/bookings/:id/check-in` | Admin | Check-in khách |
| `GET` | `/api/services` | — | Danh sách dịch vụ |
| `GET` | `/api/staff` | Admin | Danh sách nhân viên |
| `GET` | `/api/invoices` | Admin | Danh sách hóa đơn |
| `GET` | `/api/dashboard/stats` | Admin | Thống kê dashboard |
| `GET` | `/api/reports/revenue` | Admin | Báo cáo doanh thu |
| `GET` | `/api/action-logs` | Owner | Nhật ký hệ thống |

---

## Database — MongoDB Atlas

18 collection: `bookings` · `staffs` · `rooms` · `beds` · `branches` · `services` · `invoices` · `customers` · `promotions` · `promotionusages` · `users` · `feedbacks` · `actionlogs` · `waitlists` · `consultations` · `galleries` · `expenses` · `transactions`

---

## Seed Data

```bash
node scripts/seed_branches.js    # Tạo chi nhánh mẫu
node scripts/seed_rooms.js       # Tạo phòng + giường
node scripts/seed_promotions.js  # Tạo khuyến mãi
node scripts/seed_feedbacks.js   # Tạo phản hồi khách hàng
```

---

🔗 [Về thư mục gốc](../) · [Frontend (client/)](../client/)
