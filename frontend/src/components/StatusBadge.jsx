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



// ── Style maps ──────────────────────────────────────────────────────────────

import { STATUS_STYLES, VALID_STATUS_TRANSITIONS, STATUS_LABELS, ALL_STATUSES } from '../constants/statusConstants';

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

export { VALID_STATUS_TRANSITIONS, STATUS_LABELS, ALL_STATUSES };
export default StatusBadge;
