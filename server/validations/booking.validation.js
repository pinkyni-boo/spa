const Joi = require('joi');

// Schema cho POST /bookings (public — khách đặt lịch + admin tạo thủ công)
const createBookingSchema = Joi.object({
    customerName: Joi.string().trim().min(2).max(100).required()
        .messages({
            'string.min': 'Tên khách hàng tối thiểu 2 ký tự',
            'any.required': 'Tên khách hàng là bắt buộc',
        }),
    phone: Joi.when('source', {
        is: Joi.string().valid('offline'),
        then: Joi.string().pattern(/^[0-9]{9,11}$/).allow('', null).optional()
            .messages({ 'string.pattern.base': 'Số điện thoại phải gồm 9–11 chữ số' }),
        otherwise: Joi.string().pattern(/^[0-9]{9,11}$/).required()
            .messages({
                'string.pattern.base': 'Số điện thoại phải gồm 9–11 chữ số',
                'any.required': 'Số điện thoại là bắt buộc',
            }),
    }),
    serviceName: Joi.string().trim().min(1).required()
        .messages({ 'any.required': 'Dịch vụ là bắt buộc' }),
    branchId: Joi.string().hex().length(24).required()
        .messages({ 'any.required': 'Chi nhánh là bắt buộc' }),
    date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
        .messages({ 'any.required': 'Ngày đặt lịch là bắt buộc' }),
    time: Joi.string().pattern(/^\d{2}:\d{2}$/).required()
        .messages({ 'any.required': 'Giờ đặt lịch là bắt buộc' }),
    staffId:  Joi.string().hex().length(24).allow(null, '').optional(),
    serviceId: Joi.string().hex().length(24).allow(null, '').optional(),
    roomId:   Joi.string().hex().length(24).allow(null, '').optional(),
    bedId:    Joi.string().hex().length(24).allow(null, '').optional(),
    note:     Joi.string().max(500).allow('', null).optional(),
    source:   Joi.string().valid('online', 'manual', 'offline').optional(),
    status:   Joi.string().optional(),
}).options({ allowUnknown: true });

module.exports = { createBookingSchema };
