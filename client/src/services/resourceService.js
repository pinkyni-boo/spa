import API_URL from '../config/api.js';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const resourceService = {
  // --- ROOMS ---
  getAllRooms: async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
          headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  },

  // --- BEDS (MULTI-BED) ---
  getAllBeds: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const response = await fetch(`${API_URL}/api/beds${qs ? '?' + qs : ''}`, {
        headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  },
  createBed: async (data) => {
    try {
      const response = await fetch(`${API_URL}/api/beds`, {
        method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) { return { success: false, message: 'Network error' }; }
  },
  updateBed: async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/api/beds/${id}`, {
        method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) { return { success: false, message: 'Network error' }; }
  },
  deleteBed: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/beds/${id}`, {
        method: 'DELETE', headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) { return { success: false, message: 'Network error' }; }
  },
  autoCreateBeds: async (roomId) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms/${roomId}/auto-beds`, {
        method: 'POST', headers: getAuthHeaders()
      });
      return await response.json();
    } catch (error) { return { success: false, message: 'Network error' }; }
  },
  
  createRoom: async (data) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
       return { success: false, message: 'Network error' };
    }
  },

  updateRoom: async (id, data) => {
    try {
       const response = await fetch(`${API_URL}/api/rooms/${id}`, {
         method: 'PUT',
         headers: getAuthHeaders(),
         body: JSON.stringify(data)
       });
       return await response.json();
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
  },

  deleteRoom: async (id) => {
    try {
        const response = await fetch(`${API_URL}/api/rooms/${id}`, { 
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await response.json();
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
  },

  // --- SERVICES (NEW PHASE 6) ---
  getAllServices: async (type) => {
      try {
          let url = `${API_URL}/api/services`;
          if (type) url += `?type=${type}`;
          const response = await fetch(url);
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  createService: async (data) => {
      try {
          const response = await fetch(`${API_URL}/api/services`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify(data)
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  updateService: async (id, data) => {
      try {
          const response = await fetch(`${API_URL}/api/services/${id}`, {
              method: 'PUT',
              headers: getAuthHeaders(),
              body: JSON.stringify(data)
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  deleteService: async (id) => {
      try {
          const response = await fetch(`${API_URL}/api/services/${id}`, { 
              method: 'DELETE',
              headers: getAuthHeaders()
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  seedServices: async () => {
      try {
          const response = await fetch(`${API_URL}/api/services/seed`, { 
              method: 'POST',
              headers: getAuthHeaders()
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  // --- STAFF ---
  getAllStaff: async () => {
      try {
          const response = await fetch(`${API_URL}/api/staff`, {
              headers: getAuthHeaders()
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  createStaff: async (data) => {
      try {
          const response = await fetch(`${API_URL}/api/staff`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify(data)
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  updateStaff: async (id, data) => {
      try {
          const response = await fetch(`${API_URL}/api/staff/${id}`, {
              method: 'PUT',
               headers: getAuthHeaders(),
               body: JSON.stringify(data)
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  // Delete staff (Soft Delete)
  deleteStaff: async (id) => {
      try {
          const response = await fetch(`${API_URL}/api/staff/${id}`, {
              method: 'DELETE',
              headers: getAuthHeaders()
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  }
};
