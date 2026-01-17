const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const branchService = {
    // Get all branches
    getAllBranches: async () => {
        try {
            const response = await fetch(`${API_URL}/api/branches`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching branches:', error);
            throw error;
        }
    },

    // Get single branch
    getBranch: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/branches/${id}`);
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
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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
                method: 'DELETE'
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
            const response = await fetch(`${API_URL}/api/branches/${id}/stats`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching branch stats:', error);
            throw error;
        }
    }
};
