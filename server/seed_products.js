const mongoose = require('mongoose');
const Service = require('./models/Service');

// Sample Products (Retail)
const PRODUCTS = [
    { name: 'Dầu Gội Thảo Dược (Chai)', price: 350000, duration: 0, type: 'product' },
    { name: 'Dầu Xả Phục Hồi (Chai)', price: 380000, duration: 0, type: 'product' },
    { name: 'Tinh Dầu Massage (Nhỏ)', price: 150000, duration: 0, type: 'product' },
    { name: 'Tinh Dầu Massage (Lớn)', price: 280000, duration: 0, type: 'product' },
    { name: 'Mặt Nạ Dưỡng Da (Gói)', price: 50000, duration: 0, type: 'product' },
    { name: 'Sữa Rửa Mặt Cao Cấp', price: 420000, duration: 0, type: 'product' },
    { name: 'Kem Dưỡng Ẩm Đêm', price: 550000, duration: 0, type: 'product' },
    { name: 'Combo Gội + Xả (Tiết kiệm)', price: 690000, duration: 0, type: 'product' },
];

mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
  .then(async () => {
    console.log('✅ Connected DB');
    
    // Check existing products to avoid dups
    let count = 0;
    for (const p of PRODUCTS) {
        // Find by name, update or insert
        await Service.findOneAndUpdate(
            { name: p.name }, 
            { ...p }, 
            { upsert: true, new: true }
        );
        console.log(`+ Upserted: ${p.name}`);
        count++;
    }

    console.log(`✅ Seed Complete. Added ${count} products.`);
    process.exit();
  })
  .catch(err => console.error(err));
