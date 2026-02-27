import API_URL from '../config/api.js';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const userService = {
    getAllUsers: async () => {
        const response = await fetch(`${API_URL}/api/users`, {
            headers: getAuthHeaders()
        });
        return await response.json();
    },

    createUser: async (data) => {
        const response = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    updateUser: async (id, data) => {
        const response = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    deleteUser: async (id) => {
        const response = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await response.json();
    }
};
