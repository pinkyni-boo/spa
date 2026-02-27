// ĐỊA CHỈ SERVER — production: VITE_API_URL từ Vercel env, local: fallback localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const bookingService = {
  // 1. Hàm hỏi giờ trống (UPDATED PHASE 2 SMART LOGIC)
  checkAvailability: async (date, serviceName, branchId) => {
    try {
      // Gọi API POST: /api/bookings/check-slot
      const response = await fetch(`${API_URL}/api/bookings/check-slot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, serviceName, branchId })
      });
      
      // Chờ Server trả lời và đọc kết quả
      const data = await response.json();
      
      if (data.success) {
        return data.availableSlots; // Trả về danh sách giờ [ '13:00', '14:00' ]
      } else {
        console.error('Lỗi Server:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Lỗi Mạng:', error);
      return [];
    }
  },

  // 2. Hàm gửi đơn đặt
  createBooking: async (bookingData) => {
    try {
      const response = await fetch(`${API_URL}/api/bookings`, { // Fixed URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối Server' };
    }
  }
};
