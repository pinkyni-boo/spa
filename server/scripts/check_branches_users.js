const mongoose = require('mongoose');
const Branch = require('../models/Branch');
const User = require('../models/User');

mongoose.connect('mongodb+srv://ngocthao:vuthingocthao%4020041611@cluster0.zunhnrf.mongodb.net/spa_project')
  .then(async () => {
    console.log('✅ Connected to DB');
    
    const branches = await Branch.find({});
    console.log('\n--- BRANCHES ---');
    branches.forEach(b => console.log(`[${b._id}] ${b.name}`));

    const users = await User.find({}).populate('managedBranches');
    console.log('\n--- USERS ---');
    users.forEach(u => {
        const branchNames = u.managedBranches.map(b => b.name).join(', ');
        console.log(`[${u._id}] ${u.username} (${u.role}) -> Manage: ${branchNames}`);
    });

    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
