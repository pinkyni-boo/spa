// ĐỊA CHỈ SERVER (GỐC)
const API_URL = 'http://localhost:3000';

export const bookingService = {
  // 1. Hàm hỏi giờ trống
  checkAvailability: async (date, serviceName) => {
    try {
      // Gọi API: /api/availability?date=...&serviceName=...
      const response = await fetch(`${API_URL}/api/availability?date=${date}&serviceName=${encodeURIComponent(serviceName)}`);
      
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
      const response = await fetch(`${API_URL}/api/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Báo cho Server biết mình gửi JSON
        },
        body: JSON.stringify(bookingData), // Gói dữ liệu thành chuỗi JSON
      });

      const data = await response.json();
      return data; // Trả về { success: true/false, message: ... }
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối Server' };
    }
  }
};
