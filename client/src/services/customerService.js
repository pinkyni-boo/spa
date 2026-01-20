const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const customerService = {
    // Search customers
    searchCustomers: async (query) => {
        try {
            const response = await fetch(`${API_URL}/api/customers/search?query=${encodeURIComponent(query)}`);
            return await response.json();
        } catch (error) {
            console.error('Error searching customers:', error);
            throw error;
        }
    },

    // Get customer history
    getCustomerHistory: async (phone) => {
        try {
            const response = await fetch(`${API_URL}/api/customers/${phone}/history`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching customer history:', error);
            throw error;
        }
    }
};
