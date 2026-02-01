const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const galleryService = {
    // Get all gallery items (optional filter by type)
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

    // Create new gallery item
    createGalleryItem: async (formData) => {
        try {
            const response = await fetch(`${API_URL}/api/gallery`, {
                method: 'POST',
                // No Content-Type header needed for FormData; browser sets it with boundary
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating gallery item:', error);
            return { success: false, message: 'Network error' };
        }
    },

    // Update gallery item
    updateGalleryItem: async (id, formData) => {
        try {
            const response = await fetch(`${API_URL}/api/gallery/${id}`, {
                method: 'PUT',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating gallery item:', error);
            return { success: false, message: 'Network error' };
        }
    },

    // Delete gallery item
    deleteGalleryItem: async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/gallery/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting gallery item:', error);
            return { success: false, message: 'Network error' };
        }
    }
};
