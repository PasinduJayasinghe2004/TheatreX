import { api } from './authService.js';

/**
 * Anaesthetist Service
 * Handles all anaesthetist-related API calls
 * Created by: M5 - Day 13
 */
const anaesthetistService = {
    /**
     * Get all anaesthetists
     */
    getAllAnaesthetists: async () => {
        try {
            const response = await api.get('/anaesthetists');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching anaesthetists. Please try again.';
            throw new Error(message);
        }
    },

    /**
     * Get available anaesthetists for surgery assignment
     */
    getAvailableAnaesthetists: async () => {
        try {
            const response = await api.get('/anaesthetists/available');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching available anaesthetists. Please try again.';
            throw new Error(message);
        }
    },

    /**
     * Create a new anaesthetist
     * @param {Object|FormData} anaesthetistData 
     */
    createAnaesthetist: async (anaesthetistData) => {
        try {
            const config = (anaesthetistData instanceof FormData)
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};

            const response = await api.post('/anaesthetists', anaesthetistData, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error creating anaesthetist. Please try again.';
            throw new Error(message);
        }
    },

    /**
     * Update an anaesthetist
     * @param {string} id 
     * @param {Object|FormData} anaesthetistData 
     */
    updateAnaesthetist: async (id, anaesthetistData) => {
        try {
            const config = (anaesthetistData instanceof FormData)
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};

            const response = await api.put(`/anaesthetists/${id}`, anaesthetistData, config);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating anaesthetist. Please try again.';
            throw new Error(message);
        }
    },

    /**
     * Delete an anaesthetist (Soft delete)
     * @param {string} id 
     */
    deleteAnaesthetist: async (id) => {
        try {
            const response = await api.delete(`/anaesthetists/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error deleting anaesthetist. Please try again.';
            throw new Error(message);
        }
    },

    /**
     * Update anaesthetist availability
     * @param {string} id 
     * @param {boolean} isAvailable 
     */
    updateAvailability: async (id, isAvailable) => {
        try {
            const response = await api.put(`/anaesthetists/${id}/availability`, { is_available: isAvailable });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating availability. Please try again.';
            throw new Error(message);
        }
    }
};

export default anaesthetistService;
