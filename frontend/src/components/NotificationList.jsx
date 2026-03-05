// ============================================================================
// Notification List Component
// ============================================================================
// Displays a list of notifications for the current user
// Created by: M1 (Pasindu) - Day 16
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

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
                // We could add unreadOnly filter if the backend supported it, 
                // but for now we filter on the frontend or just show all
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

    const getTypeStyles = (type) => {
        switch (type) {
            case 'reminder': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'alert': return 'bg-red-50 text-red-700 border-red-100';
            case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'success': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'reminder':
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            case 'alert':
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
            case 'warning':
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
            case 'success':
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
            default:
                return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
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
                    <div
                        key={notif.id}
                        className={`p-4 transition-colors relative ${!notif.is_read ? 'bg-indigo-50/30' : 'bg-white hover:bg-gray-50'}`}
                    >
                        {!notif.is_read && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                        )}

                        <div className="flex items-start gap-3">
                            <div className={`mt-1 p-2 rounded-lg border ${getTypeStyles(notif.type)}`}>
                                {getTypeIcon(notif.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className={`text-sm font-semibold truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {notif.title}
                                    </h4>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={`text-xs mt-1 leading-relaxed ${!notif.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                                    {notif.message}
                                </p>
                            </div>

                            {!notif.is_read && (
                                <button
                                    onClick={() => handleMarkAsRead(notif.id)}
                                    className="mt-1 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                    title="Mark as read"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationList;
