// ============================================================================
// Analytics Service
// ============================================================================
// Created by: M1 (Pasindu) - Day 18
//
// Handles API calls related to analytics and statistics.
// Provides functions to fetch analytics data from the backend.
// ============================================================================

import api from './authService';

/**
 * Get surgeries per day for the last 7 days
 * @returns {Promise} Surgeries per day data
 */
export const getSurgeriesPerDay = async () => {
    try {
        const response = await api.get('/api/analytics/surgeries-per-day');
        return response.data;
    } catch (error) {
        console.error('Error fetching surgeries per day:', error);
        throw error;
    }
};

/**
 * Get surgery counts grouped by status
 * @returns {Promise} Surgery status counts data
 */
export const getSurgeryStatusCounts = async () => {
    try {
        const response = await api.get('/api/analytics/surgery-status-counts');
        return response.data;
    } catch (error) {
        console.error('Error fetching surgery status counts:', error);
        throw error;
    }
};

export default {
    getSurgeriesPerDay,
    getSurgeryStatusCounts
};
