// ============================================================================
// Notification Service
// ============================================================================
// Handles all notification-related API calls
// Created by: M1 (Pasindu) - Day 16
// ============================================================================

import { api } from './authService';

const notificationService = {
    /**
     * Get all notifications for the current user
     * @param {Object} params - Query parameters (limit, offset)
     * @returns {Promise<Object>} API response
     */
    getNotifications: async (params = {}) => {
        try {
            const response = await api.get('/notifications', { params });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching notifications.';
            throw new Error(message);
        }
    },

    /**
     * Get unread count for the current user
     * @returns {Promise<Object>} API response
     */
    getUnreadCount: async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching unread count.';
            throw new Error(message);
        }
    },

    /**
     * Mark a notification as read
     * @param {number} id - Notification ID
     * @returns {Promise<Object>} API response
     */
    markAsRead: async (id) => {
        try {
            const response = await api.put(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error marking notification as read.';
            throw new Error(message);
        }
    },

    /**
     * Mark all notifications as read
     * @returns {Promise<Object>} API response
     */
    markAllAsRead: async () => {
        try {
            const response = await api.put('/notifications/read-all');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error marking all notifications as read.';
            throw new Error(message);
        }
    }
};

export default notificationService;
