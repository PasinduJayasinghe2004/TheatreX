// ============================================================================
// Notification Item Component
// ============================================================================
// Displays a single notification item
// Created by: M2 - Day 16
// ============================================================================

import React from 'react';

const NotificationItem = ({ notification, onMarkRead }) => {
    const { id, type, title, message, is_read, created_at } = notification;

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

    return (
        <div
            className={`p-4 transition-colors relative ${!is_read ? 'bg-indigo-50/30' : 'bg-white hover:bg-gray-50'}`}
        >
            {!is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
            )}

            <div className="flex items-start gap-3">
                <div className={`mt-1 p-2 rounded-lg border ${getTypeStyles(type)}`}>
                    {getTypeIcon(type)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-semibold truncate ${!is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {title}
                        </h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${!is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {message}
                    </p>
                </div>

                {!is_read && (
                    <button
                        onClick={() => onMarkRead(id)}
                        className="mt-1 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Mark as read"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationItem;
