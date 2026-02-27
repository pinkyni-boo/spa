import API_URL from '../config/api.js';

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const galleryService = {
    // Get all gallery items (optional filter by type) — public, no auth needed
    getAllGalleryItems: async (type) => {
        try {
            let url = `${API_URL}/api/gallery`;
            if (type) url += `?type=${type}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching gallery:', error);
            return { success: false, message: 'Network error' };
        }
    },

    // Create new gallery item — requires auth (FormData, no Content-Type)
    createGalleryItem: async (formData) => {
        try {
            const response = await fetch(`${API_URL}/api/gallery`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating gallery item:', error);
            return { success: false, message: 'Network error' };
        }
    },

    // Update gallery item — requires auth
    updateGalleryItem: async (id, formData) => {
        try {
            const response = await fetch(`${API_URL}/api/gallery/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating gallery item:', error);
            return { success: false, message: 'Network error' };
        }
    },

    // Delete gallery item — requires auth
    deleteGalleryItem: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/gallery/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting gallery item:', error);
            return { success: false, message: 'Network error' };
        }
    }
};
