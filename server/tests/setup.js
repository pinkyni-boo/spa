/**
 * Test Setup — dùng MongoDB in-memory để test không đụng DB thật
 * mongodb-memory-server tạo DB ảo trong RAM, xóa sau khi test xong
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

/**
 * Khởi động in-memory MongoDB trước khi chạy test suite
 */
const connect = async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
};

/**
 * Xóa toàn bộ data giữa các test (mỗi test case bắt đầu clean)
 */
const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

/**
 * Đóng kết nối và tắt MongoDB in-memory sau khi test xong
 */
const closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
};

module.exports = { connect, clearDatabase, closeDatabase };
