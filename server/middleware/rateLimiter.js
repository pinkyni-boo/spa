const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware - Chống spam click
 * 
 * Phòng ngừa tấn công:
 * - Spam tạo booking liên tục
 * - Brute force login
 * - DDoS đơn giản
 */

// [STRICT] Auth endpoints (Login, Register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Tối đa 5 requests
    message: {
        success: false,
        message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// [MODERATE] Booking creation (Khách hàng công khai)
const bookingLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 phút
    max: 10, // Tối đa 10 booking
    message: {
        success: false,
        message: 'Bạn đã đặt quá nhiều lịch trong thời gian ngắn. Vui lòng chờ 5 phút.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip cho Admin/Owner (có JWT token)
    skip: (req) => {
        return req.user && (req.user.role === 'admin' || req.user.role === 'owner');
    }
});

// [LENIENT] General API (Cho Admin Panel)
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 100, // Tối đa 100 requests (Cho Admin làm việc bình thường)
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu. Vui lòng chờ 1 phút.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// [STRICT] Sensitive Actions (Xóa, Reset, Seed Data)
const destructiveLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 3, // Tối đa 3 lần/giờ
    message: {
        success: false,
        message: 'Thao tác nhạy cảm bị giới hạn. Vui lòng chờ.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    bookingLimiter,
    apiLimiter,
    destructiveLimiter
};
