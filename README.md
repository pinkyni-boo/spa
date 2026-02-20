# Miu Spa — Spa Management System

Hệ thống quản lý spa full-stack: trang web khách hàng + admin portal đa chi nhánh.

---

## Yêu Cầu Môi Trường

- Node.js >= 18
- npm >= 9
- MongoDB Atlas (hoặc MongoDB local)

---

## Công Nghệ Sử Dụng

### Frontend (`client/`)

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| React | ^19.2.0 | UI framework |
| Vite (rolldown-vite) | ^7.2.5 | Build tool |
| Ant Design | ^6.1.3 | Component library |
| React Router DOM | ^7.11.0 | Client-side routing |
| React Big Calendar | ^1.19.4 | Calendar / resource view |
| Recharts | ^3.6.0 | Biểu đồ thống kê |
| Day.js | ^1.11.19 | Xử lý ngày giờ |
| ESLint | ^9.39.1 | Linting |

### Backend (`server/`)

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| Express | ^5.2.1 | Web framework |
| Mongoose | ^9.1.1 | MongoDB ODM |
| JSON Web Token | ^9.0.3 | Xác thực |
| dotenv | ^17.2.3 | Biến môi trường |
| cors | ^2.8.5 | Cross-origin |
| express-rate-limit | ^8.2.1 | Rate limiting |
| multer | ^2.0.2 | Upload file |
| dayjs | ^1.11.19 | Xử lý ngày giờ |
| nodemon | dev | Auto-restart khi dev |

---

## Biến Môi Trường

Tạo file `.env` trong thư mục `server/` (xem mẫu tại `server/.env.example`):

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/spa_project
JWT_SECRET=your_jwt_secret_here
PORT=3000
```

Frontend đọc từ `.env` trong `client/` (tạo nếu cần):

```env
VITE_API_URL=http://localhost:3000
```

---

## Cài Đặt & Chạy

```bash
# Clone
git clone https://github.com/pinkyni-boo/spa.git
cd spa

# Backend
cd server
npm install
cp .env.example .env      # Điền thông tin MongoDB + JWT
npm run dev               # http://localhost:3000

# Frontend (terminal mới)
cd client
npm install
npm run dev               # http://localhost:5173
```

### Scripts

**Backend (`server/`)**

| Script | Lệnh |
|--------|------|
| Production | `npm start` |
| Development (auto-reload) | `npm run dev` |

**Frontend (`client/`)**

| Script | Lệnh |
|--------|------|
| Development | `npm run dev` |
| Build production | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |

---

## Cấu Trúc Thư Mục

```
spa/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── Admin/              # 14 module quản lý
│   │   │   │   ├── BookingManager/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── StaffManager/
│   │   │   │   ├── RoomManager/
│   │   │   │   ├── ServiceManager/
│   │   │   │   ├── PromotionManager/
│   │   │   │   ├── InvoiceManager/
│   │   │   │   ├── CustomerManager/
│   │   │   │   ├── ReportManager/
│   │   │   │   ├── FeedbackManager/
│   │   │   │   ├── BranchManager/
│   │   │   │   ├── AccountManager/
│   │   │   │   ├── SystemLogs/
│   │   │   │   └── ConsultationManager/
│   │   │   └── Global/             # Nav, Footer, ScrollToTop
│   │   ├── component/              # Booking modal, Contact, Service detail
│   │   ├── services/               # API fetch wrappers
│   │   ├── context/
│   │   ├── data/
│   │   ├── theme.js                # Design tokens (màu, font)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── vercel.json                 # SPA rewrite rules
│
└── server/
    ├── controllers/                # Request handlers
    ├── models/                     # Mongoose schemas
    │   ├── Booking.js
    │   ├── Staff.js
    │   ├── Room.js / Bed.js
    │   ├── Branch.js
    │   ├── Service.js
    │   ├── Invoice.js
    │   ├── Customer.js
    │   ├── Promotion.js / PromotionUsage.js
    │   ├── Waitlist.js
    │   ├── User.js
    │   └── ActionLog.js
    ├── middleware/
    │   ├── auth.js                 # verifyToken, checkRole, optionalAuth
    │   ├── branchCheck.js          # Data isolation theo chi nhánh
    │   ├── rateLimiter.js
    │   └── upload.js               # multer
    ├── routes/
    │   └── api.js
    ├── services/
    │   └── BookingService.js       # Availability check, auto-assign, concurrency mutex
    ├── scripts/                    # Seed data
    ├── data/                       # JSON seed files
    ├── uploads/
    ├── .env.example
    └── index.js
```

---

## Tính Năng

### Trang Khách Hàng

- Trang chủ, dịch vụ phân loại theo danh mục
- Trang Combo, Ưu Đãi, Phản Hồi
- Đặt lịch online: chọn chi nhánh → dịch vụ → ngày giờ → hệ thống tự kiểm tra slot trống
- Responsive, mobile navigation với Drawer

### Admin Portal (`/admin`)

| Module | Tính năng chính |
|--------|-----------------|
| Dashboard | Doanh thu ngày, công suất phòng, hiệu suất nhân viên |
| Quản Lý Đặt Lịch | Calendar drag & drop phòng/giường, waitlist, check-in, thanh toán |
| Nhân Viên | Ca làm việc theo từng ngày trong tuần, phân chi nhánh |
| Phòng / Giường | CRUD phòng, quản lý từng giường riêng lẻ |
| Dịch Vụ | CRUD, giá, thời lượng, loại phòng yêu cầu |
| Chi Nhánh | Thêm/sửa chi nhánh, gán quản lý |
| Khuyến Mãi | Tạo mã giảm giá, theo dõi lượt sử dụng |
| Hóa Đơn | Danh sách, thống kê doanh thu + tip, void invoice |
| Khách Hàng | Lịch sử đặt lịch theo SĐT, tìm kiếm CRM |
| Phản Hồi | Duyệt / ẩn đánh giá |
| Báo Cáo | Biểu đồ Recharts: doanh thu, top dịch vụ, tỷ lệ đặt lịch |
| Tư Vấn | Tiếp nhận yêu cầu tư vấn |
| Tài Khoản | CRUD tài khoản admin/staff |
| Nhật Ký | Audit log: ghi lại mọi action kèm IP, user agent, timestamp |

### Phân Quyền

| Role | Quyền |
|------|-------|
| `owner` | Toàn quyền, xem dữ liệu tất cả chi nhánh |
| `admin` | Quản lý đầy đủ, chỉ thấy dữ liệu chi nhánh được gán |
| `staff` / `ktv` | Quyền hạn chế theo nghiệp vụ |

---

## Deploy

### Backend — Render.com

| Trường | Giá trị |
|--------|---------|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment Variables | `MONGO_URI`, `JWT_SECRET`, `PORT` |

### Frontend — Vercel.com

| Trường | Giá trị |
|--------|---------|
| Root Directory | `client` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | `VITE_API_URL` = URL backend Render |

> `client/vercel.json` đã cấu hình rewrite toàn bộ route về `index.html` để React Router hoạt động đúng trên Vercel.

---

## Database — MongoDB Atlas

Các collection chính:

`bookings` · `staffs` · `rooms` · `beds` · `branches` · `services` · `invoices` · `customers` · `promotions` · `promotionusages` · `users` · `feedbacks` · `actionlogs` · `waitlists` · `consultations` · `galleries` · `expenses` · `transactions`
