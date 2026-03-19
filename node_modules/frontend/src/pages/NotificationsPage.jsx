// ============================================================================
// Notifications Page
// ============================================================================
// Main page for viewing and managing user notifications
// Created by: M1 (Pasindu) - Day 16
// Updated by: M3 (Janani) - Day 17 — added auto-refresh controls (polling)
// Updated by: M4 (Oneli) - Day 17 — added type filter tabs
// ============================================================================

import { useState, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import NotificationList from '../components/NotificationList';
import notificationService from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import TYPE_CONFIG, { NOTIFICATION_TYPE_KEYS } from '../constants/notificationTypes.js';

const NotificationsPage = () => {
    // Polling controls provided by NotificationList via callback
    const pollingRef = useRef({});
    const [pollingState, setPollingState] = useState({
        paused: false,
        lastPolledAt: null
    });

    const { user } = useAuth();

    // ── Type filter state (Day 17 - M4) ─────────────────────────────
    const [activeType, setActiveType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCleaning, setIsCleaning] = useState(false);

    const handlePollingStatus = useCallback((status) => {
        pollingRef.current = status;
        // Only update React state when values actually changed
        setPollingState(prev => {
            if (
                prev.paused !== status.paused ||
                prev.lastPolledAt?.getTime() !== status.lastPolledAt?.getTime()
            ) {
                return { paused: status.paused, lastPolledAt: status.lastPolledAt };
            }
            return prev;
        });
    }, []);

    const handleRefresh = () => pollingRef.current.refresh?.();
    const handlePause = () => pollingRef.current.pause?.();
    const handleResume = () => pollingRef.current.resume?.();

    const formatLastPolled = (date) => {
        if (!date) return 'Never';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const handleCleanup = async () => {
        if (!window.confirm('Are you sure you want to delete all read notifications older than 30 days?')) return;

        setIsCleaning(true);
        try {
            const res = await notificationService.cleanupNotifications();
            alert(res.message);
            handleRefresh();
        } catch (err) {
            alert(err.message || 'Error cleaning up notifications');
        } finally {
            setIsCleaning(false);
        }
    };

    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-outfit">Notifications</h1>
                        <p className="text-sm text-gray-500 mt-1">Stay updated with surgery reminders and system alerts</p>
                    </div>

                    {(user?.role === 'admin' || user?.role === 'coordinator') && (
                        <button
                            onClick={handleCleanup}
                            disabled={isCleaning}
                            className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isCleaning ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {isCleaning ? 'Cleaning...' : 'Cleanup Old'}
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search notifications by title or message..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-800 placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Polling controls bar */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className={`inline-block w-2 h-2 rounded-full ${pollingState.paused ? 'bg-amber-400' : 'bg-green-500 animate-pulse'}`} />
                        <span>
                            {pollingState.paused ? 'Auto-refresh paused' : 'Auto-refresh every 30s'}
                        </span>
                        <span className="text-gray-300 mx-1">|</span>
                        <span>Last updated: {formatLastPolled(pollingState.lastPolledAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Pause / Resume toggle */}
                        <button
                            onClick={pollingState.paused ? handleResume : handlePause}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                                       bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700\"
                            title={pollingState.paused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
                        >
                            {pollingState.paused ? (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    </svg>
                                    Resume
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                                    </svg>
                                    Pause
                                </>
                            )}
                        </button>

                        {/* Manual refresh */}
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                                       bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                            title="Refresh now"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ── Type filter tabs (Day 17 - M4) ───────────────────────── */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                    {/* "All" tab */}
                    <button
                        onClick={() => setActiveType('')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${activeType === ''
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        All
                    </button>

                    {/* One tab per notification type */}
                    {NOTIFICATION_TYPE_KEYS.map((key) => {
                        const cfg = TYPE_CONFIG[key];
                        const isActive = activeType === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveType(key)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${isActive
                                        ? `${cfg.bg} ${cfg.text} border-current/30`
                                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.icon} />
                                </svg>
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>

                {/* Notification list with polling */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {activeType ? `${TYPE_CONFIG[activeType].label} Notifications` : 'All Notifications'}
                    </h2>

                    <NotificationList
                        typeFilter={activeType}
                        searchQuery={searchQuery}
                        onPollingStatus={handlePollingStatus}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default NotificationsPage;
