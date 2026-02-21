const Joi = require('joi');

// Schema cho POST /consultations (public — khách tự điền form)
const createConsultationSchema = Joi.object({
    customerName: Joi.string().trim().min(2).max(100).required()
        .messages({
            'string.min': 'Họ tên tối thiểu 2 ký tự',
            'any.required': 'Họ tên là bắt buộc',
        }),
    phone: Joi.string().pattern(/^[0-9]{9,11}$/).required()
        .messages({
            'string.pattern.base': 'Số điện thoại phải gồm 9–11 chữ số',
            'any.required': 'Số điện thoại là bắt buộc',
        }),
    concern: Joi.string().trim().min(5).max(1000).required()
        .messages({
            'string.min': 'Nội dung tư vấn tối thiểu 5 ký tự',
            'any.required': 'Nội dung tư vấn là bắt buộc',
        }),
    email:           Joi.string().email({ tlds: { allow: false } }).allow('', null).optional()
        .messages({ 'string.email': 'Email không đúng định dạng' }),
    serviceInterest: Joi.string().max(200).allow('', null).optional(),
    preferredDate:   Joi.string().max(100).allow('', null).optional(),
    preferredBranch: Joi.string().hex().length(24).allow(null, '').optional(),
    branchId:        Joi.string().hex().length(24).allow(null, '').optional(),
});

module.exports = { createConsultationSchema };
