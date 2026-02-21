# 🌸 Miu Spa — Hệ Thống Quản Lý Spa

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant%20Design-6-0170FE?style=flat-square&logo=antdesign&logoColor=white)
![Jest](https://img.shields.io/badge/Tested%20with-Jest-C21325?style=flat-square&logo=jest&logoColor=white)

Fullstack SPA quản lý spa đa chi nhánh — bao gồm trang đặt lịch cho khách hàng và admin portal vận hành nghiệp vụ thực tế.

> **Live Demo:** *(sẽ cập nhật sau khi deploy)*

---

## Mục Lục

- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Tính năng](#tính-năng)
- [Cài đặt và Chạy](#cài-đặt-và-chạy)
- [Biến môi trường](#biến-môi-trường)
- [Kiểm thử](#kiểm-thử)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Phân quyền](#phân-quyền)
- [Bảo mật](#bảo-mật)
- [Deploy](#deploy)

---

## Công Nghệ Sử Dụng

### Frontend (`client/`)

| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| React | ^19.2.0 | UI framework |
| Vite (rolldown-vite) | ^7.2.5 | Build tool |
| Ant Design | ^6.1.3 | Component library |
| React Router DOM | ^7.11.0 | Client-side routing |
| React Big Calendar | ^1.19.4 | Calendar / resource view |
| Recharts | ^3.6.0 | Biểu đồ thống kê |
| Day.js | ^1.11.19 | Xử lý ngày giờ |

### Backend (`server/`)

| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| Express | ^5.2.1 | Web framework |
| Mongoose | ^9.1.1 | MongoDB ODM |
| JSON Web Token | ^9.0.3 | Xác thực |
| bcryptjs | ^3.0.3 | Hash mật khẩu |
| Joi | ^18.0.2 | Input validation |
| express-rate-limit | ^8.2.1 | Rate limiting |
| multer | ^2.0.2 | Upload ảnh |
| dotenv | ^17.2.3 | Biến môi trường |

### Testing

| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| Jest | ^30.2.0 | Test runner |
| Supertest | ^7.2.2 | HTTP integration test |
| mongodb-memory-server | ^11.0.1 | MongoDB in-memory cho test |

---

## Tính Năng

### Trang Khách Hàng

- Trang chủ, giới thiệu dịch vụ phân loại theo danh mục
- Xem Combo, Ưu Đãi, Phản Hồi khách hàng
- **Đặt lịch online**: chọn chi nhánh → dịch vụ → ngày → hệ thống tự động kiểm tra slot trống real-time
- Gửi yêu cầu tư vấn
- Giao diện responsive, mobile navigation

### Admin Portal (`/admin`)

| Module | Tính năng chính |
|---|---|
| **Dashboard** | Doanh thu theo ngày, công suất phòng, hiệu suất nhân viên, biểu đồ tổng quan |
| **Quản Lý Đặt Lịch** | Calendar drag and drop (phòng/giường), Waitlist, Check-in, thanh toán, server-side pagination |
| **Nhân Viên** | CRUD, lịch làm việc từng ngày trong tuần, phân chi nhánh |
| **Phòng / Giường** | Quản lý phòng và từng giường riêng lẻ trong phòng |
| **Dịch Vụ** | CRUD dịch vụ, giá, thời lượng, loại phòng yêu cầu |
| **Chi Nhánh** | Thêm/sửa chi nhánh, gán quản lý, giờ làm việc |
| **Khuyến Mãi** | Tạo mã giảm giá (%), theo dõi lượt sử dụng, tự động hết hạn |
| **Hóa Đơn** | Tạo hóa đơn dịch vụ + bán lẻ, thống kê tip, void invoice (owner) |
| **Khách Hàng** | Lịch sử đặt lịch theo SĐT, tích lũy điểm loyalty, tìm kiếm CRM |
| **Sổ Quỹ** | Quản lý thu/chi, phiếu chi, báo cáo tổng hợp, pagination |
| **Báo Cáo** | Doanh thu theo ngày/tháng, top dịch vụ, tỷ lệ đặt lịch (Recharts) |
| **Phản Hồi** | Duyệt / từ chối đánh giá trước khi hiện công khai |
| **Tư Vấn** | Tiếp nhận và xử lý yêu cầu tư vấn từ trang web |
| **Gallery** | Upload ảnh before/after, quản lý thư viện hình ảnh |
| **Tài Khoản** | CRUD tài khoản admin/staff, đặt lại mật khẩu |
| **Nhật Ký Hệ Thống** | Audit log: ghi lại mọi hành động kèm IP, user agent, timestamp |

---

## Cài Đặt và Chạy

### Yêu cầu

- Node.js >= 18
- npm >= 9
- Tài khoản MongoDB Atlas (hoặc MongoDB local)

### Các bước

```bash
# 1. Clone repository
git clone https://github.com/pinkyni-boo/spa.git
cd spa

# 2. Cài đặt và chạy backend
cd server
npm install
cp .env.example .env      # Điền thông tin MongoDB + JWT_SECRET
npm run dev               # Server chạy tại http://localhost:3000

# 3. Cài đặt và chạy frontend (mở terminal mới)
cd client
npm install
npm run dev               # App chạy tại http://localhost:5173
```

### Scripts

**Backend (`server/`)**

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy development (nodemon auto-reload) |
| `npm start` | Chạy production |
| `npm test` | Chạy toàn bộ test suite |

**Frontend (`client/`)**

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |
| `npm run lint` | Kiểm tra linting |

---

## Biến Môi Trường

**`server/.env`** (tạo từ `server/.env.example`):

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/spa_project
JWT_SECRET=your_strong_secret_here
PORT=3000
CLIENT_URL=http://localhost:5173
```

**`client/.env`** (tạo nếu chưa có):

```env
VITE_API_URL=http://localhost:3000
```

> Khi deploy, thay `VITE_API_URL` bằng URL backend thực tế và `CLIENT_URL` bằng URL frontend.

---

## Kiểm Thử

```bash
cd server
npm test
```

**Kết quả:** 10/10 test cases PASS

| Test file | Nội dung |
|---|---|
| `tests/auth.test.js` | Login thành công, sai mật khẩu, tài khoản bị khóa, JWT decode |
| `tests/booking.test.js` | Joi validation: thiếu phone, sai định dạng, thiếu branchId, endTime < startTime |

Test sử dụng MongoDB in-memory — không cần kết nối database thật, chạy độc lập hoàn toàn.

---

## Cấu Trúc Thư Mục

```
spa/
├── client/
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── Admin/              # 14 module quản lý
│   │   │   │   ├── BookingManager/ # Calendar, List, Waitlist, DnD
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
│   │   │   └── ...                 # Trang public (Home, About, Service...)
│   │   ├── component/              # Booking form, Contact, Service detail
│   │   ├── services/               # API fetch wrappers
│   │   ├── context/
│   │   ├── theme.js                # Design tokens (màu, border-radius)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json                 # SPA rewrite rules cho Vercel
│   └── vite.config.js
│
└── server/
    ├── controllers/                # Xử lý request/response (18 controllers)
    ├── models/                     # Mongoose schemas (18 models)
    ├── middleware/
    │   ├── auth.js                 # verifyToken, checkRole, optionalAuth
    │   ├── branchCheck.js          # Data isolation theo chi nhánh
    │   ├── validate.js             # Joi validation middleware
    │   ├── rateLimiter.js          # Global + route-specific limiters
    │   └── upload.js               # multer config
    ├── validations/                # Joi schemas
    │   ├── booking.validation.js
    │   ├── user.validation.js
    │   ├── promotion.validation.js
    │   ├── expense.validation.js
    │   └── consultation.validation.js
    ├── services/
    │   └── BookingService.js       # Availability check, auto-assign, Mutex concurrency
    ├── routes/
    │   └── api.js                  # Toàn bộ route definitions
    ├── tests/
    │   ├── setup.js
    │   ├── auth.test.js
    │   └── booking.test.js
    ├── data/                       # JSON seed files
    ├── scripts/                    # Utility scripts
    ├── uploads/
    ├── .env.example
    └── index.js
```

---

## Phân Quyền

| Role | Quyền truy cập |
|---|---|
| `owner` | Toàn quyền — xem và quản lý tất cả chi nhánh |
| `admin` | Quản lý đầy đủ — chỉ thấy dữ liệu chi nhánh được gán |
| `ktv` | Xem lịch, cập nhật trạng thái booking được phân công |

JWT payload chứa `managedBranches[]` — middleware `branchCheck` tự động lọc dữ liệu theo chi nhánh tại controller level, không cần frontend xử lý.

---

## Bảo Mật

- **Authentication**: JWT 24h expiry, verify trên mọi route admin
- **Authorization**: `checkRole(['owner', 'admin'])` — RBAC tường minh từng route
- **Rate Limiting**: 4 tầng — global API limiter, booking limiter, auth limiter, destructive action limiter
- **Input Validation**: Joi schema validate toàn bộ endpoint nhận body (POST/PUT)
- **CORS**: Whitelist cứng — chỉ chấp nhận origin từ biến môi trường `CLIENT_URL`
- **Password**: bcrypt hash, không lưu plain text
- **Data Isolation**: Multi-branch — admin chỉ đọc/ghi dữ liệu chi nhánh của mình
- **Audit Log**: Ghi lại mọi hành động quan trọng kèm IP + user agent

---

## Deploy

### Backend — Render.com

| Trường | Giá trị |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment Variables | `MONGO_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL` |

### Frontend — Vercel.com

| Trường | Giá trị |
|---|---|
| Root Directory | `client` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | `VITE_API_URL` = URL backend Render |

> `client/vercel.json` đã cấu hình rewrite toàn bộ route về `index.html` để React Router hoạt động đúng trên Vercel.

---

## Database

MongoDB Atlas — 18 collections:

`bookings` · `staffs` · `rooms` · `beds` · `branches` · `services` · `invoices` · `customers` · `promotions` · `promotionusages` · `users` · `feedbacks` · `actionlogs` · `waitlists` · `consultations` · `galleries` · `expenses` · `transactions`
