const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const userService = {
    getAllUsers: async () => {
        const response = await fetch(`${API_URL}/api/users`);
        return await response.json();
    },

    createUser: async (data) => {
        const response = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    updateUser: async (id, data) => {
        const response = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    deleteUser: async (id) => {
        const response = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }
};
