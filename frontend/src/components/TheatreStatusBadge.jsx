// ============================================================================
// Theatre Status Badge Component
// ============================================================================
// Created by: M1 (Pasindu) - Day 10
//
// Reusable colour-coded theatre-status badge.
//
// Props:
//   status  - 'available' | 'in_use' | 'maintenance' | 'cleaning'
//   size    - 'sm' | 'md' (default 'sm')
//   onClick - optional click handler (e.g. to trigger status change)
// ============================================================================

import React from 'react';

// ── Style maps ──────────────────────────────────────────────────────────────

const THEATRE_STATUS_STYLES = {
    available: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Available'
    },
    in_use: {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        label: 'In Use'
    },
    maintenance: {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Maintenance'
    },
    cleaning: {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
        label: 'Cleaning'
    }
};

const SIZE_CLASSES = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
};

// ── Component ───────────────────────────────────────────────────────────────

const TheatreStatusBadge = ({ status, size = 'sm', onClick }) => {
    const style = THEATRE_STATUS_STYLES[status] || THEATRE_STATUS_STYLES.available;
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

    const Tag = onClick ? 'button' : 'span';

    return (
        <Tag
            className={`
                inline-flex items-center gap-1.5 rounded-full border font-semibold
                ${style.badge} ${sizeClass}
                ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
            `}
            onClick={onClick}
            {...(onClick ? { type: 'button' } : {})}
        >
            {/* Colour dot */}
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
        </Tag>
    );
};

// ── Exported helpers ────────────────────────────────────────────────────────

export const ALL_THEATRE_STATUSES = Object.keys(THEATRE_STATUS_STYLES);

export const THEATRE_STATUS_LABELS = Object.fromEntries(
    Object.entries(THEATRE_STATUS_STYLES).map(([key, val]) => [key, val.label])
);

export const THEATRE_TYPE_LABELS = {
    general: 'General',
    cardiac: 'Cardiac',
    neuro: 'Neuro',
    ortho: 'Ortho',
    emergency: 'Emergency',
    day_surgery: 'Day Surgery'
};

export const ALL_THEATRE_TYPES = Object.keys(THEATRE_TYPE_LABELS);

export default TheatreStatusBadge;
