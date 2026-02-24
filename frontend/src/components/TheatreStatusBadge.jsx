// ============================================================================
// Theatre Status Badge Component
// ============================================================================
// Created by: M1 (Pasindu) - Day 10
// Updated by: M3 (Janani)  - Day 10 (Use centralised theatreStatusColors util)
//
// Reusable colour-coded theatre-status badge.
//
// Props:
//   status  - 'available' | 'in_use' | 'maintenance' | 'cleaning'
//   size    - 'sm' | 'md' (default 'sm')
//   onClick - optional click handler (e.g. to trigger status change)
// ============================================================================


import {
    VALID_THEATRE_STATUSES,
    getStatusLabel,
    getStatusBadgeClasses,
    getStatusDotClass,
    VALID_THEATRE_TYPES,
    getTypeLabel
} from '../utils/theatreStatusColors';

// ── Size classes ────────────────────────────────────────────────────────────

const SIZE_CLASSES = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
};

// ── Component ───────────────────────────────────────────────────────────────

const TheatreStatusBadge = ({ status, size = 'sm', onClick }) => {
    const badgeClasses = getStatusBadgeClasses(status);
    const dotClass = getStatusDotClass(status);
    const label = getStatusLabel(status);
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

    const Tag = onClick ? 'button' : 'span';

    return (
        <Tag
            className={`
                inline-flex items-center gap-1.5 rounded-full border font-semibold
                ${badgeClasses} ${sizeClass}
                ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
            `}
            onClick={onClick}
            {...(onClick ? { type: 'button' } : {})}
        >
            {/* Colour dot */}
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            {label}
        </Tag>
    );
};

// ── Re-exported helpers (keeps existing import paths working) ───────────────

export const ALL_THEATRE_STATUSES = VALID_THEATRE_STATUSES;

export const THEATRE_STATUS_LABELS = Object.fromEntries(
    VALID_THEATRE_STATUSES.map(s => [s, getStatusLabel(s)])
);

export const THEATRE_TYPE_LABELS = Object.fromEntries(
    VALID_THEATRE_TYPES.map(t => [t, getTypeLabel(t)])
);

export const ALL_THEATRE_TYPES = VALID_THEATRE_TYPES;

export default TheatreStatusBadge;
