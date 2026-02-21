/**
 * Script chạy 1 lần: Hash tất cả password plaintext trong DB
 * Chạy: node scripts/migrate_passwords.js
 *
 * Script này phát hiện password chưa được hash (không bắt đầu bằng $2b$)
 * và hash lại bằng bcryptjs. Chạy an toàn — tự bỏ qua user đã hash rồi.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Kết nối MongoDB thành công');

        const users = await User.find({}).select('+password');
        console.log(`📋 Tìm thấy ${users.length} tài khoản`);

        let migrated = 0;
        let skipped = 0;

        for (const user of users) {
            // bcrypt hash luôn bắt đầu bằng '$2b$' hoặc '$2a$'
            const alreadyHashed = user.password && (
                user.password.startsWith('$2b$') ||
                user.password.startsWith('$2a$')
            );

            if (alreadyHashed) {
                console.log(`  ⏭️  Bỏ qua "${user.username}" — đã hash`);
                skipped++;
                continue;
            }

            const hashed = await bcrypt.hash(user.password, 10);
            await User.updateOne({ _id: user._id }, { password: hashed });
            console.log(`  ✅ Đã hash password của "${user.username}"`);
            migrated++;
        }

        console.log(`\n🎉 Xong! Đã migrate: ${migrated}, Bỏ qua: ${skipped}`);
    } catch (err) {
        console.error('❌ Lỗi:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
