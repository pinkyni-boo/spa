const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const branchService = {
    // Get all branches
    getAllBranches: async () => {
        try {
            const response = await fetch(`${API_URL}/api/branches`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching branches:', error);
            throw error;
        }
    },

    // Get single branch
    getBranch: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/branches/${id}`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching branch:', error);
            throw error;
        }
    },

    // Create branch
    createBranch: async (branchData) => {
        try {
            const response = await fetch(`${API_URL}/api/branches`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(branchData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error;
        }
    },

    // Update branch
    updateBranch: async (id, branchData) => {
        try {
            const response = await fetch(`${API_URL}/api/branches/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(branchData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating branch:', error);
            throw error;
        }
    },

    // Delete branch
    deleteBranch: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/branches/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting branch:', error);
            throw error;
        }
    },

    // Get branch statistics
    getBranchStats: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/branches/${id}/stats`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching branch stats:', error);
            throw error;
        }
    }
};
