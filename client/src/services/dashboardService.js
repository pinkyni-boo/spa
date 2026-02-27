import API_URL from '../config/api.js';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const dashboardService = {
    // Get dashboard statistics
    getStats: async () => {
        try {
            const response = await fetch(`${API_URL}/api/dashboard/stats`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Get revenue chart data
    getRevenueChart: async (period = 'week') => {
        try {
            const response = await fetch(`${API_URL}/api/dashboard/revenue-chart?period=${period}`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching revenue chart:', error);
            throw error;
        }
    },

    // Get top services
    getTopServices: async () => {
        try {
            const response = await fetch(`${API_URL}/api/dashboard/top-services`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching top services:', error);
            throw error;
        }
    },

    // Get staff status
    getStaffStatus: async () => {
        try {
            const response = await fetch(`${API_URL}/api/dashboard/staff-status`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching staff status:', error);
            throw error;
        }
    },

    // Get Staff Performance
    getStaffPerformance: async (startDate, endDate) => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`${API_URL}/api/dashboard/staff-performance?${params.toString()}`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching staff performance:', error);
            throw error;
        }
    },

    // [NEW] Get Occupancy Rate
    getOccupancyRate: async (date) => {
        try {
            const url = date 
                ? `${API_URL}/api/dashboard/occupancy-rate?date=${date}`
                : `${API_URL}/api/dashboard/occupancy-rate`;
                
            const response = await fetch(url, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching occupancy rate:', error);
            throw error;
        }
    }
};
