// ============================================================================
// Notification Service
// ============================================================================
// Handles all notification-related API calls
// Created by: M4 (Oneli) - Day 16
// Updated by: M1 (Pasindu) - Day 17 (mark read, mark all read)
//
// FEATURES:
// - Get current user's notifications
// - Get unread notification count
// - Mark a single notification as read
// - Mark all notifications as read
// - Uses the same axios instance as authService for automatic JWT handling
// ============================================================================

import { api } from './authService.js';

const notificationService = {
    // ========================================
    // Get current user's notifications (latest 50)
    // ========================================
    getNotifications: async () => {
        try {
            const response = await api.get('/notifications');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error fetching notifications.';
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
            const message = error.response?.data?.message || 'Error fetching unread count.';
            throw new Error(message);
        }
    },

    // ========================================
    // Mark a single notification as read
    // ========================================
    markAsRead: async (id) => {
        try {
            const response = await api.put(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Error marking notification as read.';
            throw new Error(message);
        }
    },

    // ========================================
    // Mark all notifications as read
    // ========================================
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
