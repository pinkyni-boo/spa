/**
 * Joi Validation Middleware
 * Dùng chung cho tất cả route — trả 400 + danh sách lỗi rõ ràng nếu data không hợp lệ
 */
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, {
        abortEarly: false,   // Trả về TẤT CẢ lỗi, không dừng ở lỗi đầu tiên
        allowUnknown: true,  // Cho phép field dư (tránh break khi có extra data từ frontend)
        stripUnknown: false,
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: error.details.map((d) => d.message),
        });
    }

    next();
};

module.exports = validate;
