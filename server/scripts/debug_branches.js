const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const CREDENTIALS = { username: 'd', password: '12' }; // Admin Q1

(async () => {
    try {
        console.log('1. Logging in as "d"...');
        const login = await axios.post(`${BASE_URL}/login`, CREDENTIALS);
        const token = login.data.token;
        console.log('   Token:', token ? 'OK' : 'MISSING');

        console.log('2. Fetching Branches...');
        const res = await axios.get(`${BASE_URL}/api/branches`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('   Status:', res.status);
        console.log('   Data:', JSON.stringify(res.data, null, 2));

        if (res.data.branches?.length === 0) {
            console.log('❌ ERROR: API returned 0 branches!');
        } else {
            console.log(`✅ SUCCESS: API returned ${res.data.branches.length} branches.`);
        }

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        if (error.response) console.error('   Response:', error.response.data);
    }
})();
