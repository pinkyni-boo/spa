/**
 * Integration Tests — Tạo Booking (Core Feature)
 *
 * Test validation layer và logic tạo booking cơ bản.
 * Dùng mongodb-memory-server — không đụng DB thật.
 */
const request  = require('supertest');
const mongoose = require('mongoose');
const { describe, it, beforeAll, afterAll, beforeEach, expect } = require('@jest/globals');
const { connect, clearDatabase, closeDatabase } = require('./setup');

// Models
const Service = require('../models/Service');
const Branch  = require('../models/Branch');
const Room    = require('../models/Room');

// App setup (dùng lại routing thật để test end-to-end validation)
const express   = require('express');
const apiRoutes = require('../routes/api');
const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

// -----------------------------------------------------------------
beforeAll(async () => await connect());
afterAll(async () => await closeDatabase());
beforeEach(async () => await clearDatabase());

// -----------------------------------------------------------------
// Helpers: tạo data cần thiết để booking hợp lệ
// -----------------------------------------------------------------
const createBranch = () => Branch.create({
    name: 'Test Branch',
    address: '123 Test St',
    phone: '0909000000',
    workingHours: { open: '09:00', close: '21:00' },
});

const createService = (branchId) => Service.create({
    name: 'Test Massage',
    price: 200000,
    duration: 60,
    category: 'Body',
    branchId,
});

// -----------------------------------------------------------------
// Test Suite
// -----------------------------------------------------------------
describe('POST /api/bookings — Validation Layer', () => {

    it('❌ Trả về 400 nếu thiếu phone', async () => {
        const branch  = await createBranch();
        const service = await createService(branch._id);
        const start   = new Date(Date.now() + 3600_000); // 1h sau
        const end     = new Date(Date.now() + 7200_000); // 2h sau

        const res = await request(app)
            .post('/api/bookings')
            .send({
                customerName: 'Nguyen Van A',
                // phone: thiếu cố ý
                serviceId: service._id.toString(),
                branchId:  branch._id.toString(),
                startTime: start.toISOString(),
                endTime:   end.toISOString(),
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.some(e => e.includes('Số điện thoại'))).toBe(true);
    });

    it('❌ Trả về 400 nếu phone sai định dạng', async () => {
        const branch  = await createBranch();
        const service = await createService(branch._id);
        const start   = new Date(Date.now() + 3600_000);
        const end     = new Date(Date.now() + 7200_000);

        const res = await request(app)
            .post('/api/bookings')
            .send({
                customerName: 'Nguyen Van A',
                phone: 'abc-not-a-phone',
                serviceId: service._id.toString(),
                branchId:  branch._id.toString(),
                startTime: start.toISOString(),
                endTime:   end.toISOString(),
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors.some(e => e.includes('điện thoại'))).toBe(true);
    });

    it('❌ Trả về 400 nếu thiếu branchId', async () => {
        const service = await createService(new mongoose.Types.ObjectId());
        const start   = new Date(Date.now() + 3600_000);
        const end     = new Date(Date.now() + 7200_000);

        const res = await request(app)
            .post('/api/bookings')
            .send({
                customerName: 'Nguyen Van A',
                phone: '0909123456',
                serviceId: service._id.toString(),
                // branchId: thiếu cố ý
                startTime: start.toISOString(),
                endTime:   end.toISOString(),
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors.some(e => e.includes('Chi nhánh'))).toBe(true);
    });

    it('❌ Trả về 400 nếu endTime trước startTime', async () => {
        const branch  = await createBranch();
        const service = await createService(branch._id);
        const start   = new Date(Date.now() + 7200_000); // 2h sau
        const end     = new Date(Date.now() + 3600_000); // 1h sau (trước start)

        const res = await request(app)
            .post('/api/bookings')
            .send({
                customerName: 'Nguyen Van A',
                phone: '0909123456',
                serviceId: service._id.toString(),
                branchId:  branch._id.toString(),
                startTime: start.toISOString(),
                endTime:   end.toISOString(),
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors.some(e => e.includes('kết thúc'))).toBe(true);
    });

    it('✅ Validation layer pass — lỗi nếu có là từ business logic (không phải Joi)', async () => {
        // Khi pass validation, request đến business logic (BookingService)
        // BookingService có thể trả 400 vì giờ/ngày không hợp lệ — nhưng lỗi ĐÓ KHÔNG có field "errors"
        // (Joi mới trả về "errors" array, business error chỉ trả "message")
        const branch  = await createBranch();
        const service = await createService(branch._id);
        const start   = new Date(Date.now() + 3600_000);
        const end     = new Date(Date.now() + 7200_000);

        const res = await request(app)
            .post('/api/bookings')
            .send({
                customerName: 'Nguyen Van A',
                phone: '0909123456',
                serviceId: service._id.toString(),
                branchId:  branch._id.toString(),
                startTime: start.toISOString(),
                endTime:   end.toISOString(),
            });

        // Đã qua lớp Joi validate — response KHÔNG có field "errors" (của Joi)
        // Nếu có lỗi thì là từ business logic (BookingService)
        expect(res.body.errors).toBeUndefined();
    });
});
