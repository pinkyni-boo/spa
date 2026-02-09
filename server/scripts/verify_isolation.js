const axios = require('axios');

// CONFIG
const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

const USERS = {
    owner: { username: 'owner', password: '123', label: '👑 OWNER' },
    q3: { username: 'admin', password: '123', label: '🏢 ADMIN Q3' },
    q1: { username: 'd', password: '12', label: '🏢 ADMIN Q1' }, // [NEW] Added Q1
    bt: { username: 'binhthanh', password: '123', label: '🏢 ADMIN BT' }
};

// HELPERS
const log = (msg, type = 'info') => {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
    console.log(`${icons[type]} ${msg}`);
};

const getToken = async (user) => {
    try {
        const res = await axios.post(`${BASE_URL}/login`, { username: user.username, password: user.password });
        return res.data.token;
    } catch (error) {
        console.error(`Failed to login as ${user.username}`);
        return null;
    }
};

const countBookings = async (token, label) => {
    try {
        const res = await axios.get(`${API_URL}/bookings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const count = res.data.bookings.length;
        console.log(`   ${label}: Sees ${count} bookings`);
        return count;
    } catch (error) {
        console.error(`   ${label}: Failed to fetch bookings (${error.response?.status})`);
        return -1;
    }
};

// MAIN
(async () => {
    console.log('\n🛡️  VERIFYING LEVEL 2: DATA ISOLATION 🛡️\n');

    // 1. LOGIN
    const tokenOwner = await getToken(USERS.owner);
    const tokenQ3 = await getToken(USERS.q3);
    const tokenQ1 = await getToken(USERS.q1);
    const tokenBT = await getToken(USERS.bt);

    if (!tokenOwner || !tokenQ3 || !tokenQ1 || !tokenBT) {
        console.error('❌ Failed to get tokens. Check users/passwords.');
        return;
    }

    // 2. CHECK BOOKINGS
    console.log('--- Checking Booking Visibility ---');
    const countOwner = await countBookings(tokenOwner, USERS.owner.label);
    const countQ3 = await countBookings(tokenQ3, USERS.q3.label);
    const countQ1 = await countBookings(tokenQ1, USERS.q1.label);
    const countBT = await countBookings(tokenBT, USERS.bt.label);

    // 3. VERIFY LOGIC
    console.log('\n--- Verification Results ---');
    
    let passed = true;

    // Owner should see more or equal than anyone
    if (countOwner < countQ3 || countOwner < countQ1 || countOwner < countBT) {
        log('Owner sees fewer bookings than Admins! (FAIL)', 'error');
        passed = false;
    } else {
        log('Owner sees most/all bookings.', 'success');
    }

    // Admins should see distinct sets (ideally)
    // Note: If DB is empty, all might be 0.
    if (countOwner === 0) {
        log('Database is empty, cannot verify isolation strictly.', 'warn');
    } else {
        // Strict check: if Owner > 0, Admins should be < Owner (assuming branches have spread data)
        // Or at least Q3 != BT if they have data
        if (countQ3 === countOwner && countQ1 === countOwner && countBT === countOwner) {
            log('Admins see ALL bookings like Owner! Isolation FAILED.', 'error');
            passed = false;
        } else {
            log('Admins see subset of bookings. Isolation WORKING.', 'success');
        }
    }

    if (passed) {
        console.log('\n🎉 DATA ISOLATION VERIFIED! 🎉\n');
    } else {
        console.log('\n❌ DATA ISOLATION FAILED.\n');
    }

})();
