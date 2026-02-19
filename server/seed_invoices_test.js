/**
 * Seed test Invoice data cho Báo Cáo Doanh Thu
 * Tạo 30 invoice giả rải 30 ngày qua
 * Run: node seed_invoices_test.js
 */
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
    .then(() => console.log('✅ Kết nối MongoDB'))
    .catch(e => { console.error(e); process.exit(1); });

const Invoice = require('./models/Invoice');
const Branch = require('./models/Branch');

const SERVICES = [
    'Massage body toàn thân', 'Chăm sóc da mặt', 'Chăm sóc da đầu',
    'Tắm trắng', 'Triệt lông', 'Đắp mặt nạ collagen', 'Thư giãn foot spa',
    'Massage đầu', 'Gội đầu dưỡng sinh', 'Nâng cơ trẻ hóa da',
];
const CUSTOMERS = [
    { name: 'Nguyễn Thị Lan', phone: '0901111111' },
    { name: 'Trần Thị Mai', phone: '0902222222' },
    { name: 'Lê Thị Hoa', phone: '0903333333' },
    { name: 'Phạm Thị Thu', phone: '0904444444' },
    { name: 'Hoàng Thị Yến', phone: '0905555555' },
    { name: 'Vũ Thị Nga', phone: '0906666666' },
    { name: 'Đặng Thị Bích', phone: '0907777777' },
    { name: 'Bùi Thị Linh', phone: '0908888888' },
];
const STAFF = ['Ngọc Thảo', 'Thanh Hương', 'Minh Ngọc', 'Kim Anh', 'Bảo Châu'];
const PAYMENT_METHODS = ['cash', 'banking', 'card'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seed() {
    try {
        // Lấy branchId đầu tiên
        const branch = await Branch.findOne().lean();
        const branchId = branch?._id || null;
        if (!branchId) console.warn('⚠️  Không tìm thấy branch, invoice sẽ không có branchId');

        const invoices = [];
        const today = new Date();

        for (let daysAgo = 0; daysAgo <= 29; daysAgo++) {
            // Mỗi ngày tạo 2-6 invoice
            const numInvoices = randInt(2, 6);
            for (let i = 0; i < numInvoices; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - daysAgo);
                date.setHours(randInt(9, 20), randInt(0, 59), 0, 0);

                const cust = rand(CUSTOMERS);
                const serviceName = rand(SERVICES);
                const servicePrice = randInt(1, 6) * 100000; // 100k - 600k
                const tipAmount = Math.random() < 0.3 ? randInt(1, 5) * 10000 : 0; // 30% có tip
                const surchargeFee = Math.random() < 0.2 ? randInt(5, 20) * 1000 : 0; // 20% có phí thẻ
                const paymentMethod = rand(PAYMENT_METHODS);
                const finalTotal = servicePrice + tipAmount + surchargeFee;

                invoices.push({
                    customerName: cust.name,
                    phone: cust.phone,
                    items: [{ type: 'service', name: serviceName, price: servicePrice, qty: 1, subtotal: servicePrice }],
                    cashierName: rand(STAFF),
                    subTotal: servicePrice,
                    tax: 0,
                    discount: 0,
                    tipAmount,
                    surchargeFee,
                    finalTotal,
                    paymentMethod,
                    branchId,
                    note: '[TEST]',
                    createdAt: date,
                    updatedAt: date,
                });
            }
        }

        // Xóa invoice test cũ (có note = [TEST])
        const deleted = await Invoice.deleteMany({ note: '[TEST]' });
        console.log(`🗑  Đã xóa ${deleted.deletedCount} invoice test cũ`);

        // Dùng native driver để giữ nguyên createdAt
        const result = await Invoice.collection.insertMany(
            invoices.map(i => ({ ...i, _id: new mongoose.Types.ObjectId() }))
        );
        console.log(`✅ Đã tạo ${result.insertedCount} invoice test (30 ngày qua)`);
        console.log(`   Branch: ${branchId || 'none'}`);
        console.log(`   Tổng doanh thu: ${invoices.reduce((s, i) => s + i.finalTotal, 0).toLocaleString('vi-VN')}đ`);
    } catch (e) {
        console.error('❌ Lỗi:', e.message);
    } finally {
        mongoose.disconnect();
    }
}

seed();
