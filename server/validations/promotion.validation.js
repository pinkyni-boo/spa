const Joi = require('joi');

// Schema cho POST /promotions
const createPromotionSchema = Joi.object({
    name: Joi.string().trim().min(2).max(200).required()
        .messages({ 'any.required': 'Tên khuyến mãi là bắt buộc' }),
    code: Joi.string().trim().uppercase().min(2).max(50).required()
        .messages({
            'string.min': 'Mã khuyến mãi tối thiểu 2 ký tự',
            'any.required': 'Mã khuyến mãi là bắt buộc',
        }),
    discountType: Joi.string().valid('percentage', 'fixed').required()
        .messages({ 'any.only': 'Loại giảm giá phải là percentage hoặc fixed' }),
    discountValue: Joi.number().min(0).required()
        .messages({
            'number.min': 'Giá trị giảm không được âm',
            'any.required': 'Giá trị giảm giá là bắt buộc',
        }),
    // Khi là percentage, không được vượt quá 100%
    maxDiscount: Joi.when('discountType', {
        is: 'percentage',
        then: Joi.number().min(0).optional(),
    }),
    startDate: Joi.date().optional(),
    endDate:   Joi.date().min(Joi.ref('startDate')).optional()
        .messages({ 'date.min': 'Ngày kết thúc phải sau ngày bắt đầu' }),
    usageLimit: Joi.number().integer().min(0).optional(),
    minOrderValue: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
}).options({ allowUnknown: true });

// Schema cho PUT /promotions/:id (tất cả optional)
const updatePromotionSchema = createPromotionSchema.fork(
    ['name', 'code', 'discountType', 'discountValue'],
    (field) => field.optional()
);

module.exports = { createPromotionSchema, updatePromotionSchema };
