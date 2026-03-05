// ============================================================================
// Patient Service
// ============================================================================
// Handles all patient-related API calls
// Created by: M1 (Pasindu) - Day 15
// Updated by: M2 (Chandeepa) - Day 15
//
// FEATURES:
// - Get all patients (with optional gender / blood_type / search filters)
// - Get patient by ID
// - Create a new patient
// - Update an existing patient
// - Delete (soft-delete) a patient
// - Uses the same axios instance as authService for automatic JWT handling
// ============================================================================

import { api } from './authService.js';

const patientService = {
    // ========================================
    // Get all patients
    // Optional filters: { gender, blood_type, search }
    // ========================================
    getAllPatients: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.gender) {
                params.append('gender', filters.gender);
            }
            if (filters.blood_type) {
                params.append('blood_type', filters.blood_type);
            }
            if (filters.search) {
                params.append('search', filters.search);
            }

            const queryString = params.toString();
            const url = queryString ? `/patients?${queryString}` : '/patients';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching patients. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // M6 Day 15: Search patients by name, phone, or email
    // Convenience wrapper around getAllPatients with a search term
    // ========================================
    searchPatients: async (searchTerm, filters = {}) => {
        try {
            return await patientService.getAllPatients({ ...filters, search: searchTerm });
        } catch (error) {
            const message = error.response?.data?.message || 'Error searching patients. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get a single patient by ID
    // ========================================
    getPatientById: async (id) => {
        try {
            const response = await api.get(`/patients/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching patient details. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Create a new patient
    // ========================================
    createPatient: async (patientData) => {
        try {
            const response = await api.post('/patients', patientData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error creating patient. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Update a patient by ID
    // ========================================
    updatePatient: async (id, patientData) => {
        try {
            const response = await api.put(`/patients/${id}`, patientData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating patient. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Delete (soft-delete) a patient by ID
    // ========================================
    deletePatient: async (id) => {
        try {
            const response = await api.delete(`/patients/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error deleting patient. Please try again.';
            throw new Error(message);
        }
    }
};

export default patientService;
