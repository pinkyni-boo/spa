/**
 * Integration Tests — Luồng Đăng Nhập (Login)
 *
 * Test không dùng DB thật — dùng mongodb-memory-server chạy trong RAM
 * Nguyên tắc: "Mỗi test phải độc lập, không được phụ thuộc vào thứ tự chạy"
 */
const request  = require('supertest');
const bcrypt   = require('bcryptjs');
const { describe, it, beforeAll, afterAll, beforeEach, expect } = require('@jest/globals');
const { connect, clearDatabase, closeDatabase } = require('./setup');

const express  = require('express');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');

const JWT_SECRET = 'miu_spa_secret_2024';

// -----------------------------------------------------------------
// Tạo mini-app chỉ cho login (không cần load toàn bộ server)
// -----------------------------------------------------------------
const app = express();
app.use(express.json());

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        const passwordMatch = user && (await bcrypt.compare(password, user.password));
        if (user && passwordMatch) {
            if (!user.isActive) return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa!' });
            const token = jwt.sign(
                { id: user._id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.json({ success: true, token, user: { username: user.username, role: user.role } });
        }
        res.status(401).json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server!', detail: error.message });
    }
});

// -----------------------------------------------------------------
// Test Suite
// -----------------------------------------------------------------
beforeAll(async () => await connect());
afterAll(async () => await closeDatabase());
beforeEach(async () => await clearDatabase());

describe('POST /login', () => {

    const createUser = async (username, password, role = 'admin', isActive = true) => {
        const hashed = await bcrypt.hash(password, 10);
        return User.create({ username, password: hashed, name: username, role, isActive });
    };

    it('✅ Đăng nhập thành công với đúng thông tin', async () => {
        await createUser('admin_test', 'password123');

        const res = await request(app)
            .post('/login')
            .send({ username: 'admin_test', password: 'password123' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.username).toBe('admin_test');
    });

    it('❌ Trả về 401 khi sai mật khẩu', async () => {
        await createUser('admin_test', 'correctPassword');

        const res = await request(app)
            .post('/login')
            .send({ username: 'admin_test', password: 'wrongPassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.token).toBeUndefined();
    });

    it('❌ Trả về 401 khi username không tồn tại', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'khongtontai', password: 'anypassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('❌ Trả về 403 khi tài khoản bị khóa (isActive = false)', async () => {
        await createUser('locked_user', 'password123', 'admin', false);

        const res = await request(app)
            .post('/login')
            .send({ username: 'locked_user', password: 'password123' });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain('bị khóa');
    });

    it('✅ JWT trả về có thể decode và chứa đúng thông tin', async () => {
        await createUser('owner_test', 'securePass', 'owner');

        const res = await request(app)
            .post('/login')
            .send({ username: 'owner_test', password: 'securePass' });

        expect(res.statusCode).toBe(200);
        const decoded = jwt.verify(res.body.token, JWT_SECRET);
        expect(decoded.username).toBe('owner_test');
        expect(decoded.role).toBe('owner');
        expect(decoded.exp).toBeGreaterThan(Date.now() / 1000); // Chưa hết hạn
    });
});
