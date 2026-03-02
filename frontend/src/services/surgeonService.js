// ============================================================================
// Surgeon Service
// ============================================================================
// Handles all surgeon-related API calls
// Created by: M1 (Pasindu) - Day 13
// Updated by: M2 (Chandeepa) - Day 13 (added getSurgeonById)
// Updated by: M1 (Pasindu)   - Day 14 (added updateSurgeon, deleteSurgeon)
//
// FEATURES:
// - Get all surgeons (with optional search / available filters)
// - Get a single surgeon by ID
// - Create a new surgeon
// - Uses the same axios instance as authService for automatic JWT handling
// ============================================================================

import { api } from './authService.js';

// ============================================================================
// Surgeon Service Object
// ============================================================================
const surgeonService = {
    // ========================================
    // Get all surgeons
    // Supports { search, available } filters
    // Created by: M1 (Pasindu) - Day 13
    // ========================================
    getAllSurgeons: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.available !== undefined && filters.available !== '')
                params.append('available', filters.available);

            const queryString = params.toString();
            const url = queryString ? `/surgeons?${queryString}` : '/surgeons';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error fetching surgeons. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get a single surgeon by ID
    // Created by: M2 (Chandeepa) - Day 13
    // ========================================
    getSurgeonById: async (id) => {
        try {
            const response = await api.get(`/surgeons/${id}`);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error fetching surgeon details. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Create a new surgeon
    // Changed to support FormData for image upload
    // Created by: M1 (Pasindu) - Day 13
    // ========================================
    createSurgeon: async (surgeonData) => {
        try {
            // If surgeonData is NOT FormData, it might be from an old caller
            // But we'll assume new callers pass FormData or we handle both
            const config = (surgeonData instanceof FormData)
                ? { headers: { 'Content-Type': 'multipart/form-data' } }
                : {};

            const response = await api.post('/surgeons', surgeonData, config);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error creating surgeon. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Update an existing surgeon
    // Created by: M1 (Pasindu) - Day 14
    // ========================================
    updateSurgeon: async (id, surgeonData) => {
        try {
            const response = await api.put(`/surgeons/${id}`, surgeonData);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error updating surgeon. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Delete (soft-delete) a surgeon by ID
    // Created by: M1 (Pasindu) - Day 14
    // ========================================
    deleteSurgeon: async (id) => {
        try {
            const response = await api.delete(`/surgeons/${id}`);
            return response.data;
        } catch (error) {
            const message =
                error.response?.data?.message || 'Error deleting surgeon. Please try again.';
            throw new Error(message);
        }
    },
};

export default surgeonService;

