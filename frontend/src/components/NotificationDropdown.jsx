import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import notificationService from '../services/notificationService';

/**
 * NotificationDropdown Component
 * Displays a dropdown list of the user's notifications
 * Created by: M4 (Oneli) - Day 16
 * Updated by: M1 (Pasindu) - Day 17 (mark read, mark all, view all link, polling)
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dropdown is visible
 * @param {Function} props.onClose - Callback to close the dropdown
 * @param {Function} props.onCountChange - Callback when unread count may have changed
 */
const NotificationDropdown = ({ isOpen, onClose, onCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const pollRef = useRef(null);

    // Fetch notifications when dropdown opens + start 30s polling
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            // Poll every 30 seconds while open
            pollRef.current = setInterval(fetchNotifications, 30000);
        } else {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        }
        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [isOpen]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications();
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Mark a single notification as read
    const handleMarkRead = useCallback(async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
            );
            if (onCountChange) onCountChange();
        } catch (error) {
            console.error('Failed to mark notification as read:', error.message);
        }
    }, [onCountChange]);

    // Mark all notifications as read
    const handleMarkAllRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
            );
            if (onCountChange) onCountChange();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error.message);
        }
    }, [onCountChange]);

    // Map notification type to emoji icon
    const getTypeIcon = (type) => {
        const icons = {
            reminder: '⏰',
            alert: '🚨',
            info: 'ℹ️',
            warning: '⚠️',
            success: '✅'
        };
        return icons[type] || 'ℹ️';
    };

    // Type-to-color mapping
    const getTypeBadgeClass = (type) => {
        const colors = {
            reminder: 'bg-amber-100 text-amber-700',
            alert: 'bg-red-100 text-red-700',
            info: 'bg-blue-100 text-blue-700',
            warning: 'bg-orange-100 text-orange-700',
            success: 'bg-emerald-100 text-emerald-700'
        };
        return colors[type] || 'bg-gray-100 text-gray-600';
    };

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

        return date.toLocaleDateString();
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            id="notification-dropdown"
        >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                    Notifications
                    {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
                            {unreadCount}
                        </span>
                    )}
                </h3>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-white/80 hover:text-white font-medium transition-colors"
                        id="mark-all-read-btn"
                    >
                        ✓ Mark all read
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
                {loading && notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                        <span className="animate-spin inline-block text-2xl">⏳</span>
                        <p className="mt-2 text-sm">Loading...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                        <span className="text-3xl">🔔</span>
                        <p className="mt-2 text-sm">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 ${!notif.is_read ? 'bg-blue-50/50' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-lg mt-0.5">{getTypeIcon(notif.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                            {notif.title}
                                        </p>
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getTypeBadgeClass(notif.type)}`}>
                                            {notif.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {getRelativeTime(notif.created_at)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                                    {!notif.is_read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkRead(notif.id);
                                            }}
                                            title="Mark as read"
                                            className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                            id={`mark-read-${notif.id}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    )}
                                    {!notif.is_read && (
                                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    {notifications.length > 0
                        ? `Showing ${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`
                        : ''}
                </span>
                <a
                    href="/notifications"
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    id="view-all-notifications"
                >
                    View All →
                </a>
            </div>
        </div>
    );
};

NotificationDropdown.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCountChange: PropTypes.func
};

NotificationDropdown.defaultProps = {
    onCountChange: null
};

export default NotificationDropdown;
