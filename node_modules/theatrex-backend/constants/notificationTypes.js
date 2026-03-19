// ============================================================================
// Notification Types Constants
// ============================================================================
// Shared enum of valid notification types. Must stay in sync with the DB
// CHECK constraint on notifications.type.
//
// Created by: M4 (Oneli) - Day 17
// ============================================================================

/**
 * Canonical list of notification types with human-readable labels.
 * Used by controllers, validation, and exposed via GET /api/notifications/types.
 */
export const NOTIFICATION_TYPES = [
    { value: 'reminder', label: 'Reminder' },
    { value: 'alert', label: 'Alert' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'success', label: 'Success' }
];

/** Flat array of type strings for quick validation */
export const VALID_TYPE_VALUES = NOTIFICATION_TYPES.map(t => t.value);
