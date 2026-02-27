import API_URL from '../config/api.js';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const customerService = {
    // Search customers
    searchCustomers: async (query) => {
        try {
            // [ISOLATION] Get User context
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            
            let url = `${API_URL}/api/customers/search?query=${encodeURIComponent(query)}`;
            
            // If Manager/Admin, append branchId
            if (user && user.role !== 'owner') {
                const branchId = user.branchId || (user.managedBranches?.[0]?._id || user.managedBranches?.[0]);
                if (branchId) {
                    url += `&branchId=${branchId}`;
                }
            }

            const response = await fetch(url, { headers: getAuthHeaders() });
            return await response.json();
        } catch (error) {
            console.error('Error searching customers:', error);
            throw error;
        }
    },

    // Get customer history
    getCustomerHistory: async (phone) => {
        try {
            // [ISOLATION] Get User context
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            let url = `${API_URL}/api/customers/${phone}/history`;
             // If Manager, append branchId
             if (user && user.role !== 'owner') {
                const branchId = user.branchId || (user.managedBranches?.[0]?._id || user.managedBranches?.[0]);
                if (branchId) {
                    url += `?branchId=${branchId}`;
                }
            }

            const response = await fetch(url, { headers: getAuthHeaders() });
            return await response.json();
        } catch (error) {
            console.error('Error fetching customer history:', error);
            throw error;
        }
    }
};
