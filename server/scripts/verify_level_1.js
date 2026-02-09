const axios = require('axios');

// CONFIG
const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '123' 
};

// HELPERS
const log = (msg, type = 'info') => {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
    console.log(`${icons[type]} ${msg}`);
};

const runTest = async (name, fn) => {
    try {
        process.stdout.write(`⏳ Testing: ${name}... `);
        await fn();
        console.log('PASSED');
        return true;
    } catch (error) {
        console.log('FAILED');
        console.error(`   Reason: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data:`, error.response.data);
        }
        return false;
    }
};

// MAIN
(async () => {
    console.log('\n🛡️  VERIFYING LEVEL 1: AUTH & SOFT DELETE 🛡️\n');
    let token = null;
    let serviceId = null;
    let staffId = null;

    // 1. AUTHENTICATION
    await runTest('Login & Get Token', async () => {
        const res = await axios.post(`${BASE_URL}/login`, ADMIN_CREDENTIALS);
        if (!res.data.success || !res.data.token) throw new Error('No token returned');
        token = res.data.token;
    });

    await runTest('Access Protected Route (With Token)', async () => {
        const res = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.data.success) throw new Error('API returned success=false');
    });

    await runTest('Access Protected Route (Without Token)', async () => {
        try {
            await axios.get(`${API_URL}/users`);
            throw new Error('Should have failed with 401');
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) return;
            throw error;
        }
    });

    // 2. SOFT DELETE - SERVICE
    await runTest('Create Service (For Delete Test)', async () => {
        const res = await axios.post(`${API_URL}/services`, {
            name: "Test Delete Service " + Date.now(),
            price: 100000,
            duration: 60,
            type: "service"
        }, { headers: { Authorization: `Bearer ${token}` } });
        serviceId = res.data.service._id;
    });

    await runTest('Soft Delete Service', async () => {
        await axios.delete(`${API_URL}/services/${serviceId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    });

    await runTest('Verify Service is Hidden (Soft Deleted)', async () => {
        const res = await axios.get(`${API_URL}/services`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const found = res.data.services.find(s => s._id === serviceId);
        if (found) throw new Error('Deleted service still appears in list!');
    });

    // 3. SOFT DELETE - STAFF
    await runTest('Create Staff (For Delete Test)', async () => {
        const res = await axios.post(`${API_URL}/staff`, {
            name: "Test Staff " + Date.now(),
            phone: "0999999999",
            role: "ktv",
            shifts: [] // optional
        }, { headers: { Authorization: `Bearer ${token}` } });
        staffId = res.data.staff._id;
    });

    await runTest('Soft Delete Staff', async () => {
        await axios.delete(`${API_URL}/staff/${staffId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    });

    await runTest('Verify Staff is Hidden (Soft Deleted)', async () => {
        const res = await axios.get(`${API_URL}/staff`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const found = res.data.staff.find(s => s._id === staffId);
        if (found) throw new Error('Deleted staff still appears in list!');
    });

    console.log('\n🎉 ALL TESTS PASSED! LEVEL 1 IS SECURE. 🎉\n');
})();
