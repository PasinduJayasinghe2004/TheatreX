// ============================================================================
// Notification List Component
// ============================================================================
// Displays a list of notifications for the current user
// Created by: M1 (Pasindu) - Day 16
// Updated by: M3 (Janani) - Day 17 — added 30s polling via usePolling hook
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import notificationService from '../services/notificationService';
import NotificationItem from './NotificationItem';
import usePolling from '../hooks/usePolling';

const NotificationList = ({ unreadOnly = false, typeFilter = '', searchQuery = '', onMarkRead, onPollingStatus }) => {
    const [optimisticUpdates, setOptimisticUpdates] = useState({});
    const [displayLimit, setDisplayLimit] = useState(20);

    // ── Fetch function given to usePolling ──────────────────────────
    const fetchNotifications = useCallback(async () => {
        const params = { limit: 100 };
        if (typeFilter) params.type = typeFilter;
        const res = await notificationService.getNotifications(params);
        return res.data; // usePolling stores this in `data`
    }, [typeFilter]);

    // ── Poll every 30s ─────────────────────────────────────────────
    const {
        data: notifications,
        loading,
        error,
        lastPolledAt,
        refresh,
        pause,
        resume,
        paused
    } = usePolling(fetchNotifications, { interval: 30000 });

    // ── Expose polling status to parent ───────────────────────────
    useEffect(() => {
        if (onPollingStatus) {
            onPollingStatus({ lastPolledAt, refresh, pause, resume, paused });
        }
    }, [onPollingStatus, lastPolledAt, refresh, pause, resume, paused]);

    // ── Mark single notification as read (optimistic) ──────────────
    const handleMarkAsRead = async (id) => {
        setOptimisticUpdates(prev => ({ ...prev, [id]: true }));
        try {
            await notificationService.markAsRead(id);
            if (onMarkRead) onMarkRead(id);
            // Refresh the list to get server state
            refresh();
        } catch (err) {
            console.error('Error marking as read:', err);
            setOptimisticUpdates(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    };

    // ── Mark all as read ───────────────────────────────────────────
    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            if (onMarkRead) onMarkRead('all');
            refresh();
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    // ── Loading skeleton ───────────────────────────────────────────
    if (loading && !notifications) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-100 dark:bg-slate-700 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    // ── Error state ────────────────────────────────────────────────
    if (error && !notifications) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
            </div>
        );
    }

    // Apply optimistic read updates on top of polled data
    const notificationList = (notifications || []).map(n =>
        optimisticUpdates[n.id] ? { ...n, is_read: true } : n
    );

    let filteredNotifications = unreadOnly
        ? notificationList.filter(n => !n.is_read)
        : notificationList;

    // Apply search filter (Day 17 - Polish)
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredNotifications = filteredNotifications.filter(n =>
            n.title?.toLowerCase().includes(query) ||
            n.message?.toLowerCase().includes(query) ||
            n.surgery_name?.toLowerCase().includes(query)
        );
    }

    const totalFiltered = filteredNotifications.length;
    const paginatedNotifications = filteredNotifications.slice(0, displayLimit);
    const hasMore = displayLimit < totalFiltered;

    const handleLoadMore = () => {
        setDisplayLimit(prev => prev + 20);
    };

    // ── Empty state ────────────────────────────────────────────────
    if (totalFiltered === 0) {
        return (
            <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                    {searchQuery ? `No matches for "${searchQuery}"` : 'No notifications found'}
                </p>
            </div>
        );
    }

    // ── Notification list ──────────────────────────────────────────
    return (
        <div className="space-y-3">
            {!unreadOnly && notificationList.some(n => !n.is_read) && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Mark all as read
                    </button>
                </div>
            )}

            <div className="divide-y divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                {paginatedNotifications.map((notif) => (
                    <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onMarkRead={handleMarkAsRead}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-50 transition-all duration-200"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationList;
