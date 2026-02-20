# 🌸 Miu Spa — Spa Management System

Hệ thống quản lý spa full-stack bao gồm trang web khách hàng và admin portal đầy đủ tính năng.

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Ant Design 6 (UI components)
- React Router DOM 7
- React Big Calendar (lịch đặt chỗ drag & drop)
- Recharts (biểu đồ thống kê)
- Day.js

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JSON Web Token (JWT)
- Multer (upload ảnh)
- Express Rate Limiter

---

## Tính Năng

### Trang Khách Hàng (Client)
- **Trang chủ** — giới thiệu spa, banner, nổi bật dịch vụ
- **Dịch Vụ** — danh sách dịch vụ theo danh mục (body, facial, nail...)
- **Combo** — gói combo ưu đãi
- **Ưu Đãi** — khuyến mãi đang áp dụng
- **Phản Hồi** — đánh giá từ khách hàng
- **Đặt Lịch** — form đặt lịch online, kiểm tra slot trống theo chi nhánh + thời gian

### Admin Portal (`/admin`)

| Module | Tính năng |
|--------|-----------|
| **Dashboard** | Thống kê tổng quan, doanh thu theo ngày, lịch làm việc nhân viên |
| **Quản Lý Đặt Lịch** | Lịch drag & drop, list view, tạo/duyệt/hủy/check-in/hoàn thành, waitlist |
| **Quản Lý Dịch Vụ** | CRUD dịch vụ, phân loại, giá, thời lượng |
| **Quản Lý Nhân Viên** | Ca làm việc, phân chi nhánh, hiệu suất |
| **Quản Lý Phòng** | Phòng + giường, theo dõi tình trạng |
| **Quản Lý Chi Nhánh** | Đa chi nhánh, phân quyền theo branch |
| **Quản Lý Khuyến Mãi** | Mã giảm giá, combo, theo dõi lượt dùng |
| **Quản Lý Hóa Đơn** | Danh sách hoá đơn, thống kê doanh thu/tip, huỷ hoá đơn |
| **Quản Lý Khách Hàng** | Lịch sử đặt lịch, CRM tìm kiếm |
| **Quản Lý Phản Hồi** | Duyệt / ẩn đánh giá |
| **Báo Cáo** | Biểu đồ doanh thu, tỷ lệ đặt lịch, top dịch vụ |
| **Sản Phẩm** | Quản lý sản phẩm bán lẻ tại spa |
| **Tư Vấn** | Yêu cầu tư vấn từ khách |
| **Tài Khoản** | Quản lý tài khoản admin/staff/owner |
| **Nhật Ký Hệ Thống** | Audit log toàn bộ thao tác admin |

### Phân Quyền
- `owner` — toàn quyền hệ thống
- `admin` — quản lý toàn bộ (trừ cài đặt owner)
- `staff` / `ktv` — chỉ xem chi nhánh được phân công

---

## Cấu Trúc Project

```
spa/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── Pages/       # Tất cả pages (Admin + Client)
│   │   ├── component/   # Shared components (Booking, Contact...)
│   │   ├── services/    # API service layer
│   │   ├── context/     # React contexts
│   │   └── theme.js     # Design tokens (màu, font)
│   └── public/
│
└── server/          # Node.js backend
    ├── controllers/     # Business logic
    ├── models/          # Mongoose schemas
    ├── routes/          # Express routes
    ├── middleware/       # Auth, rate limit, upload
    └── services/        # Service layer (BookingService...)
```

---

## Cài Đặt & Chạy Local

### Yêu cầu
- Node.js >= 18
- MongoDB Atlas account (hoặc MongoDB local)

### 1. Clone
```bash
git clone https://github.com/pinkyni-boo/spa.git
cd spa
```

### 2. Cài đặt Backend
```bash
cd server
npm install
```

Tạo file `.env` trong thư mục `server/`:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/spa_project
JWT_SECRET=your_secret_key
PORT=3000
```

```bash
npm run dev
```

### 3. Cài đặt Frontend
```bash
cd client
npm install
npm run dev
```

Frontend chạy tại `http://localhost:5173`  
Backend chạy tại `http://localhost:3000`

---

## API Endpoints (chính)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/bookings` | Lấy danh sách đặt lịch |
| POST | `/api/bookings` | Tạo đặt lịch mới |
| PUT | `/api/bookings/:id` | Cập nhật đặt lịch |
| POST | `/api/bookings/:id/check-in` | Check-in khách |
| GET | `/api/services` | Lấy danh sách dịch vụ |
| GET | `/api/invoices` | Lấy danh sách hóa đơn |
| GET | `/api/customers/search` | Tìm kiếm khách hàng |
| GET | `/api/dashboard/stats` | Thống kê dashboard |

---

## Deploy

- **Backend**: [Render.com](https://render.com) — Root Directory: `server`, Start Command: `npm start`
- **Frontend**: [Vercel.com](https://vercel.com) — Root Directory: `client`, Framework: Vite

---

## Screenshots

> *(Cập nhật sau khi deploy)*

---

## Tác Giả

Được phát triển bởi **pinkyni-boo**  
Stack: React · Node.js · MongoDB · Ant Design
