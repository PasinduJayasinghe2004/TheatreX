// ============================================================================
// Notification Dropdown Component
// ============================================================================
// Created by: M3 (Janani) - Day 16
//
// Displays a dropdown panel of user notifications triggered by the bell icon
// in the Header. Shows unread count badge, notification list with type-based
// icons/colors, relative timestamps, and empty state.
//
// Props: none (uses internal state + notificationService)
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService.js';

// ============================================================================
// Type Config: icon SVG paths + colors for each notification type
// ============================================================================
const TYPE_CONFIG = {
    reminder: {
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        bg: 'bg-blue-100 dark:bg-blue-900/40',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500'
    },
    alert: {
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
        bg: 'bg-red-100 dark:bg-red-900/40',
        text: 'text-red-600 dark:text-red-400',
        dot: 'bg-red-500'
    },
    info: {
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        bg: 'bg-gray-100 dark:bg-slate-700/40',
        text: 'text-gray-600 dark:text-gray-400',
        dot: 'bg-gray-500'
    },
    warning: {
        icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        bg: 'bg-amber-100 dark:bg-amber-900/40',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500'
    },
    success: {
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        bg: 'bg-green-100 dark:bg-green-900/40',
        text: 'text-green-600 dark:text-green-400',
        dot: 'bg-green-500'
    }
};

// ============================================================================
// Relative time helper
// ============================================================================
const getRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

// ============================================================================
// NotificationDropdown Component
// ============================================================================
const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const prevCountRef = useRef(0);
    const dropdownRef = useRef(null);

    // ──────────────────────────────────────────────────────────────
    // Fetch unread count (lightweight poll)
    // ──────────────────────────────────────────────────────────────
    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await notificationService.getUnreadCount();
            if (res.success) {
                const newCount = res.data.unread_count || res.count; // Compatibility with both response structures

                // Trigger animation if count increased
                if (newCount > prevCountRef.current) {
                    setShouldAnimate(true);
                    setTimeout(() => setShouldAnimate(false), 1000); // Reset animation after 1s
                }

                setUnreadCount(newCount);
                prevCountRef.current = newCount;
            }
        } catch {
            // Silently ignore count errors — non-critical
        }
    }, []);

    // ──────────────────────────────────────────────────────────────
    // Fetch notification list
    // ──────────────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await notificationService.getNotifications({ limit: 20 });
            if (res.success) {
                setNotifications(res.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ──────────────────────────────────────────────────────────────
    // Poll unread count every 30s
    // ──────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // ──────────────────────────────────────────────────────────────
    // Fetch full list when dropdown opens
    // ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    // ──────────────────────────────────────────────────────────────
    // Close on outside click
    // ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // ──────────────────────────────────────────────────────────────
    // Toggle dropdown
    // ──────────────────────────────────────────────────────────────
    const toggleDropdown = () => setIsOpen((prev) => !prev);

    // ──────────────────────────────────────────────────────────────
    // Render
    // ──────────────────────────────────────────────────────────────
    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                id="header-notifications-btn"
                onClick={toggleDropdown}
                className={`relative p-2 rounded-lg text-gray-400 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all duration-200 ${shouldAnimate ? 'animate-bellShake' : ''
                    }`}
                aria-label="Notifications"
                aria-expanded={isOpen}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1 ring-2 ring-white dark:ring-slate-900">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-50 animate-fadeIn overflow-hidden">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-80 overflow-y-auto">

                        {/* Loading state */}
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="ml-2 text-sm text-gray-500 dark:text-slate-400">Loading...</span>
                            </div>
                        )}

                        {/* Error state */}
                        {!loading && error && (
                            <div className="px-4 py-6 text-center">
                                <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-gray-500 dark:text-slate-400">{error}</p>
                                <button
                                    onClick={fetchNotifications}
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && !error && notifications.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <svg className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">No notifications</p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">You&apos;re all caught up!</p>
                            </div>
                        )}

                        {/* Notification list */}
                        {!loading && !error && notifications.length > 0 && (
                            <ul className="divide-y divide-gray-50 dark:divide-slate-700/50">
                                {notifications.map((notif) => {
                                    const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
                                    return (
                                        <li
                                            key={notif.id}
                                            className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer ${!notif.is_read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                                                }`}
                                        >
                                            {/* Type icon */}
                                            <div className={`shrink-0 w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center mt-0.5`}>
                                                <svg className={`w-4 h-4 ${config.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                                                </svg>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm leading-snug ${!notif.is_read
                                                            ? 'font-semibold text-gray-900 dark:text-slate-100'
                                                            : 'font-medium text-gray-700 dark:text-slate-300'
                                                        }`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <span className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${config.dot}`} />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[11px] text-gray-400 dark:text-slate-500">
                                                        {getRelativeTime(notif.created_at)}
                                                    </span>
                                                    {notif.surgery_name && (
                                                        <>
                                                            <span className="text-gray-300 dark:text-slate-600">·</span>
                                                            <span className="text-[11px] text-blue-500 dark:text-blue-400 truncate">
                                                                {notif.surgery_name}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-gray-100 dark:border-slate-700 px-4 py-2">
                            <button className="w-full text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
