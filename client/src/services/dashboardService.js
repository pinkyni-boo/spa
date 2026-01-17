const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const dashboardService = {
    // Get dashboard statistics
    getStats: async () => {
        try {
            const response = await fetch(`${API_URL}/api/dashboard/stats`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Get revenue chart data
    getRevenueChart: async (period = 'week') => {
        try {
            const response = await fetch(`${API_URL}/api/dashboard/revenue-chart?period=${period}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching revenue chart:', error);
            throw error;
        }
    },

    // Get top services
    getTopServices: async () => {
        try {
            const response = await fetch(`${API_URL}/api/dashboard/top-services`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching top services:', error);
            throw error;
        }
    },

    // Get staff status
    getStaffStatus: async () => {
        try {
            const response = await fetch(`${API_URL}/api/dashboard/staff-status`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching staff status:', error);
            throw error;
        }
    }
};
