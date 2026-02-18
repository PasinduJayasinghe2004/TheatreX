// ============================================================================
// Status Badge Component
// ============================================================================
// Created by: M3 (Janani) - Day 6
//
// Reusable colour-coded surgery-status badge.
//
// Props:
//   status  - 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
//   size    - 'sm' | 'md' (default 'sm')
//   onClick - optional click handler (e.g. to trigger status change)
// ============================================================================

import React from 'react';

// ── Style maps ──────────────────────────────────────────────────────────────

const STATUS_STYLES = {
    scheduled: {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Scheduled'
    },
    in_progress: {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        label: 'In Progress'
    },
    completed: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Completed'
    },
    cancelled: {
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        label: 'Cancelled'
    }
};

const SIZE_CLASSES = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
};

// ── Component ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status, size = 'sm', onClick }) => {
    const style = STATUS_STYLES[status] || STATUS_STYLES.scheduled;
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

// ── Exported helpers (used by status-change UI) ─────────────────────────────

export const VALID_STATUS_TRANSITIONS = {
    scheduled: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: ['scheduled']
};

export const STATUS_LABELS = Object.fromEntries(
    Object.entries(STATUS_STYLES).map(([key, val]) => [key, val.label])
);

export const ALL_STATUSES = Object.keys(STATUS_STYLES);

export default StatusBadge;
