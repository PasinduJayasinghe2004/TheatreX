// ============================================================================
// Theatre Service
// ============================================================================
// Handles all theatre-related API calls
// Created by: M1 (Pasindu) - Day 10
//
// FEATURES:
// - Get all theatres (with optional status / type filters)
// - Get theatre by ID (includes current surgery info)
// - Update theatre status
// - Uses the same axios instance as authService for automatic JWT handling
// ============================================================================

import { api } from './authService.js';

// ============================================================================
// Theatre Service Object
// ============================================================================
const theatreService = {
    // ========================================
    // Get all theatres
    // Created by: M1 (Pasindu) - Day 10
    // ========================================
    getAllTheatres: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.status) {
                params.append('status', filters.status);
            }
            if (filters.type) {
                params.append('type', filters.type);
            }

            const queryString = params.toString();
            const url = queryString ? `/theatres?${queryString}` : '/theatres';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching theatres. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get theatre by ID
    // Created by: M1 (Pasindu) - Day 10
    // ========================================
    getTheatreById: async (id) => {
        try {
            const response = await api.get(`/theatres/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching theatre details. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Update theatre status
    // Created by: M1 (Pasindu) - Day 10
    // ========================================
    updateTheatreStatus: async (id, status) => {
        try {
            const response = await api.put(`/theatres/${id}/status`, { status });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating theatre status. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Check theatre availability (existing Day 8 endpoint)
    // Created by: M2 (Chandeepa) - Day 8
    // ========================================
    checkAvailability: async (date, time, duration) => {
        try {
            const response = await api.get('/theatres/availability', {
                params: { date, time, duration }
            });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error checking availability. Please try again.';
            throw new Error(message);
        }
    }
};

export default theatreService;
