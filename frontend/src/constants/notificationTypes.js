// ============================================================================
// Notification Type Config (Shared)
// ============================================================================
// Single source of truth for notification type icons, colors, and labels.
// Used by NotificationDropdown, NotificationItem, and NotificationsPage.
//
// Created by: M4 (Oneli) - Day 17
// ============================================================================

/**
 * TYPE_CONFIG maps each notification type to:
 *  - icon:  SVG path string (Heroicons outline, 24×24 viewBox)
 *  - bg:    Tailwind background class (light + dark)
 *  - text:  Tailwind text color class (light + dark)
 *  - dot:   Tailwind dot color class
 *  - label: Human-readable label
 */
const TYPE_CONFIG = {
    reminder: {
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        bg: 'bg-blue-100 dark:bg-blue-900/40',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
        label: 'Reminder'
    },
    alert: {
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
        bg: 'bg-red-100 dark:bg-red-900/40',
        text: 'text-red-600 dark:text-red-400',
        dot: 'bg-red-500',
        label: 'Alert'
    },
    info: {
        icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        bg: 'bg-gray-100 dark:bg-slate-700/40',
        text: 'text-gray-600 dark:text-gray-400',
        dot: 'bg-gray-500',
        label: 'Info'
    },
    warning: {
        icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        bg: 'bg-amber-100 dark:bg-amber-900/40',
        text: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-500',
        label: 'Warning'
    },
    success: {
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        bg: 'bg-green-100 dark:bg-green-900/40',
        text: 'text-green-600 dark:text-green-400',
        dot: 'bg-green-500',
        label: 'Success'
    }
};

/** All type keys for building filter tabs */
export const NOTIFICATION_TYPE_KEYS = Object.keys(TYPE_CONFIG);

export default TYPE_CONFIG;
