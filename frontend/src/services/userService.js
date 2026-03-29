import { api } from './authService';

/**
 * User Service
 * Handles all user-related API calls for the Admin Panel
 */
const userService = {
    /**
     * Get all users
     * @returns {Promise<Object>} API response with users array
     */
    getAllUsers: async () => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching users.';
            throw new Error(message);
        }
    },

    /**
     * Get user by ID
     * @param {string} id User ID
     * @returns {Promise<Object>} API response with user object
     */
    getUserById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching user details.';
            throw new Error(message);
        }
    },

    /**
     * Create a new user
     * @param {Object} userData User information
     * @returns {Promise<Object>} API response
     */
    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error creating user.';
            throw new Error(message);
        }
    },

    /**
     * Update an existing user
     * @param {string} id User ID
     * @param {Object} userData Updated user information
     * @returns {Promise<Object>} API response
     */
    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating user.';
            throw new Error(message);
        }
    },

    /**
     * Delete a user
     * @param {string} id User ID
     * @returns {Promise<Object>} API response
     */
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error deleting user.';
            throw new Error(message);
        }
    }
};

export default userService;
