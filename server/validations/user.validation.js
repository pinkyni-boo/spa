const Joi = require('joi');

// Schema cho POST /users (tạo tài khoản)
const createUserSchema = Joi.object({
    username: Joi.string().trim().alphanum().min(3).max(30).required()
        .messages({
            'string.alphanum': 'Tên đăng nhập chỉ được chứa chữ và số',
            'string.min': 'Tên đăng nhập tối thiểu 3 ký tự',
            'any.required': 'Tên đăng nhập là bắt buộc',
        }),
    password: Joi.string().min(6).required()
        .messages({
            'string.min': 'Mật khẩu tối thiểu 6 ký tự',
            'any.required': 'Mật khẩu là bắt buộc',
        }),
    role: Joi.string().valid('admin', 'owner', 'ktv').required()
        .messages({ 'any.only': 'Vai trò không hợp lệ (admin / owner / ktv)' }),
    name: Joi.string().trim().min(2).max(100).optional(),
    branchId: Joi.string().hex().length(24).allow(null, '').optional(),
    managedBranches: Joi.array().optional(),
});

// Schema cho PUT /users/:id (cập nhật, password không bắt buộc)
const updateUserSchema = Joi.object({
    username: Joi.string().trim().alphanum().min(3).max(30).optional(),
    password: Joi.string().min(6).allow('', null).optional()
        .messages({ 'string.min': 'Mật khẩu tối thiểu 6 ký tự' }),
    role:     Joi.string().valid('admin', 'owner', 'ktv').optional(),
    name:     Joi.string().trim().min(2).max(100).optional(),
    branchId: Joi.string().hex().length(24).allow(null, '').optional(),
    managedBranches: Joi.array().optional(),
}).options({ allowUnknown: true });

module.exports = { createUserSchema, updateUserSchema };
