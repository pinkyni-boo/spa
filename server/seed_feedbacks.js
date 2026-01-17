const mongoose = require('mongoose');
const Feedback = require('./models/Feedback');

const MONGO_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const seedFeedbacks = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Create sample feedbacks
        const feedbacks = [
            {
                customerName: 'Nguyễn Thu Hà',
                customerPhone: '0901234567',
                customerEmail: 'thuha@gmail.com',
                rating: 5,
                comment: 'Không gian sang trọng tuyệt đối. Cảm giác da căng bóng ngay sau buổi đầu tiên. Rất hài lòng với sự chuyên nghiệp này.',
                images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                status: 'approved'
            },
            {
                customerName: 'Trần Bảo Ngọc',
                customerPhone: '0901234568',
                customerEmail: 'baongoc@gmail.com',
                rating: 5,
                comment: 'Dịch vụ đẳng cấp, nhân viên chu đáo nhẹ nhàng. Một trải nghiệm trọn vẹn sự thư thái tại MIU SPA.',
                images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                status: 'approved'
            },
            {
                customerName: 'Lê Minh Anh',
                customerPhone: '0901234569',
                customerEmail: 'minhanh@gmail.com',
                rating: 5,
                comment: 'Da bật tông rõ rệt. Không gian MIU SPA thực sự khiến mình choáng ngợp vì sự tinh tế và ấm cúng.',
                images: ['https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                status: 'approved'
            },
            {
                customerName: 'Phạm Thanh Hằng',
                customerPhone: '0901234570',
                customerEmail: 'thanhhang@gmail.com',
                rating: 5,
                comment: 'Sản phẩm xịn, kỹ thuật viên tay nghề cao. Luôn an tâm khi gửi gắm làn da của mình tại đây.',
                images: ['https://images.unsplash.com/photo-1600334089648-b0d9c3024ea2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
                status: 'approved'
            },
            {
                customerName: 'Hoàng Minh Tuấn',
                customerPhone: '0901234571',
                customerEmail: 'minhtuan@gmail.com',
                rating: 4,
                comment: 'Dịch vụ tốt, không gian đẹp. Sẽ quay lại lần sau.',
                images: [],
                status: 'pending'
            },
            {
                customerName: 'Vũ Thị Mai',
                customerPhone: '0901234572',
                customerEmail: 'thimai@gmail.com',
                rating: 3,
                comment: 'Giá hơi cao so với mặt bằng chung.',
                images: [],
                status: 'rejected'
            }
        ];

        // Clear existing feedbacks
        await Feedback.deleteMany({});
        console.log('🗑️ Cleared existing feedbacks');

        // Insert new feedbacks
        const createdFeedbacks = await Feedback.insertMany(feedbacks);
        console.log(`✅ Created ${createdFeedbacks.length} feedbacks`);

        console.log('\n💬 Sample Feedbacks:');
        createdFeedbacks.forEach((fb, index) => {
            console.log(`${index + 1}. ${fb.customerName} - ${fb.rating}⭐`);
            console.log(`   📝 ${fb.comment.substring(0, 60)}...`);
            console.log(`   📊 Status: ${fb.status}`);
            console.log('');
        });

        console.log('🎉 Seed complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👉 Vào trang Feedback để xem:');
        console.log('   http://localhost:5173/feedback');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedFeedbacks();
