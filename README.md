# Miu Spa - Fullstack Spa Management System

Ứng dụng quản lý spa đa chi nhánh gồm:
- Public website (xem dịch vụ, gửi tư vấn, đặt lịch)
- Admin portal (booking calendar, staff, rooms/beds, services, promotions, invoices, reports, logs)

## Tech stack

### Frontend
- React 19
- Vite 7 (rolldown-vite)
- Ant Design 6
- React Router DOM 7
- React Big Calendar
- Recharts
- Day.js

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- Joi validation
- JWT authentication + RBAC
- express-rate-limit
- multer upload

### Testing
- Jest
- Supertest
- mongodb-memory-server

---

## Repository structure

```text
spa/
├── client/                      # React frontend
│   ├── src/
│   │   ├── Pages/               # Public + Admin pages
│   │   ├── component/           # Shared/public components
│   │   ├── services/            # API service wrappers
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                      # Express backend
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── routes/
│   ├── validations/
│   ├── tests/
│   ├── index.js
│   └── package.json
└── README.md
```

---

## Core business modules

- Booking management (calendar, drag-drop, waitlist, check-in, payment)
- Multi-bed room scheduling
- Consultation intake and admin processing
- Promotion and discount workflows
- Invoice and retail invoice flows
- Branch isolation and role-based access
- Dashboard/reports and operational logs

---

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas (hoặc MongoDB local)

---

## Environment variables

### server/.env

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<db>
JWT_SECRET=your_secure_secret
PORT=3000
CLIENT_URL=http://localhost:5173
```

### client/.env (optional)

```env
VITE_API_URL=http://localhost:3000
```

---

## Run locally

### 1) Backend

```bash
cd server
npm install
npm run dev
```

Backend runs at http://localhost:3000

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at http://localhost:5173 (hoặc 5174 nếu 5173 bận)

---

## Scripts

### server/package.json

- npm run dev - start server with nodemon
- npm start - start server in production mode
- npm test - run test suite

### client/package.json

- npm run dev - start Vite dev server
- npm run build - production build
- npm run preview - preview production build
- npm run lint - run ESLint

---

## API overview

Base URL: http://localhost:3000/api

Main groups:
- /bookings
- /services
- /staff
- /rooms and /beds
- /promotions
- /invoices
- /consultations
- /reports
- /dashboard
- /logs

Auth:
- Login endpoint: POST /login
- Protected APIs use Authorization: Bearer <token>

---

## Security and architecture notes

- Joi request validation on create/update endpoints
- JWT auth + role checks (owner/admin/ktv)
- Branch-level data isolation via middleware
- Multi-layer rate limiting
- Action logs for sensitive operations

---

## Current maturity (quick assessment)

- Functional scope: rộng, sát nghiệp vụ vận hành thực tế
- Code difficulty: trung bình-khá (đặc biệt ở booking flow)
- Phù hợp cho thực tập sinh có mentor, học theo use-case
- Nên tăng thêm test integration cho các luồng critical trước production lớn
