// ĐỊA CHỈ SERVER (GỐC)
const API_URL = 'http://localhost:3000';

export const adminBookingService = {
  // 1. Lấy danh sách Booking (Có lọc)
  getAllBookings: async (date = null, status = null) => {
    try {
      // Xây dựng URL: /api/bookings?date=...&status=...
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      if (status) params.append('status', status);

      const response = await fetch(`${API_URL}/api/bookings?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        return data.bookings;
      } else {
        console.error('Lỗi Server:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Lỗi Mạng:', error);
      return [];
    }
  },

  // 2. Tạo Booking thủ công (Mặc định source = offline)
  createBooking: async (bookingData) => {
    try {
      const response = await fetch(`${API_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...bookingData, 
          source: 'offline' // Đánh dấu là đặt thủ công
        }) 
      });
      return await response.json();
    } catch (error) {
        console.error('Lỗi tạo booking:', error);
        return { success: false, message: 'Lỗi kết nối' };
    }
  }
};
