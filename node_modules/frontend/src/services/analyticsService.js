// ============================================================================
// Analytics Service
// ============================================================================
// Created by: M1 (Pasindu) - Day 18
//
// Handles API calls related to analytics and statistics.
// Provides functions to fetch analytics data from the backend.
// ============================================================================

import { api } from './authService';

/**
 * Get surgeries per day for the last 7 days
 * @returns {Promise} Surgeries per day data
 */
export const getSurgeriesPerDay = async () => {
    try {
        const response = await api.get('/analytics/surgeries-per-day');
        return response.data;
    } catch (error) {
        console.error('Error fetching surgeries per day:', error);
        throw error;
    }
};

/**
 * Get surgery counts grouped by status
 * @param {string} [startDate] Optional start date (YYYY-MM-DD)
 * @param {string} [endDate] Optional end date (YYYY-MM-DD)
 * @returns {Promise} Surgery status counts data
 */
export const getSurgeryStatusCounts = async (startDate, endDate) => {
    try {
        let url = '/analytics/surgery-status-counts';
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching surgery status counts:', error);
        throw error;
    }
};

/**
 * Get patient demographics breakdown (gender, blood type, age groups)
 * @returns {Promise} Patient demographics data
 * Created by: M3 (Janani) - Day 18
 */
export const getPatientDemographics = async () => {
    try {
        const response = await api.get('/analytics/patient-demographics');
        return response.data;
    } catch (error) {
        console.error('Error fetching patient demographics:', error);
        throw error;
    }
};

/**
 * Get staff counts grouped by role
 * @returns {Promise} Staff counts data
 * Created by: M4 (Oneli) - Day 18
 */
export const getStaffCountsByRole = async () => {
    try {
        const response = await api.get('/analytics/staff-counts');
        return response.data;
    } catch (error) {
        console.error('Error fetching staff counts:', error);
        throw error;
    }
};

/**
 * Get theatre utilization percentages for the last 7 days
 * @returns {Promise} Theatre utilization data
 * Created by: M5 (Inthusha) - Day 18
 */
export const getTheatreUtilization = async () => {
    try {
        const response = await api.get('/analytics/theatre-utilization');
        return response.data;
    } catch (error) {
        console.error('Error fetching theatre utilization:', error);
        throw error;
    }
};

/**
 * Get surgery duration distribution (histogram buckets) and summary stats
 * @returns {Promise} Surgery duration stats data
 * Created by: M4 (Oneli) - Day 19
 */
export const getSurgeryDurationStats = async () => {
    try {
        const response = await api.get('/analytics/surgery-duration-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching surgery duration stats:', error);
        throw error;
    }
};

/**
 * Get surgery count per hour of the day (Peak hours analysis)
 * @returns {Promise} Peak hours data
 * Created by: M5 (Inthusha) - Day 19
 */
export const getPeakHoursAnalysis = async () => {
    try {
        const response = await api.get('/analytics/peak-hours');
        return response.data;
    } catch (error) {
        console.error('Error fetching peak hours analysis:', error);
        throw error;
    }
};

export default {
    getSurgeriesPerDay,
    getSurgeryStatusCounts,
    getPatientDemographics,
    getStaffCountsByRole,
    getTheatreUtilization,
    getSurgeryDurationStats,
    getPeakHoursAnalysis
};
