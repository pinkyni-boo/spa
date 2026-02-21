const Joi = require('joi');

// Schema cho POST /bookings (public — khách đặt lịch)
const createBookingSchema = Joi.object({
    customerName: Joi.string().trim().min(2).max(100).required()
        .messages({
            'string.min': 'Tên khách hàng tối thiểu 2 ký tự',
            'any.required': 'Tên khách hàng là bắt buộc',
        }),
    phone: Joi.string().pattern(/^[0-9]{9,11}$/).required()
        .messages({
            'string.pattern.base': 'Số điện thoại phải gồm 9–11 chữ số',
            'any.required': 'Số điện thoại là bắt buộc',
        }),
    serviceId: Joi.string().hex().length(24).required()
        .messages({ 'any.required': 'Dịch vụ là bắt buộc' }),
    branchId: Joi.string().hex().length(24).required()
        .messages({ 'any.required': 'Chi nhánh là bắt buộc' }),
    startTime: Joi.date().required()
        .messages({ 'any.required': 'Thời gian bắt đầu là bắt buộc' }),
    endTime: Joi.date().min(Joi.ref('startTime')).required()
        .messages({
            'date.min': 'Thời gian kết thúc phải sau thời gian bắt đầu',
            'any.required': 'Thời gian kết thúc là bắt buộc',
        }),
    staffId:  Joi.string().hex().length(24).allow(null, '').optional(),
    roomId:   Joi.string().hex().length(24).allow(null, '').optional(),
    bedId:    Joi.string().hex().length(24).allow(null, '').optional(),
    note:     Joi.string().max(500).allow('', null).optional(),
    source:   Joi.string().valid('online', 'manual', 'offline').optional(),
}).options({ allowUnknown: true });

module.exports = { createBookingSchema };
