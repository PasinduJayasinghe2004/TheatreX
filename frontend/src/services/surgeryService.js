// ============================================================================
// Surgery Service
// ============================================================================
// Handles all surgery-related API calls
// Created by: M2 (Chandeepa) - Day 5
// Updated by: M1 (Pasindu) - Day 6 (Added updateSurgery)
//
// FEATURES:
// - Get all surgeries
// - Get surgery by ID
// - Create new surgery
// - Update surgery
// - Uses the same axios instance as authService for automatic JWT handling
// ============================================================================

import { api } from './authService.js';

// ============================================================================
// Surgery Service Object
// ============================================================================
const surgeryService = {
    // ========================================
    // Get all surgeries
    // Updated by: M4 (Oneli) - Day 6 (Added filter support)
    // ========================================
    getAllSurgeries: async (filters = {}) => {
        try {
            // Build query string from filters
            const params = new URLSearchParams();
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }

            const queryString = params.toString();
            const url = queryString ? `/surgeries?${queryString}` : '/surgeries';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching surgeries. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get surgery by ID
    // ========================================
    getSurgeryById: async (id) => {
        try {
            const response = await api.get(`/surgeries/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching surgery details. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Create new surgery
    // ========================================
    createSurgery: async (surgeryData) => {
        try {
            const response = await api.post('/surgeries', surgeryData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error creating surgery. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Update surgery
    // Created by: M1 (Pasindu) - Day 6
    // ========================================
    updateSurgery: async (id, surgeryData) => {
        try {
            const response = await api.put(`/surgeries/${id}`, surgeryData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating surgery. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get surgeons for dropdown
    // ========================================
    getSurgeons: async () => {
        try {
            const response = await api.get('/surgeries/surgeons');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching surgeons. Please try again.';
            throw new Error(message);
        }
    }
};

export default surgeryService;
