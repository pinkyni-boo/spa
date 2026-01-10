
async function verifyRaceCondition() {
    console.log("🚀 Starting Race Condition Test...");
    
    // 1. Setup Data
    const bookingData = {
        customerName: "Test User",
        phone: "0123456789",
        serviceName: "Massage Body Thụy Điển",
        date: "2026-02-20", // Chọn ngày xa xa để tránh trùng lịch thật
        time: "09:00"
    };

    // 2. Prepare 10 concurrent requests
    const requests = [];
    for (let i = 0; i < 10; i++) {
        requests.push(
            fetch('http://localhost:3000/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...bookingData, customerName: `Test User ${i}` })
            }).then(async res => ({
                status: res.status,
                json: await res.json()
            }))
        );
    }

    // 3. Fire!
    console.log("🔥 Firing 10 requests simultaneously...");
    const results = await Promise.all(requests);

    // 4. Analyze
    let successCount = 0;
    let conflictCount = 0;
    let errorCount = 0;

    results.forEach((r, idx) => {
        if (r.status === 200) successCount++;
        else if (r.status === 409) conflictCount++; // 409 Conflict (Expected for overlaps)
        else errorCount++;
        
        console.log(`req[${idx}]: Status ${r.status} - ${r.json.message}`);
    });

    console.log("\n--- RESULT ---");
    console.log(`✅ Success: ${successCount}`);
    console.log(`🛡️ Blocked (Conflict): ${conflictCount}`);
    console.log(`❌ Error: ${errorCount}`);

    if (conflictCount > 0) {
        console.log("🎉 TEST PASSED: System successfully blocked overlapping requests!");
    } else {
        console.log("⚠️ TEST WARNING: No conflicts detected. Either we have >10 staff or the lock didn't work.");
    }
}

verifyRaceCondition();
