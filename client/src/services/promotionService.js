const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const promotionService = {
    // Get all promotions
    getAllPromotions: async () => {
        try {
            const response = await fetch(`${API_URL}/api/promotions`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching promotions:', error);
            throw error;
        }
    },

    // Get active promotions
    getActivePromotions: async () => {
        try {
            const response = await fetch(`${API_URL}/api/promotions/active`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching active promotions:', error);
            throw error;
        }
    },

    // [NEW] Suggest Promotions (Context Aware)
    suggestPromotions: async (orderValue, branchId) => {
        try {
            const response = await fetch(`${API_URL}/api/promotions/suggest`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ orderValue, branchId })
            });
            return await response.json();
        } catch (error) {
            console.error('Error suggesting promotions:', error);
            return { success: false, promotions: [] };
        }
    },

    // Create promotion
    createPromotion: async (promotionData) => {
        try {
            const response = await fetch(`${API_URL}/api/promotions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(promotionData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating promotion:', error);
            throw error;
        }
    },

    // Update promotion
    updatePromotion: async (id, promotionData) => {
        try {
            const response = await fetch(`${API_URL}/api/promotions/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(promotionData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating promotion:', error);
            throw error;
        }
    },

    // Delete promotion
    deletePromotion: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/promotions/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting promotion:', error);
            throw error;
        }
    },

    // Validate promotion code
    validateCode: async (code, orderValue, serviceId, branchId, customerPhone) => {
        try {
            const response = await fetch(`${API_URL}/api/promotions/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, orderValue, serviceId, branchId, customerPhone })
            });
            return await response.json();
        } catch (error) {
            console.error('Error validating code:', error);
            throw error;
        }
    },

    // Apply promotion
    applyPromotion: async (promotionId, bookingId, customerPhone, discountAmount) => {
        try {
            const response = await fetch(`${API_URL}/api/promotions/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promotionId, bookingId, customerPhone, discountAmount })
            });
            return await response.json();
        } catch (error) {
            console.error('Error applying promotion:', error);
            throw error;
        }
    }
};
