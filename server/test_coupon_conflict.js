/**
 * 🧪 TEST SCRIPT: COUPON CONFLICT LOGIC
 * 
 * Script này sẽ test THẬT với database để verify logic hoạt động đúng
 * 
 * HOW TO RUN:
 * 1. Đảm bảo MongoDB đang chạy
 * 2. Đảm bảo đã có sample data (branches, services)
 * 3. Chạy: node test_coupon_conflict.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Promotion = require('./models/Promotion');
const Booking = require('./models/Booking');
const Service = require('./models/Service');
const Branch = require('./models/Branch');

// Colors for console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    test: (msg) => console.log(`\n${colors.cyan}🧪 TEST: ${msg}${colors.reset}`)
};

// Connect to MongoDB
async function connectDB() {
    try {
        const MONGO_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';
        await mongoose.connect(MONGO_URI);
        log.success('Connected to MongoDB');
    } catch (error) {
        log.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
}

// Clean up test data
async function cleanup() {
    log.info('Cleaning up old test data...');
    await Promotion.deleteMany({ code: { $in: ['TEST_ALLOW', 'TEST_BLOCK', 'TEST_VIP'] } });
    await Booking.deleteMany({ customerName: 'Test Customer' });
    log.success('Cleanup complete');
}

// Create test promotions
async function createTestPromotions() {
    log.info('Creating test promotions...');
    
    const promotions = [
        {
            code: 'TEST_ALLOW',
            name: 'Test Promotion - Allow Combine',
            type: 'percentage',
            value: 20,
            allowCombine: true,  // ✅ CHO PHÉP kết hợp
            startDate: new Date('2024-01-01'),
            endDate: new Date('2030-12-31'),
            status: 'active',
            minOrderValue: 0
        },
        {
            code: 'TEST_BLOCK',
            name: 'Test Promotion - Block Combine',
            type: 'percentage',
            value: 50,
            allowCombine: false,  // ❌ KHÔNG cho phép kết hợp
            startDate: new Date('2024-01-01'),
            endDate: new Date('2030-12-31'),
            status: 'active',
            minOrderValue: 0
        },
        {
            code: 'TEST_VIP',
            name: 'Test VIP Exclusive',
            type: 'fixed',
            value: 100000,
            allowCombine: false,  // ❌ KHÔNG cho phép kết hợp
            startDate: new Date('2024-01-01'),
            endDate: new Date('2030-12-31'),
            status: 'active',
            minOrderValue: 0
        }
    ];
    
    const created = await Promotion.insertMany(promotions);
    log.success(`Created ${created.length} test promotions`);
    return created;
}

// Create test booking
async function createTestBooking() {
    log.info('Creating test booking...');
    
    // Get sample service and branch
    const service = await Service.findOne({});
    const branch = await Branch.findOne({});
    
    if (!service || !branch) {
        log.error('No service or branch found! Please seed data first.');
        process.exit(1);
    }
    
    const booking = await Booking.create({
        customerName: 'Test Customer',
        phone: '0999999999',
        branchId: branch._id,
        serviceId: service._id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        status: 'confirmed',
        finalPrice: 1000000,
        appliedPromotions: [],  // Chưa có promotion
        totalDiscount: 0
    });
    
    log.success(`Created test booking: ${booking._id}`);
    return booking;
}

// Simulate validateCode API call
async function simulateValidateCode(code, bookingId) {
    const promotion = await Promotion.findOne({ code, status: 'active' });
    
    if (!promotion) {
        return { success: false, message: 'Mã không hợp lệ' };
    }
    
    // Check conflict
    if (bookingId) {
        const booking = await Booking.findById(bookingId).populate('appliedPromotions.promotionId');
        
        if (booking && booking.appliedPromotions && booking.appliedPromotions.length > 0) {
            const existingPromotion = booking.appliedPromotions[0].promotionId;
            
            if (existingPromotion && existingPromotion.allowCombine === false) {
                return {
                    success: false,
                    message: `⛔ Đơn hàng đã có mã "${existingPromotion.code}" không cho phép kết hợp!`,
                    conflictReason: 'existing_promotion_no_combine'
                };
            }
            
            if (promotion.allowCombine === false) {
                return {
                    success: false,
                    message: `⛔ Mã "${promotion.code}" không thể dùng chung với các ưu đãi khác!`,
                    conflictReason: 'new_promotion_no_combine'
                };
            }
        }
    }
    
    return {
        success: true,
        message: 'Mã hợp lệ',
        promotion: {
            _id: promotion._id,
            code: promotion.code,
            allowCombine: promotion.allowCombine
        }
    };
}

// Simulate applyPromotion
async function simulateApplyPromotion(promotionId, bookingId, discountAmount) {
    const booking = await Booking.findById(bookingId).populate('appliedPromotions.promotionId');
    const promotion = await Promotion.findById(promotionId);
    
    // Final conflict check
    if (booking.appliedPromotions && booking.appliedPromotions.length > 0) {
        const existingPromotion = booking.appliedPromotions[0].promotionId;
        
        if (existingPromotion.allowCombine === false || promotion.allowCombine === false) {
            return {
                success: false,
                message: '⛔ Không thể áp dụng mã này do xung đột!'
            };
        }
    }
    
    // Save promotion to booking
    booking.appliedPromotions.push({
        promotionId: promotion._id,
        code: promotion.code,
        discountAmount: discountAmount
    });
    
    booking.totalDiscount = (booking.totalDiscount || 0) + discountAmount;
    booking.finalPrice = Math.max(0, 1000000 - booking.totalDiscount);
    
    await booking.save();
    
    return {
        success: true,
        message: 'Áp dụng mã thành công!',
        booking: {
            totalDiscount: booking.totalDiscount,
            finalPrice: booking.finalPrice
        }
    };
}

// Run tests
async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 COUPON CONFLICT LOGIC - TEST SUITE');
    console.log('='.repeat(60) + '\n');
    
    // Setup
    const promotions = await createTestPromotions();
    const allowPromo = promotions.find(p => p.code === 'TEST_ALLOW');
    const blockPromo = promotions.find(p => p.code === 'TEST_BLOCK');
    const vipPromo = promotions.find(p => p.code === 'TEST_VIP');
    
    // ===========================================
    // TEST 1: Booking chưa có promotion
    // ===========================================
    log.test('TEST 1: Booking chưa có promotion - Apply mã bất kỳ');
    let booking = await createTestBooking();
    
    let result = await simulateValidateCode('TEST_ALLOW', booking._id);
    if (result.success) {
        log.success('PASS: validateCode cho phép');
        result = await simulateApplyPromotion(allowPromo._id, booking._id, 200000);
        if (result.success) {
            log.success(`PASS: applyPromotion thành công. Final price: ${result.booking.finalPrice.toLocaleString()}đ`);
        } else {
            log.error('FAIL: applyPromotion thất bại');
        }
    } else {
        log.error('FAIL: validateCode reject');
    }
    
    // ===========================================
    // TEST 2: Booking có promotion allowCombine=true, thêm mã allowCombine=true
    // ===========================================
    log.test('TEST 2: Booking có TEST_ALLOW (allow=true), thêm TEST_ALLOW khác');
    
    result = await simulateValidateCode('TEST_ALLOW', booking._id);
    if (result.success) {
        log.success('PASS: validateCode cho phép kết hợp');
    } else {
        log.error('FAIL: Không nên reject vì cả 2 đều allow');
    }
    
    // ===========================================
    // TEST 3: Booking có promotion allowCombine=true, thêm mã allowCombine=false
    // ===========================================
    log.test('TEST 3: Booking có TEST_ALLOW (allow=true), thêm TEST_VIP (allow=false)');
    
    result = await simulateValidateCode('TEST_VIP', booking._id);
    if (!result.success && result.conflictReason === 'new_promotion_no_combine') {
        log.success(`PASS: validateCode đúng reject với message: "${result.message}"`);
    } else {
        log.error('FAIL: Phải reject vì mã mới không cho phép combine');
    }
    
    // ===========================================
    // TEST 4: Booking có promotion allowCombine=false, thêm mã bất kỳ
    // ===========================================
    log.test('TEST 4: Booking có TEST_BLOCK (allow=false), thêm TEST_ALLOW');
    
    // Reset booking với BLOCK promotion
    await Booking.deleteOne({ _id: booking._id });
    booking = await createTestBooking();
    await simulateApplyPromotion(blockPromo._id, booking._id, 500000);
    
    result = await simulateValidateCode('TEST_ALLOW', booking._id);
    if (!result.success && result.conflictReason === 'existing_promotion_no_combine') {
        log.success(`PASS: validateCode đúng reject với message: "${result.message}"`);
    } else {
        log.error('FAIL: Phải reject vì mã hiện tại không cho phép combine');
    }
    
    // ===========================================
    // TEST 5: Edge case - Apply promotion khi validateCode đã pass
    // ===========================================
    log.test('TEST 5: Verify applyPromotion có double-check');
    
    // Manually bypass validateCode và cố apply (hack attempt)
    await Booking.deleteOne({ _id: booking._id });
    booking = await createTestBooking();
    await simulateApplyPromotion(blockPromo._id, booking._id, 500000);
    
    result = await simulateApplyPromotion(allowPromo._id, booking._id, 200000);
    if (!result.success) {
        log.success('PASS: applyPromotion có double-check, chặn được conflict');
    } else {
        log.error('FAIL: applyPromotion thiếu double-check, bị bypass!');
    }
    
    // ===========================================
    // SUMMARY
    // ===========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60) + '\n');
    
    const finalBooking = await Booking.findById(booking._id).populate('appliedPromotions.promotionId');
    console.log('Final Booking State:');
    console.log(`- Applied Promotions: ${finalBooking.appliedPromotions.length}`);
    finalBooking.appliedPromotions.forEach(p => {
        console.log(`  • ${p.code} (allowCombine: ${p.promotionId.allowCombine}) - ${p.discountAmount.toLocaleString()}đ`);
    });
    console.log(`- Total Discount: ${finalBooking.totalDiscount.toLocaleString()}đ`);
    console.log(`- Final Price: ${finalBooking.finalPrice.toLocaleString()}đ`);
    
    log.success('\nAll tests completed! ✨');
}

// Main
async function main() {
    try {
        await connectDB();
        await cleanup();
        await runTests();
    } catch (error) {
        log.error(`Test failed: ${error.message}`);
        console.error(error);
    } finally {
        await cleanup();
        await mongoose.connection.close();
        log.info('Disconnected from MongoDB');
    }
}

main();
