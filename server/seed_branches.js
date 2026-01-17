const mongoose = require('mongoose');
const Branch = require('./models/Branch');

const MONGO_URI = 'mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project';

const seedBranches = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Create sample branches
        const branches = [
            {
                name: 'MIU SPA - Quận 1',
                address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
                phone: '0901234567',
                email: 'q1@miuspa.com',
                status: 'active',
                manager: {
                    name: 'Nguyễn Văn A',
                    phone: '0987654321'
                },
                operatingHours: {
                    open: '08:00',
                    close: '22:00'
                }
            },
            {
                name: 'MIU SPA - Quận 3',
                address: '456 Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
                phone: '0901234568',
                email: 'q3@miuspa.com',
                status: 'active',
                manager: {
                    name: 'Trần Thị B',
                    phone: '0987654322'
                },
                operatingHours: {
                    open: '09:00',
                    close: '21:00'
                }
            },
            {
                name: 'MIU SPA - Bình Thạnh',
                address: '789 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP.HCM',
                phone: '0901234569',
                email: 'binhthanh@miuspa.com',
                status: 'active',
                manager: {
                    name: 'Lê Văn C',
                    phone: '0987654323'
                },
                operatingHours: {
                    open: '08:30',
                    close: '22:30'
                }
            }
        ];

        // Clear existing branches
        await Branch.deleteMany({});
        console.log('🗑️ Cleared existing branches');

        // Insert new branches
        const createdBranches = await Branch.insertMany(branches);
        console.log(`✅ Created ${createdBranches.length} branches`);

        console.log('\n📍 Sample Branches:');
        createdBranches.forEach((branch, index) => {
            console.log(`${index + 1}. ${branch.name}`);
            console.log(`   📍 ${branch.address}`);
            console.log(`   📞 ${branch.phone}`);
            console.log(`   👤 Manager: ${branch.manager.name}`);
            console.log(`   ⏰ ${branch.operatingHours.open} - ${branch.operatingHours.close}`);
            console.log('');
        });

        console.log('🎉 Seed complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👉 Vào Admin → Chi Nhánh để xem');
        console.log('   http://localhost:5173/admin/branches');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedBranches();
