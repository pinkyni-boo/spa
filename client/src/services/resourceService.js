const API_URL = 'http://localhost:3000/api';

export const resourceService = {
  // --- ROOMS ---
  getAllRooms: async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`);
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  },
  
  createRoom: async (data) => {
    try {
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
       return { success: false, message: 'Network error' };
    }
  },

  updateRoom: async (id, data) => {
    try {
       const response = await fetch(`${API_URL}/rooms/${id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
       return await response.json();
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
  },

  deleteRoom: async (id) => {
    try {
        const response = await fetch(`${API_URL}/rooms/${id}`, { method: 'DELETE' });
        return await response.json();
    } catch (error) {
        return { success: false, message: 'Network error' };
    }
  },

  // --- SERVICES (NEW PHASE 6) ---
  getAllServices: async () => {
      try {
          const response = await fetch(`${API_URL}/services`);
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  createService: async (data) => {
      try {
          const response = await fetch(`${API_URL}/services`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  updateService: async (id, data) => {
      try {
          const response = await fetch(`${API_URL}/services/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  deleteService: async (id) => {
      try {
          const response = await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  // --- STAFF ---
  getAllStaff: async () => {
      try {
          const response = await fetch(`${API_URL}/staff`);
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  },

  updateStaff: async (id, data) => {
      try {
          const response = await fetch(`${API_URL}/staff/${id}`, {
              method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(data)
          });
          return await response.json();
      } catch (error) {
          return { success: false, message: 'Network error' };
      }
  }
};
