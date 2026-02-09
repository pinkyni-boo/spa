const axios = require('axios');

// CONFIG
const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// CREDENTIALS (Use Owner to update Branch)
const OWNER_CREDENTIALS = { username: 'owner', password: '123' };

const log = (msg, type = 'info') => {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
    console.log(`${icons[type]} ${msg}`);
};

(async () => {
    console.log('\n🕰️  VERIFYING LEVEL 2: DYNAMIC WORKING HOURS 🕰️\n');
    let token;
    let branchId;
    let originalHours;

    try {
        // 1. LOGIN
        log('Logging in...', 'info');
        const loginRes = await axios.post(`${BASE_URL}/login`, OWNER_CREDENTIALS);
        token = loginRes.data.token;
        if (!token) throw new Error('No token');
        
        // 2. GET BRANCH (Bình Thạnh)
        log('Fetching Branch info...', 'info');
        const branchesRes = await axios.get(`${API_URL}/branches`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const branch = branchesRes.data.branches.find(b => b.name.includes('Bình Thạnh'));
        if (!branch) throw new Error('Branch Bình Thạnh not found');
        branchId = branch._id;
        originalHours = branch.workingHours;
        log(`Target Branch: ${branch.name} (Current: ${originalHours?.open || 'Default'} - ${originalHours?.close || 'Default'})`, 'info');

        // 3. UPDATE HOURS TO "NIGHT SHIFT" (18:00 - 23:00)
        log('Changing hours to NIGHT SHIFT (18:00 - 23:00)...', 'warn');
        await axios.put(`${API_URL}/branches/${branchId}`, {
            workingHours: { open: '18:00', close: '23:00' }
        }, { headers: { Authorization: `Bearer ${token}` } });

        // 4. TEST AVAILABILITY AT 10:00 AM (Should FAIL/Empty)
        log('Testing slot at 10:00 AM (Outside new hours)...', 'info');
        const check1 = await axios.post(`${API_URL}/bookings/check-slot`, {
            branchId,
            date: new Date().toISOString().split('T')[0],
            serviceName: 'Gội đầu dưỡng sinh' // Ensure this service exists or use ID if known, defaulting to text search which service checks
        });
        
        const slots1 = check1.data.availableSlots || [];
        // Should NOT contain 10:00
        if (slots1.includes('10:00')) {
            log('FAILED: Found 10:00 slot despite opening at 18:00!', 'error');
        } else {
            log('PASSED: No morning slots found.', 'success');
        }

        // 5. TEST AVAILABILITY AT 19:00 PM (Should PASS)
        log('Testing slot at 19:00 PM (Inside new hours)...', 'info');
        const check2 = await axios.post(`${API_URL}/bookings/check-slot`, {
            branchId,
            date: new Date().toISOString().split('T')[0],
            serviceName: 'Gội đầu dưỡng sinh'
        });
        
        const slots2 = check2.data.availableSlots || [];
        if (slots2.includes('19:00')) {
            log('PASSED: Found 19:00 slot!', 'success');
        } else {
            log('FAILED: 19:00 slot missing!', 'error');
            console.log('Available:', slots2);
        }

    } catch (error) {
        log(`Error: ${error.message}`, 'error');
        if (error.response) console.log(error.response.data);
    } finally {
        // 6. REVERT CONFIG
        if (token && branchId && originalHours) {
            log('Reverting hours to original...', 'warn');
            await axios.put(`${API_URL}/branches/${branchId}`, {
                workingHours: originalHours
            }, { headers: { Authorization: `Bearer ${token}` } });
            log('Cleanup Done.', 'success');
        }
    }
})();
