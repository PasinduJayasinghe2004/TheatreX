// ============================================================================
// Notification Service
// ============================================================================
// Handles all notification-related API calls
// Created by: M3 (Janani) - Day 16
//
// FEATURES:
// - Get user's notifications (with filters)
// - Get unread notification count
// - Create a notification (admin/coordinator)
// - Uses the same axios instance as authService for automatic JWT handling
// ============================================================================

import { api } from './authService.js';

// ============================================================================
// Notification Service Object
// ============================================================================
const notificationService = {

    // ========================================
    // Get notifications for the logged-in user
    // Supports filters: type, is_read, limit, offset
    // ========================================
    getNotifications: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

            if (filters.type) {
                params.append('type', filters.type);
            }
            if (filters.is_read !== undefined) {
                params.append('is_read', filters.is_read);
            }
            if (filters.limit) {
                params.append('limit', filters.limit);
            }
            if (filters.offset) {
                params.append('offset', filters.offset);
            }

            const queryString = params.toString();
            const url = queryString ? `/notifications?${queryString}` : '/notifications';

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch notifications';
            throw new Error(message);
        }
    },

    // ========================================
    // Get unread notification count
    // ========================================
    getUnreadCount: async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch unread count';
            throw new Error(message);
        }
    },

    // ========================================
    // Create a notification (coordinator/admin)
    // ========================================
    createNotification: async (notificationData) => {
        try {
            const response = await api.post('/notifications', notificationData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create notification';
            throw new Error(message);
        }
    }
};

export default notificationService;
