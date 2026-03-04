# Miu Spa — Hệ thống quản lý spa đa chi nhánh

Ứng dụng fullstack quản lý vận hành spa gồm hai phần:

- **Public website** — xem dịch vụ, combo, ưu đãi, đặt lịch online, gửi tư vấn, phản hồi
- **Admin portal** — quản lý toàn bộ vận hành: lịch hẹn, nhân viên, phòng/giường, dịch vụ, khuyến mãi, hóa đơn, sổ quỹ, báo cáo, nhật ký hệ thống

---

## Tech stack

### Frontend

| Thư viện | Phiên bản |
|---|---|
| React | 19 |
| Vite (rolldown-vite) | 7 |
| Ant Design | 6 |
| React Router DOM | 7 |
| React Big Calendar | 1 |
| Recharts | 3 |
| Day.js | 1 |

### Backend

| Thư viện | Phiên bản |
|---|---|
| Node.js + Express | 5 |
| MongoDB + Mongoose | 9 |
| Joi | 18 |
| jsonwebtoken | 9 |
| bcryptjs | 3 |
| express-rate-limit | 8 |
| multer | 2 |
| dotenv / cors / axios | latest |

### Testing

| Thư viện | Phiên bản |
|---|---|
| Jest | 30 |
| Supertest | 7 |
| mongodb-memory-server | 11 |

---

## Cấu trúc dự án

```text
spa/
├── client/                      # React frontend
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── Home, About, Careers, Training, Policies
│   │   │   ├── Service/, Combo/, Incentives/
│   │   │   ├── ConsultationForm/, Feedback/
│   │   │   └── Admin/           # Toàn bộ admin portal
│   │   ├── component/           # Booking/, Contact/, Service/
│   │   ├── services/            # API wrappers
│   │   ├── context/
│   │   ├── config/
│   │   ├── theme.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                      # Express backend
│   ├── controllers/             # 19 controllers
│   ├── models/                  # 19 Mongoose models
│   ├── middleware/              # auth, branchCheck, rateLimiter, upload, validate
│   ├── services/                # BookingService
│   ├── routes/
│   │   └── api.js               # Toàn bộ API routes
│   ├── validations/             # Joi schemas
│   ├── tests/                   # Jest + Supertest
│   ├── data/                    # Seed JSON files
│   ├── scripts/                 # Dev/migration scripts
│   ├── uploads/                 # Multer upload folder
│   ├── index.js
│   └── package.json
└── README.md
```

---

## Các module nghiệp vụ

### Admin portal

| Module | Tính năng chính |
|---|---|
| **Dashboard** | Thống kê doanh thu, top dịch vụ, tình trạng nhân viên, tỷ lệ lấp đầy phòng |
| **Booking Manager** | Lịch hẹn (big calendar), duyệt/hủy/check-in, hoàn thành hàng loạt |
| **Waitlist** | Danh sách chờ, tự động gợi ý khi có slot trống |
| **Staff Manager** | Quản lý KTV, ca làm việc, hiệu suất |
| **Room Manager** | Quản lý phòng + giường (multi-bed), tự động tạo giường |
| **Service Manager** | Dịch vụ theo chi nhánh |
| **Promotion Manager** | Mã giảm giá, validate, áp dụng vào hóa đơn |
| **Invoice Manager** | Hóa đơn booking + hóa đơn bán lẻ, void hóa đơn |
| **Expense / Transaction** | Phiếu chi, sổ quỹ |
| **Consultation Manager** | Tiếp nhận và xử lý form tư vấn |
| **Customer Manager** | Lịch sử khách hàng tìm theo số điện thoại |
| **Feedback Manager** | Duyệt / từ chối phản hồi từ website |
| **Gallery Manager** | Ảnh before/after, upload file |
| **Report Manager** | Báo cáo doanh thu theo ngày, báo cáo dòng tiền |
| **System Logs** | Nhật ký hành động theo chi nhánh |
| **Account Manager** | Quản lý tài khoản người dùng hệ thống |
| **Branch Manager** | Quản lý chi nhánh (owner only) |

### Public website

- Trang chủ, giới thiệu, tuyển dụng, đào tạo, chính sách
- Xem dịch vụ, combo dịch vụ, chương trình ưu đãi
- Form đặt lịch online (public, không cần đăng nhập)
- Form tư vấn
- Phản hồi / đánh giá

---

## Roles & phân quyền

| Role | Quyền |
|---|---|
| `owner` | Toàn quyền — bao gồm quản lý chi nhánh, xóa hóa đơn, seed data |
| `admin` | Quản lý vận hành chi nhánh được phân công |
| `ktv` | Xem và cập nhật booking được giao |

---

## Models

`ActionLog` · `Bed` · `Booking` · `Branch` · `Consultation` · `Customer` · `Expense` · `Feedback` · `Gallery` · `Invoice` · `Promotion` · `PromotionUsage` · `Room` · `Service` · `Staff` · `Transaction` · `User` · `Waitlist`

---

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas hoặc MongoDB local

---

## Environment variables

### `server/.env`

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<db>
JWT_SECRET=your_secure_secret
PORT=3000
CLIENT_URL=http://localhost:5173
```

### `client/.env` (optional)

```env
VITE_API_URL=http://localhost:3000
```

---

## Chạy local

### Backend

```bash
cd server
npm install
npm run dev
```

Server chạy tại `http://localhost:3000`

### Frontend

```bash
cd client
npm install
npm run dev
```

Client chạy tại `http://localhost:5173` (hoặc `5174` nếu port đã bận)

---

## Scripts

### `server/package.json`

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Khởi động server bằng nodemon |
| `npm start` | Chạy production |
| `npm test` | Chạy toàn bộ test suite (Jest, in-band) |
| `npm run test:watch` | Chạy test ở watch mode |

### `client/package.json`

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Khởi động Vite dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |
| `npm run lint` | Chạy ESLint |

---

## API overview

Base URL: `http://localhost:3000/api`

| Group | Route |
|---|---|
| Auth | `POST /login` |
| Dashboard | `GET /dashboard/stats` · `revenue-chart` · `top-services` · `staff-status` · `staff-performance` · `occupancy-rate` |
| Bookings | `GET/POST /bookings` · `/bookings/:id` · approve · complete · check-in · waitlist match |
| Invoices | `GET/POST /invoices` · `/invoices/retail` · void |
| Services | `GET/POST/PUT/DELETE /services` |
| Staff | `GET/POST/PUT/DELETE /staff` |
| Rooms & Beds | `GET/POST/PUT/DELETE /rooms` · `/beds` · auto-beds |
| Promotions | `GET/POST/PUT/DELETE /promotions` · validate · apply · suggest |
| Customers | `GET /customers/search` · `/customers/:phone/history` |
| Consultations | `GET/POST/PUT/DELETE /consultations` |
| Waitlist | `GET/POST/DELETE /waitlist` |
| Feedbacks | `GET/POST /feedbacks` · approve · reject |
| Gallery | `GET/POST/PUT/DELETE /gallery` |
| Expenses | `GET/POST/DELETE /expenses` |
| Transactions | `GET/POST/DELETE /transactions` |
| Reports | `GET /reports/daily` · `/reports/cashflow` |
| Branches | `GET/POST/PUT/DELETE /branches` |
| Users | `GET/POST/PUT/DELETE /users` |
| Logs | `GET /logs` |

Các route cần xác thực dùng header: `Authorization: Bearer <token>`

---

## Security & kiến trúc

- Joi schema validation trên tất cả endpoint create/update
- JWT authentication + RBAC (owner / admin / ktv)
- Branch-level data isolation qua `branchCheck` middleware
- Ba tầng rate limiting: `apiLimiter`, `bookingLimiter`, `destructiveLimiter`
- `optionalAuth` cho booking public — ghi audit log nếu có token
- Action log cho các thao tác nhạy cảm
