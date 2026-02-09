const mongoose = require('mongoose');
const User = require('../models/User');
const Branch = require('../models/Branch');

mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
  .then(async () => {
    console.log('✅ Connected to DB');
    
    // 1. Find Branch 3
    const branch = await Branch.findOne({ name: /Bình Thạnh/i });
    if (!branch) {
        console.error('❌ Branch Bình Thạnh not found!');
        process.exit(1);
    }
    console.log(`Found Branch: ${branch.name} (${branch._id})`);

    // 2. Create User
    const username = 'binhthanh';
    const password = '123';
    
    // Check exist
    let user = await User.findOne({ username });
    if (user) {
        console.log('User already exists. Updating branch...');
        user.managedBranches = [branch._id];
        user.role = 'admin';
        await user.save();
    } else {
        console.log('Creating new user...');
        user = new User({
            username,
            password,
            name: 'Quản Lý Bình Thạnh',
            role: 'admin',
            managedBranches: [branch._id],
            isActive: true
        });
        await user.save();
    }
    
    console.log(`✅ User ${username} assigned to ${branch.name}`);
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
