// Native fetch in Node 18+

async function test() {
  try {
    console.log('Testing GET /api/bookings...');
    const res = await fetch('http://localhost:3000/api/bookings');
    console.log(`Status: ${res.status}`);
    if (res.status === 200) {
      const data = await res.json();
      console.log('Success:', data.success);
      console.log('Bookings count:', data.bookings ? data.bookings.length : 0);
    } else {
      console.log('Failed status');
      const text = await res.text();
      console.log(text.substring(0, 100));
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test();
