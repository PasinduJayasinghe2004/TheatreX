// ============================================================================
// Surgery Service
// ============================================================================
// Handles all surgery-related API calls
// Created by: M2 (Chandeepa) - Day 5
// Updated by: M2 (Chandeepa) - Day 6 (Added deleteSurgery)
// Updated by: M3 (Janani) - Day 6 (Added updateSurgeryStatus, status filter)
// Updated by: M2 (Chandeepa) - Day 7 (Added getCalendarEvents)
// Updated by: M1 (Pasindu) - Day 8 (Added checkConflicts for emergency booking)
// Updated by: M1 (Pasindu) - Day 9 (Added getAvailableSurgeons for filtered dropdown)
//
// FEATURES:
// - Get all surgeries (with date + status filters)
// - Get surgery by ID
// - Create new surgery
// - Update surgery status
// - Delete surgery by ID
// - Get calendar events (FullCalendar format) - M2 Day 7
// - Check scheduling conflicts (theatre, surgeon, staff) - M1 Day 8
// - Get available surgeons for a time slot - M1 Day 9
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
            // Updated by: M3 (Janani) - Day 6 (Added status filter)
            const params = new URLSearchParams();
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            if (filters.status) {
                params.append('status', filters.status);
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
    // Delete surgery by ID
    // Created by: M2 (Chandeepa) - Day 6
    // ========================================
    deleteSurgery: async (id) => {
        try {
            const response = await api.delete(`/surgeries/${id}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error deleting surgery. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Update surgery status
    // Created by: M3 (Janani) - Day 6
    // ========================================
    updateSurgeryStatus: async (id, status) => {
        try {
            const response = await api.patch(`/surgeries/${id}/status`, { status });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating surgery status. Please try again.';
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
    },

    // ========================================
    // Get available surgeons for a time slot
    // Returns surgeons with availability info
    // Created by: M1 (Pasindu) - Day 9
    // ========================================
    getAvailableSurgeons: async (date, time, duration, excludeSurgeryId = null) => {
        try {
            const params = new URLSearchParams({ date, time, duration: String(duration) });
            if (excludeSurgeryId) {
                params.append('exclude_surgery_id', String(excludeSurgeryId));
            }
            const response = await api.get(`/surgeries/surgeons/available?${params.toString()}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching available surgeons. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get all active theatres for dropdown
    // Created by: M2 (Chandeepa) - Day 8
    // ========================================
    getTheatres: async () => {
        try {
            const response = await api.get('/theatres');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching theatres. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Check theatre availability for a date/time/duration
    // Created by: M2 (Chandeepa) - Day 8
    // ========================================
    checkTheatreAvailability: async (date, time, duration) => {
        try {
            const params = new URLSearchParams({ date, time, duration: String(duration) });
            const response = await api.get(`/theatres/availability?${params.toString()}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error checking theatre availability. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get calendar events (FullCalendar format)
    // Created by: M2 (Chandeepa) - Day 7
    // ========================================
    getCalendarEvents: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            if (filters.status) {
                params.append('status', filters.status);
            }

            const queryString = params.toString();
            const url = queryString ? `/surgeries/events?${queryString}` : '/surgeries/events';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching calendar events. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Check scheduling conflicts
    // Created by: M1 (Pasindu) - Day 8
    // Checks for theatre, surgeon, and staff conflicts
    // ========================================
    checkConflicts: async (conflictData) => {
        try {
            const response = await api.post('/surgeries/check-conflicts', conflictData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error checking conflicts. Please try again.';
            throw new Error(message);
        }
    }
};

export default surgeryService;
