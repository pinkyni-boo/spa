import API_URL from '../config/api.js';

export const feedbackService = {
    // Get all feedbacks (admin)
    getAllFeedbacks: async () => {
        try {
            const response = await fetch(`${API_URL}/api/feedbacks`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            throw error;
        }
    },

    // Get approved feedbacks (public)
    getApprovedFeedbacks: async () => {
        try {
            const response = await fetch(`${API_URL}/api/feedbacks/approved`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching approved feedbacks:', error);
            throw error;
        }
    },

    // Create feedback
    createFeedback: async (feedbackData) => {
        try {
            const response = await fetch(`${API_URL}/api/feedbacks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating feedback:', error);
            throw error;
        }
    },

    // Approve feedback
    approveFeedback: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/feedbacks/${id}/approve`, {
                method: 'PUT'
            });
            return await response.json();
        } catch (error) {
            console.error('Error approving feedback:', error);
            throw error;
        }
    },

    // Reject feedback
    rejectFeedback: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/feedbacks/${id}/reject`, {
                method: 'PUT'
            });
            return await response.json();
        } catch (error) {
            console.error('Error rejecting feedback:', error);
            throw error;
        }
    },

    // Delete feedback
    deleteFeedback: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/feedbacks/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting feedback:', error);
            throw error;
        }
    }
};
