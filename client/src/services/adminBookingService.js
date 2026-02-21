// ĐỊA CHỈ SERVER (GỐC)
const API_URL = 'http://localhost:3000';

// Helper for Auth Header
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const adminBookingService = {
  // 1. Lấy danh sách Booking (Có lọc)
  getAllBookings: async (filters = {}) => {
    try {
      // Xây dựng URL: /api/bookings?date=...&staffId=...&paymentStatus=...
      const params = new URLSearchParams();
      // Handle both old signature (date, status) and new object style
      const date = filters.date || (typeof filters === 'string' ? filters : null); // Backwards compat
      
      if (date) params.append('date', date);
      if (filters.status) params.append('status', filters.status);
      if (filters.staffId) params.append('staffId', filters.staffId);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.page)  params.append('page',  filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await fetch(`${API_URL}/api/bookings?${params.toString()}`, {
          headers: getAuthHeaders()
      });
      const data = await response.json();

      // [FIX] Prioritize new format { success: true, bookings: [...] }
      if (data.success && data.bookings) {
          return data; // Return entire object so frontend can check .success
      } else if (Array.isArray(data)) {
          // Legacy format - wrap it
          return { success: true, bookings: data };
      } else {
        return { success: false, bookings: [] };
      }
    } catch (error) {
      console.error('Lỗi Mạng:', error);
      return { success: false, bookings: [] };
    }
  },

  // 2. Tạo Booking thủ công
  createBooking: async (bookingData) => {
    try {
      const response = await fetch(`${API_URL}/api/bookings`, { // Fixed URL
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          ...bookingData, 
          source: 'offline'
        }) 
      });
      return await response.json();
    } catch (error) {
        console.error('Lỗi tạo booking:', error);
        return { success: false, message: 'Lỗi kết nối' };
    }
  },

  // [NEW] SEARCH BOOKINGS (Global)
  searchBookings: async (query) => {
      try {
          const response = await fetch(`${API_URL}/api/bookings/search?query=${encodeURIComponent(query)}`, {
              headers: getAuthHeaders()
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: error.message };
      }
  },

  // 3. Cập nhật Booking
  updateBooking: async (id, data) => {
    try {
        const response = await fetch(`${API_URL}/api/bookings/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: 'Lỗi kết nối' };
    }
  },

  // 4. Hủy Booking
  cancelBooking: async (id) => {
    try {
        // API Route: DELETE /api/bookings/:id
        // API Route: DELETE /api/bookings/:id
        const response = await fetch(`${API_URL}/api/bookings/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: 'Lỗi kết nối' };
    }
  },

  // [FIX] Add approve booking
  approveBooking: async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/bookings/${id}/approve`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: 'Lỗi kết nối' };
    }
  },

  // [FIX] Add complete booking
  completeBooking: async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/bookings/${id}/complete`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: 'Lỗi kết nối' };
    }
  },

  // 5. [PHASE 4] Check-in
  checkIn: async (id) => {
      try {
          const response = await fetch(`${API_URL}/api/bookings/${id}/check-in`, {
              method: 'POST',
              headers: getAuthHeaders()
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Lỗi kết nối Check-in' };
      }
  },

  // 6. [PHASE 4] Checkout (Create Invoice)
  createInvoice: async (invoiceData) => {
      try {
          const response = await fetch(`${API_URL}/api/invoices`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify(invoiceData)
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Lỗi kết nối Checkout' };
      }
  },

  // 7. [PHASE 4] Smart Upsell (Update Services)
  updateServices: async (id, data) => {
      try {
          const response = await fetch(`${API_URL}/api/bookings/${id}/services`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify(data)
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Lỗi kết nối Upsell' };
      }
  },

  // 8. [PHASE 4] Get Invoices (History/Detail)
  getInvoices: async (filters = {}) => {
      try {
          const params = new URLSearchParams();
          if (filters.date) params.append('date', filters.date);
          if (filters.bookingId) params.append('bookingId', filters.bookingId);

          const response = await fetch(`${API_URL}/api/invoices?${params.toString()}`, {
              headers: getAuthHeaders()
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Lỗi lấy hóa đơn' };
      }
  },

  // 9. [PHASE 5] CRM Search (Smart Suggestion)
  searchCustomers: async (query) => {
      try {
          const response = await fetch(`${API_URL}/api/customers/search?query=${query}`);
          return await response.json();
      } catch (error) {
          return { success: false, customers: [] };
      }
  },

  // 10. [PHASE 5] CRM History (Lookup)
  getCustomerHistory: async (phone) => {
      try {
          const response = await fetch(`${API_URL}/api/bookings?phone=${phone}`);
          return await response.json(); // Returns array of bookings
      } catch (error) {
          return [];
      }
  },

  // 11. [PHASE 5.3] Retail Products
  getServices: async () => {
    try {
        const response = await fetch(`${API_URL}/api/services`);
        return await response.json();
    } catch (error) {
        return [];
    }
  }
  ,

  // --- WAITLIST (NEW) ---
  addToWaitlist: async (data) => {
      try {
          const response = await fetch(`${API_URL}/api/waitlist`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: error.message };
      }
  },

  getWaitlist: async () => {
      try {
          const response = await fetch(`${API_URL}/api/waitlist`, {
              headers: getAuthHeaders()
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: error.message };
      }
  },

  // [NEW] CRM - Get Customer History
  getCustomerHistory: async (phone) => {
      try {
          const response = await fetch(`${API_URL}/api/bookings/history/${phone}`);
          const data = await response.json();
          return data.bookings || data || [];
      } catch (error) {
          console.error('Error fetching customer history:', error);
          return [];
      }
  },

  // [SMART ALERT] Find matching waitlist items for available slot
  findMatchingWaitlist: async (startTime, endTime, serviceName) => {
      try {
          const response = await fetch(`${API_URL}/api/bookings/find-waitlist-match`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ startTime, endTime, serviceName })
          });
          const data = await response.json();
          return data;
      } catch (error) {
          console.error('Error finding matching waitlist:', error);
          throw error;
      }
  },

  deleteWaitlist: async (id) => {
      try {
          const response = await fetch(`${API_URL}/api/waitlist/${id}`, {
              method: 'DELETE',
              headers: getAuthHeaders()
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: error.message };
      }
  }
};
