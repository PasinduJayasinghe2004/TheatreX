import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import notificationService from '../services/notificationService';

/**
 * NotificationDropdown Component
 * Displays a dropdown list of the user's notifications
 * Created by: M4 (Oneli) - Day 16
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the dropdown is visible
 * @param {Function} props.onClose - Callback to close the dropdown
 */
const NotificationDropdown = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
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

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            id="notification-dropdown"
        >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <h3 className="text-sm font-semibold">Notifications</h3>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
                {loading ? (
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
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 cursor-pointer ${!notif.is_read ? 'bg-blue-50/50' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-lg mt-0.5">{getTypeIcon(notif.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                        {notif.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {getRelativeTime(notif.created_at)}
                                    </p>
                                </div>
                                {!notif.is_read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                    <span className="text-xs text-gray-400">
                        Showing latest {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    </span>
                </div>
            )}
        </div>
    );
};

NotificationDropdown.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default NotificationDropdown;
