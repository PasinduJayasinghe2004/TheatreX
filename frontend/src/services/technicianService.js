// ============================================================================
// Technician Service
// ============================================================================
// Handles all technician-related API calls
// Created by: M4 (Oneli) - Day 14
//
// FEATURES:
// - Get all technicians (with optional specialization / availability filters)
// - Get technician by ID
// - Create a new technician
// - Update a technician
// - Delete a technician (soft-delete)
// - Uses the same axios instance as authService for automatic JWT handling
// ============================================================================

import { api } from './authService.js';

const technicianService = {
    // ========================================
    // Get all technicians
    // Optional filters: { specialization, is_available }
    // ========================================
    getAllTechnicians: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.specialization) {
                params.append('specialization', filters.specialization);
            }
            if (filters.is_available !== undefined) {
                params.append('is_available', filters.is_available);
            }

            const queryString = params.toString();
            const url = queryString ? `/technicians?${queryString}` : '/technicians';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching technicians. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get a single technician by ID
    // ========================================
    getTechnicianById: async (id) => {
        try {
            const response = await api.get(`/technicians/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching technician details. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Create a new technician
    // ========================================
    createTechnician: async (technicianData) => {
        try {
            const response = await api.post('/technicians', technicianData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error creating technician. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Update a technician
    // ========================================
    updateTechnician: async (id, technicianData) => {
        try {
            const response = await api.put(`/technicians/${id}`, technicianData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating technician. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Delete a technician (soft-delete)
    // ========================================
    deleteTechnician: async (id) => {
        try {
            const response = await api.delete(`/technicians/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error deleting technician. Please try again.';
            throw new Error(message);
        }
    }
};

export default technicianService;
