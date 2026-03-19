// ============================================================================
// Notification Item Component
// ============================================================================
// Displays a single notification item with type-based icon, colors, and label.
// Created by: M2 - Day 16
// Updated by: M4 (Oneli) - Day 17 — use shared TYPE_CONFIG, add type label badge
// ============================================================================

import TYPE_CONFIG from '../constants/notificationTypes.js';

const NotificationItem = ({ notification, onMarkRead }) => {
    const { id, type, title, message, is_read, created_at } = notification;
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;

    return (
        <div
            className={`p-4 transition-colors relative ${!is_read ? 'bg-indigo-50/30 dark:bg-indigo-900/20' : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
        >
            {!is_read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
            )}

            <div className="flex items-start gap-3">
                {/* Type icon */}
                <div className={`mt-1 p-2 rounded-lg border ${config.bg} ${config.text} border-current/20`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                    </svg>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-semibold truncate ${!is_read ? 'text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-300'}`}>
                            {title}
                        </h4>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 whitespace-nowrap">
                            {new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${!is_read ? 'text-gray-700 dark:text-slate-300' : 'text-gray-500 dark:text-slate-400'}`}>
                        {message}
                    </p>

                    {/* Type label badge — Day 17 M4 */}
                    <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full ${config.bg} ${config.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                        {config.label}
                    </span>
                </div>

                {!is_read && (
                    <button
                        onClick={() => onMarkRead(id)}
                        className="mt-1 p-1 text-gray-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
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
