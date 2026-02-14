// ============================================================================
// Surgery Service
// ============================================================================
// Handles all surgery-related API calls
// Created by: M2 (Chandeepa) - Day 5
//
// FEATURES:
// - Get all surgeries
// - Get surgery by ID
// - Create new surgery
// - Uses the same axios instance as authService for automatic JWT handling
// ============================================================================

import { api } from './authService.js';

// ============================================================================
// Surgery Service Object
// ============================================================================
const surgeryService = {
    // ========================================
    // Get all surgeries
    // ========================================
    getAllSurgeries: async () => {
        try {
            const response = await api.get('/surgeries');
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
