# 🌸 Miu Spa — Frontend Client

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant%20Design-6-0170FE?style=flat-square&logo=antdesign&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)

Giao diện khách hàng + Admin Portal cho hệ thống quản lý spa đa chi nhánh. Build bằng Vite, component library Ant Design 6.

---

## Cài Đặt & Chạy

```bash
cd client
npm install
npm run dev     # http://localhost:5173
```

### Biến Môi Trường (`.env` trong thư mục `client/`)

```env
VITE_API_URL=http://localhost:3000
```

> Deploy lên Vercel: thay bằng URL Render của backend.

### Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Development server |
| `npm run build` | Build production → `dist/` |
| `npm run preview` | Preview bản build |
| `npm run lint` | Kiểm tra ESLint |

---

## Cấu Trúc Thư Mục

```
src/
├── Pages/
│   ├── Admin/                      # Admin Portal — 14 module
│   │   ├── BookingManager/         # ⭐ Calendar DnD theo phòng/giường
│   │   │   ├── DnDCalendarView.jsx
│   │   │   ├── BookingListView.jsx
│   │   │   ├── BookingDrawer.jsx
│   │   │   ├── WaitlistSidebar.jsx
│   │   │   └── CustomerInfoSidebar.jsx
│   │   ├── Payment/
│   │   │   └── InvoiceModal.jsx    # ⭐ Checkout: Tip + Mã giảm giá
│   │   ├── Dashboard/
│   │   ├── StaffManager/
│   │   ├── RoomManager/
│   │   ├── ServiceManager/
│   │   ├── BranchManager/
│   │   ├── PromotionManager/
│   │   ├── InvoiceManager/
│   │   ├── CustomerManager/
│   │   ├── ReportManager/          # ⭐ Sổ Quỹ + Biểu đồ Recharts
│   │   ├── FeedbackManager/
│   │   ├── AccountManager/
│   │   ├── SystemLogs/
│   │   └── ConsultationManager/
│   ├── Global/                     # Nav, Footer, ScrollToTop
│   ├── Home.jsx
│   ├── Service/ · Combo/ · Incentives/ · Feedback/
│   └── About.jsx · Policies.jsx · Careers.jsx
├── component/
│   ├── Booking/                    # Modal đặt lịch public
│   │   ├── Booking.jsx
│   │   └── BookingContext.jsx      # Global booking state (Context API)
│   └── Contact/ · Service/
├── services/                       # Fetch wrappers (không call API trực tiếp trong component)
│   ├── adminBookingService.js
│   ├── bookingService.js
│   ├── branchService.js
│   ├── resourceService.js
│   └── promotionService.js
├── context/
├── data/
├── theme.js                        # Design tokens: màu gold #D4AF37, font Be Vietnam Pro
├── App.jsx                         # Router config + layout switch Admin/Client
└── main.jsx
```

---

## Dependencies Chính

| Thư viện | Phiên bản | Mục đích |
|----------|-----------|----------|
| `react` | ^19.2.0 | UI Framework |
| `antd` | ^6.1.3 | Component Library |
| `react-big-calendar` | ^1.19.4 | Calendar resource view + DnD |
| `recharts` | ^3.6.0 | Biểu đồ thống kê |
| `react-router-dom` | ^7.11.0 | Client-side routing |
| `dayjs` | ^1.11.19 | Xử lý ngày giờ |

---

## Routing

| Route | Mô tả |
|-------|-------|
| `/` | Trang chủ |
| `/services` | Danh sách dịch vụ |
| `/service/:id` | Chi tiết dịch vụ |
| `/incentives` | Khuyến mãi |
| `/feedback` | Đánh giá khách hàng |
| `/login` | Đăng nhập admin |
| `/admin` | Dashboard admin |
| `/admin/bookings` | Quản lý đặt lịch |
| `/admin/staff` | Quản lý nhân viên |
| `/admin/reports` | Báo cáo & Sổ Quỹ |
| `/admin/invoices` | Hóa đơn |
| `/admin/logs` | Nhật ký hệ thống |

---

## Deploy — Vercel

| Trường | Giá trị |
|--------|---------|
| Root Directory | `client` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

`vercel.json` đã cấu hình sẵn rewrite về `index.html` cho React Router SPA:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

🔗 [Về thư mục gốc](../) · [Backend (server/)](../server/)
