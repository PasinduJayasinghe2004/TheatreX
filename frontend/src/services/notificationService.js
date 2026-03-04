// ============================================================================
// Notification Service
// ============================================================================
// Handles all notification-related API calls
// Created by: M4 (Oneli) - Day 16
//
// FEATURES:
// - Get current user's notifications
// - Get unread notification count
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
    }
};

export default notificationService;
