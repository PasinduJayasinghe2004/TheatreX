// ============================================================================
// Notifications Page
// ============================================================================
// Main page for viewing and managing user notifications
// Created by: M1 (Pasindu) - Day 16
// Updated by: M3 (Janani) - Day 17 — added auto-refresh controls (polling)
// ============================================================================

import { useState, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import NotificationList from '../components/NotificationList';

const NotificationsPage = () => {
    // Polling controls provided by NotificationList via callback
    const pollingRef = useRef({});
    const [pollingState, setPollingState] = useState({
        paused: false,
        lastPolledAt: null
    });

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

    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-outfit">Notifications</h1>
                        <p className="text-sm text-gray-500 mt-1">Stay updated with surgery reminders and system alerts</p>
                    </div>
                </div>

                {/* Polling controls bar */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-4">
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
                                       bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
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

                {/* Notification list with polling */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        All Notifications
                    </h2>

                    <NotificationList onPollingStatus={handlePollingStatus} />
                </div>
            </div>
        </Layout>
    );
};

export default NotificationsPage;
