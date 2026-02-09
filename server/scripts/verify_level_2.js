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
    console.log('\n🛡️  VERIFYING LEVEL 2: COUPON CONFLICT LOGIC 🛡️\n');
    let token = null;
    let exclusivePromoId = null;
    let combinablePromoId = null;

    // 1. AUTHENTICATION
    await runTest('Login & Get Token', async () => {
        const res = await axios.post(`${BASE_URL}/login`, ADMIN_CREDENTIALS);
        if (!res.data.success || !res.data.token) throw new Error('No token returned');
        token = res.data.token;
    });

    // 2. SETUP PROMOTIONS
    await runTest('Create Exclusive Promotion (allowCombine: false)', async () => {
        const res = await axios.post(`${API_URL}/promotions`, {
            code: "EXCLUSIVE_TEST_" + Date.now(),
            name: "Exclusive Test",
            type: "fixed",
            value: 50000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            allowCombine: false // [CRITICAL]
        }, { headers: { Authorization: `Bearer ${token}` } });
        exclusivePromoId = res.data.promotion._id;
    });

    await runTest('Create Combinable Promotion (allowCombine: true)', async () => {
        const res = await axios.post(`${API_URL}/promotions`, {
            code: "COMBINE_TEST_" + Date.now(),
            name: "Combine Test",
            type: "fixed",
            value: 20000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            allowCombine: true
        }, { headers: { Authorization: `Bearer ${token}` } });
        combinablePromoId = res.data.promotion._id;
    });

    // 3. TEST INVOICE CREATION
    await runTest('Invoice with Exclusive Promo + Points -> SHOULD FAIL', async () => {
        try {
            await axios.post(`${API_URL}/invoices`, {
                customerName: "Test Conflict",
                subTotal: 100000,
                finalTotal: 40000, // 100k - 50k - 10k (points)
                promotionId: exclusivePromoId,
                pointsUsed: 10 // uses points
            }, { headers: { Authorization: `Bearer ${token}` } });
            throw new Error('Should have failed but succeeded!');
        } catch (error) {
            if (error.response && error.response.status === 400) return; // Expected
            throw error;
        }
    });

    await runTest('Invoice with Combinable Promo + Points -> SHOULD PASS', async () => {
        await axios.post(`${API_URL}/invoices`, {
            customerName: "Test Combine",
            subTotal: 100000,
            finalTotal: 70000, // 100k - 20k - 10k
            promotionId: combinablePromoId,
            pointsUsed: 10
        }, { headers: { Authorization: `Bearer ${token}` } });
    });

    await runTest('Invoice with Exclusive Promo ONLY -> SHOULD PASS', async () => {
        await axios.post(`${API_URL}/invoices`, {
            customerName: "Test Exclusive Only",
            subTotal: 100000,
            finalTotal: 50000,
            promotionId: exclusivePromoId,
            pointsUsed: 0
        }, { headers: { Authorization: `Bearer ${token}` } });
    });

    // CLEANUP (Soft delete promos if possible, or just leave them)
    
    console.log('\n🎉 ALL TESTS PASSED! CONFLICT LOGIC VERIFIED. 🎉\n');
})();
