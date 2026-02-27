// ============================================================================
// Nurse Service
// ============================================================================
// Handles all nurse-related API calls
// Created by: M3 (Janani) - Day 13
//
// FEATURES:
// - Get all nurses (with optional search / available / shift filters)
// - Get a single nurse by ID
// - Create a new nurse
// - Uses the same axios instance as authService for automatic JWT handling
// ============================================================================

import { api } from './authService.js';

// ============================================================================
// Nurse Service Object
// ============================================================================
const nurseService = {
    // ========================================
    // Get all nurses
    // Supports { search, available, shift } filters
    // Created by: M3 (Janani) - Day 13
    // ========================================
    getAllNurses: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.available !== undefined && filters.available !== '')
                params.append('available', filters.available);
            if (filters.shift) params.append('shift', filters.shift);

            const queryString = params.toString();
            const url = queryString ? `/nurses?${queryString}` : '/nurses';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error fetching nurses. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get a single nurse by ID
    // Created by: M3 (Janani) - Day 13
    // ========================================
    getNurseById: async (id) => {
        try {
            const response = await api.get(`/nurses/${id}`);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error fetching nurse details. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Create a new nurse
    // Changed to support FormData for image upload
    // Created by: M3 (Janani) - Day 13
    // ========================================
    createNurse: async (nurseData) => {
        try {
            const config = (nurseData instanceof FormData)
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};

            const response = await api.post('/nurses', nurseData, config);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error creating nurse. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Update a nurse
    // Supports FormData for image upload
    // ========================================
    updateNurse: async (id, nurseData) => {
        try {
            const config = (nurseData instanceof FormData)
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};

            const response = await api.put(`/nurses/${id}`, nurseData, config);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error updating nurse. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Delete a nurse (Soft delete)
    // ========================================
    deleteNurse: async (id) => {
        try {
            const response = await api.delete(`/nurses/${id}`);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error deleting nurse. Please try again.';
            throw new Error(message);
        }
    },
};

export default nurseService;
