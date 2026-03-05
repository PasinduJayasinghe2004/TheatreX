// ============================================================================
// Notification List Component
// ============================================================================
// Displays a list of notifications for the current user
// Created by: M1 (Pasindu) - Day 16
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import NotificationItem from './NotificationItem';

const NotificationList = ({ unreadOnly = false, onMarkRead }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await notificationService.getNotifications({
                limit: 100,
            });
            setNotifications(res.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            if (onMarkRead) onMarkRead(id);
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            if (onMarkRead) onMarkRead('all');
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
            </div>
        );
    }

    const filteredNotifications = unreadOnly
        ? notifications.filter(n => !n.is_read)
        : notifications;

    if (filteredNotifications.length === 0) {
        return (
            <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <p className="text-gray-500 text-sm">No notifications found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {!unreadOnly && notifications.some(n => !n.is_read) && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Mark all as read
                    </button>
                </div>
            )}

            <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {filteredNotifications.map((notif) => (
                    <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onMarkRead={handleMarkAsRead}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationList;
