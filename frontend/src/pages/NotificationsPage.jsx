// ============================================================================
// NotificationsPage
// ============================================================================
// Created by: M1 (Pasindu) - Day 17
//
// Full-page notification list with:
// - All notifications in a card list
// - Mark as read / mark all read
// - Type icons and color coding
// - Loading, error, and empty states
// - Auto-refresh every 30 seconds
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, CheckCheck, Check, RefreshCw, ArrowLeft } from 'lucide-react';
import notificationService from '../services/notificationService';

// Notification type config
const TYPE_CONFIG = {
    reminder: { icon: '⏰', label: 'Reminder', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
    alert: { icon: '🚨', label: 'Alert', color: 'bg-red-100 text-red-700', border: 'border-red-200' },
    info: { icon: 'ℹ️', label: 'Info', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
    warning: { icon: '⚠️', label: 'Warning', color: 'bg-orange-100 text-orange-700', border: 'border-orange-200' },
    success: { icon: '✅', label: 'Success', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' }
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.info;

// Format relative time
const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── NotificationItem ────────────────────────────────────────────────────────
const NotificationItem = ({ notification, onMarkRead }) => {
    const cfg = getTypeConfig(notification.type);

    return (
        <div
            className={`bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${!notification.is_read
                    ? `border-l-4 ${cfg.border} shadow-sm`
                    : 'border-gray-200 opacity-75'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <span className="text-lg">{cfg.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
                            {notification.title}
                        </h3>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.color}`}>
                            {cfg.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">
                        {getRelativeTime(notification.created_at)}
                        {notification.read_at && (
                            <span className="ml-2 text-emerald-500">
                                • Read {getRelativeTime(notification.read_at)}
                            </span>
                        )}
                    </p>
                </div>

                {/* Mark read button */}
                {!notification.is_read && (
                    <button
                        onClick={() => onMarkRead(notification.id)}
                        title="Mark as read"
                        className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

// ── NotificationsPage ───────────────────────────────────────────────────────
const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
    const pollRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            setError(null);
            const response = await notificationService.getNotifications();
            setNotifications(response.data || []);
        } catch (err) {
            setError(err.message || 'Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        pollRef.current = setInterval(fetchNotifications, 30000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchNotifications]);

    // Mark a single notification as read
    const handleMarkRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err.message);
        }
    };

    // Mark all notifications as read
    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
            );
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err.message);
        }
    };

    // Filtered notifications
    const displayed = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'read') return n.is_read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <a
                            href="/dashboard"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </a>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Bell className="w-6 h-6 text-blue-600" />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                        {unreadCount} unread
                                    </span>
                                )}
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5 ml-8">
                                Stay updated with surgery reminders and alerts
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchNotifications}
                            disabled={loading}
                            title="Refresh"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                id="page-mark-all-read"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Mark All Read
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-4">
                    {['all', 'unread', 'read'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === f
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            {f === 'unread' && unreadCount > 0 && (
                                <span className="ml-1.5 text-xs opacity-80">({unreadCount})</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                        <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">❌</span>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Failed to load notifications</h3>
                        <p className="text-sm text-gray-500 mb-4 max-w-xs">{error}</p>
                        <button
                            onClick={fetchNotifications}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-7 h-7 text-blue-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {filter !== 'all' ? `No ${filter} notifications` : 'No notifications yet'}
                        </h3>
                        <p className="text-sm text-gray-500 max-w-xs">
                            {filter !== 'all'
                                ? 'Try changing the filter to see more.'
                                : 'You\'ll see surgery reminders and alerts here.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-gray-400 mb-3">
                            Showing {displayed.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-3">
                            {displayed.map(notif => (
                                <NotificationItem
                                    key={notif.id}
                                    notification={notif}
                                    onMarkRead={handleMarkRead}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
