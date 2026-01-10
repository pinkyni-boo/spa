
async function verifyAdminActions() {
    console.log("🚀 Starting Admin Actions Test (Update & Cancel)...");
    
    // 1. Tạo đơn mới để test
    console.log("1. Creating a fresh booking...");
    const createRes = await fetch('http://localhost:3000/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customerName: "Test Update User",
            phone: "0999888777",
            serviceName: "Gội đầu dưỡng sinh",
            date: "2026-03-15",
            time: "10:00",
            source: "offline"
        })
    });
    
    const createData = await createRes.json();
    if (!createData.success) {
        console.error("❌ Failed to create booking:", createData.message);
        return;
    }
    const bookingId = "TODO_NEED_ID_FROM_DB"; 
    // Do API book trả về msg chứ ko trả về object, ta phải query lại để lấy ID
    // Cách nhanh: Query list bookings và lấy cái mới nhất
    
    const listRes = await fetch('http://localhost:3000/api/bookings');
    const listData = await listRes.json();
    const latestBooking = listData.bookings[0]; 
    console.log(`   > Created Booking ID: ${latestBooking._id}`);

    // 2. Test Sửa (Update)
    console.log("2. Testing Update (Change Time to 14:00)...");
    const updateRes = await fetch(`http://localhost:3000/api/bookings/${latestBooking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            time: "14:00",
            status: "confirmed"
        })
    });
    const updateData = await updateRes.json();
    console.log(`   > Update Status: ${updateRes.status} - ${updateData.message}`);

    // 3. Verify Update
    const verifyRes = await fetch('http://localhost:3000/api/bookings');
    const verifyData = await verifyRes.json();
    const updatedBooking = verifyData.bookings.find(b => b._id === latestBooking._id);
    const updatedHour = new Date(updatedBooking.startTime).getHours();
    
    if (updatedHour === 14 && updatedBooking.status === 'confirmed') {
        console.log("   ✅ Update Verify Passed!");
    } else {
        console.error("   ❌ Update Verification Failed. Hour:", updatedHour, "Status:", updatedBooking.status);
    }

    // 4. Test Hủy (Cancel)
    console.log("3. Testing Cancel...");
    const cancelRes = await fetch(`http://localhost:3000/api/bookings/${latestBooking._id}/cancel`, {
        method: 'PUT'
    });
    const cancelData = await cancelRes.json();
    console.log(`   > Cancel Status: ${cancelRes.status} - ${cancelData.message}`);

    // 5. Verify Cancel
    const finalRes = await fetch('http://localhost:3000/api/bookings');
    const finalData = await finalRes.json();
    const finalBooking = finalData.bookings.find(b => b._id === latestBooking._id);
    
    if (finalBooking.status === 'cancelled') {
        console.log("   ✅ Cancel Verify Passed!");
        console.log("🎉 TEST COMPLETED SUCCESSFULLY");
    } else {
        console.error("   ❌ Cancel Verification Failed. Status:", finalBooking.status);
    }
}

verifyAdminActions();
