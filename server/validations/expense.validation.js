const Joi = require('joi');

// Schema cho POST /expenses (Lập phiếu chi)
const createExpenseSchema = Joi.object({
    reason: Joi.string().trim().min(2).max(500).required()
        .messages({
            'string.min': 'Nội dung chi tối thiểu 2 ký tự',
            'any.required': 'Nội dung chi là bắt buộc',
        }),
    amount: Joi.number().min(1).required()
        .messages({
            'number.min': 'Số tiền phải lớn hơn 0',
            'any.required': 'Số tiền là bắt buộc',
        }),
    paymentMethod: Joi.string().valid('cash', 'banking', 'card', 'momo').optional(),
    category:      Joi.string().max(100).allow('', null).optional(),
    note:          Joi.string().max(500).allow('', null).optional(),
    date:          Joi.date().optional(),
});

module.exports = { createExpenseSchema };
