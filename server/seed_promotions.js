const mongoose = require('mongoose');
const Promotion = require('./models/Promotion');

const MONGO_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const seedPromotions = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        // Create sample promotions
        const promotions = [
            {
                code: 'WELCOME10',
                name: 'Chào mừng khách hàng mới',
                type: 'percentage',
                value: 10,
                startDate: now,
                endDate: nextMonth,
                status: 'active',
                usageLimit: 100,
                perUserLimit: 1,
                minOrderValue: 200000,
                isFlashSale: false
            },
            {
                code: 'FLASH50',
                name: 'Flash Sale - Giảm 50%',
                type: 'percentage',
                value: 50,
                startDate: now,
                endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
                status: 'active',
                usageLimit: null,
                perUserLimit: 1,
                minOrderValue: 500000,
                isFlashSale: true,
                flashSaleStock: 20
            },
            {
                code: 'MASSAGE20',
                name: 'Giảm 20% dịch vụ Massage',
                type: 'percentage',
                value: 20,
                startDate: now,
                endDate: nextMonth,
                status: 'active',
                usageLimit: null,
                perUserLimit: 2,
                minOrderValue: 300000,
                isFlashSale: false
            },
            {
                code: 'SAVE100K',
                name: 'Giảm 100K cho đơn từ 1 triệu',
                type: 'fixed',
                value: 100000,
                startDate: now,
                endDate: nextMonth,
                status: 'active',
                usageLimit: 50,
                perUserLimit: 1,
                minOrderValue: 1000000,
                isFlashSale: false
            },
            {
                code: 'EXPIRED',
                name: 'Mã đã hết hạn (test)',
                type: 'percentage',
                value: 30,
                startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
                status: 'expired',
                usageLimit: 10,
                perUserLimit: 1,
                minOrderValue: 0,
                isFlashSale: false
            }
        ];

        // Clear existing promotions
        await Promotion.deleteMany({});
        console.log('🗑️ Cleared existing promotions');

        // Insert new promotions
        const createdPromotions = await Promotion.insertMany(promotions);
        console.log(`✅ Created ${createdPromotions.length} promotions`);

        console.log('\n🎁 Sample Promotions:');
        createdPromotions.forEach((promo, index) => {
            console.log(`${index + 1}. ${promo.code} - ${promo.name}`);
            console.log(`   💰 ${promo.type === 'percentage' ? `${promo.value}%` : `${promo.value.toLocaleString()} VNĐ`}`);
            console.log(`   📅 ${promo.startDate.toLocaleDateString()} - ${promo.endDate.toLocaleDateString()}`);
            if (promo.isFlashSale) {
                console.log(`   ⚡ FLASH SALE - Stock: ${promo.flashSaleStock}`);
            }
            console.log(`   📊 Status: ${promo.status}`);
            console.log('');
        });

        console.log('🎉 Seed complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👉 Vào Admin → Ưu Đãi để xem');
        console.log('   http://localhost:5173/admin/promotions');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedPromotions();
