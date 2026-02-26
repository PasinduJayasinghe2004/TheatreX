// ============================================================================
// Nurse Service
// ============================================================================
// Handles all nurse-related API calls
// Created by: M4 (Oneli) - Day 13
//
// FEATURES:
// - Get all nurses (with optional specialization / availability filters)
// - Get nurse by ID
// - Create a new nurse
// - Uses the same axios instance as authService for automatic JWT handling
// ============================================================================

import { api } from './authService.js';

const nurseService = {
    // ========================================
    // Get all nurses
    // Optional filters: { specialization, is_available }
    // ========================================
    getAllNurses: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.specialization) {
                params.append('specialization', filters.specialization);
            }
            if (filters.is_available !== undefined) {
                params.append('is_available', filters.is_available);
            }

            const queryString = params.toString();
            const url = queryString ? `/nurses?${queryString}` : '/nurses';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching nurses. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get a single nurse by ID
    // ========================================
    getNurseById: async (id) => {
        try {
            const response = await api.get(`/nurses/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching nurse details. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Create a new nurse
    // ========================================
    createNurse: async (nurseData) => {
        try {
            const response = await api.post('/nurses', nurseData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error creating nurse. Please try again.';
            throw new Error(message);
        }
    }
};

export default nurseService;
