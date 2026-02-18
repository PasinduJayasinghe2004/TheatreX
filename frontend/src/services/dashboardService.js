// ============================================================================
// Dashboard Service
// ============================================================================
// Created by: M4 (Oneli) - Day 7
// 
// Handles API calls related to dashboard statistics.
// Provides functions to fetch dashboard data from the backend.
// ============================================================================

import api from './authService';

/**
 * Get dashboard statistics
 * @returns {Promise} Dashboard statistics data
 */
export const getDashboardStats = async () => {
    try {
        const response = await api.get('/api/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

export default {
    getDashboardStats
};
