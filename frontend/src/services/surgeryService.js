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
// Updated by: M2 (Chandeepa) - Day 9 (Added getAvailableNurses for multi-select)
// Updated by: M3 (Janani) - Day 9 (Added getAvailableAnaesthetists for dropdown)
// Updated by: M4 (Oneli) - Day 9 (Added checkStaffConflicts for warning UI)
// Updated by: M3 (Janani) - Day 12 (Added assignSurgeryToTheatre, getUnassignedSurgeries)
//
// FEATURES:
// - Get all surgeries (with date + status filters)
// - Get surgery by ID
// - Create new surgery
// - Update surgery status
// - Delete surgery by ID
// - Get calendar events (FullCalendar format) - M2 Day 7
// - Check scheduling conflicts (theatre, surgeon, staff) - M1 Day 8
// - Check staff-specific conflicts with warnings - M4 Day 9
// - Get available surgeons for a time slot - M1 Day 9
// - Get available nurses for a time slot - M2 Day 9
// - Get available anaesthetists for a time slot - M3 Day 9
// - Get completed surgery history - M1 Day 20
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
    // Get completed surgery history
    // Created by: M1 (Pasindu) - Day 20
    // Updated by: M2 (Chandeepa) - Day 20 (Added date range filter support)
    // Updated by: M3 (Janani) - Day 20 (Added surgeon filter support)
    // Updated by: M4 (Oneli) - Day 20 (Added theatre filter support)
    // Updated by: M5 (User) - Day 20 (Added pagination support)
    // ========================================
    getSurgeryHistory: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            if (filters.surgeonId) {
                params.append('surgeonId', String(filters.surgeonId));
            }
            if (filters.theatreId) {
                params.append('theatreId', String(filters.theatreId));
            }
            if (filters.page) {
                params.append('page', String(filters.page));
            }
            if (filters.limit) {
                params.append('limit', String(filters.limit));
            }

            const queryString = params.toString();
            const url = queryString ? `/surgeries/history?${queryString}` : '/surgeries/history';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching surgery history. Please try again.';
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
    // Get available nurses for a time slot
    // Returns nurses with availability info
    // Created by: M2 (Chandeepa) - Day 9
    // ========================================
    getAvailableNurses: async (date, time, duration, excludeSurgeryId = null) => {
        try {
            const params = new URLSearchParams({ date, time, duration: String(duration) });
            if (excludeSurgeryId) {
                params.append('exclude_surgery_id', String(excludeSurgeryId));
            }
            const response = await api.get(`/surgeries/nurses/available?${params.toString()}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching available nurses. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get available anaesthetists for a time slot
    // Returns anaesthetists with availability info
    // Created by: M3 (Janani) - Day 9
    // ========================================
    getAvailableAnaesthetists: async (date, time, duration, excludeSurgeryId = null) => {
        try {
            const params = new URLSearchParams({ date, time, duration: String(duration) });
            if (excludeSurgeryId) {
                params.append('exclude_surgery_id', String(excludeSurgeryId));
            }
            const response = await api.get(`/surgeries/anaesthetists/available?${params.toString()}`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching available anaesthetists. Please try again.';
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
    // Update an existing surgery
    // Created by: M2 (Chandeepa) - Day 9
    // ========================================
    updateSurgery: async (id, updateData) => {
        try {
            const response = await api.put(`/surgeries/${id}`, updateData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error updating surgery. Please try again.';
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
    },

    // ========================================
    // Check staff-specific conflicts with warnings
    // Created by: M4 (Oneli) - Day 9
    // Returns detailed warnings for surgeon, anaesthetist, and nurse conflicts
    // ========================================
    checkStaffConflicts: async (staffConflictData) => {
        try {
            const response = await api.post('/surgeries/check-staff-conflicts', staffConflictData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error checking staff conflicts. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Unified staff assignment
    // Created by: M5 (User) - Day 9
    // Assigns surgeon, anaesthetist, and nurses in one call
    // ========================================
    assignStaff: async (id, staffData) => {
        try {
            const response = await api.patch(`/surgeries/${id}/staff`, staffData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error assigning staff. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Assign surgery to theatre
    // Created by: M3 (Janani) - Day 12
    // Assigns (or reassigns) a surgery to a specific theatre with conflict check
    // ========================================
    assignSurgeryToTheatre: async (id, theatreId) => {
        try {
            const response = await api.patch(`/surgeries/${id}/assign-theatre`, { theatre_id: theatreId });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error assigning surgery to theatre. Please try again.';
            throw new Error(message);
        }
    },

    // ========================================
    // Get unassigned surgeries (no theatre)
    // Created by: M3 (Janani) - Day 12
    // Returns surgeries that don't have a theatre assigned yet
    // ========================================
    getUnassignedSurgeries: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.status) params.append('status', filters.status);

            const queryString = params.toString();
            const url = queryString ? `/surgeries/unassigned?${queryString}` : '/surgeries/unassigned';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching unassigned surgeries. Please try again.';
            throw new Error(message);
        }
    }
};

export default surgeryService;
