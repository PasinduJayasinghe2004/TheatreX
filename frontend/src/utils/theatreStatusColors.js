// ============================================================================
// Theatre Status Color Utility
// ============================================================================
// Created by: M3 (Janani) - Day 10
//
// Single source of truth for theatre-status colour tokens used across the
// frontend.  Import this utility instead of hard-coding Tailwind classes
// in every component.
//
// Each status maps to a coherent set of colour tokens:
//   bg, text, border       – for badges / pills
//   dot                    – small indicator dot
//   gradient               – gradient pair for banners
//   cardBorder             – left-border accent for cards
//   iconBg, iconText       – for icon containers
//   ringColor              – focus-ring colour
//
// EXPORTS:
//   THEATRE_STATUS_COLORS  – full colour-map keyed by status
//   getStatusColor()       – safe lookup (falls back to available)
//   getStatusLabel()       – human-readable label
//   getStatusDotClass()    – quick dot colour class
//   getStatusBadgeClasses()– badge bg + text + border
//   getStatusGradient()    – gradient string
//   THEATRE_TYPE_COLORS    – colour-map keyed by theatre type
//   getTypeColor()         – safe lookup for type colours
//   getTypeLabel()         – human-readable type label
// ============================================================================

// ── Status Enum (mirrors backend) ───────────────────────────────────────────

export const THEATRE_STATUS = Object.freeze({
    AVAILABLE:   'available',
    IN_USE:      'in_use',
    MAINTENANCE: 'maintenance',
    CLEANING:    'cleaning'
});

export const VALID_THEATRE_STATUSES = Object.values(THEATRE_STATUS);

// ── Status Colour Map ───────────────────────────────────────────────────────

export const THEATRE_STATUS_COLORS = Object.freeze({
    [THEATRE_STATUS.AVAILABLE]: {
        label:      'Available',
        bg:         'bg-emerald-50',
        text:       'text-emerald-700',
        border:     'border-emerald-200',
        dot:        'bg-emerald-500',
        gradient:   'from-emerald-500 to-emerald-600',
        cardBorder: 'border-l-emerald-500',
        iconBg:     'bg-emerald-50',
        iconText:   'text-emerald-600',
        ringColor:  'ring-emerald-300',
        hex:        '#10b981'     // emerald-500
    },
    [THEATRE_STATUS.IN_USE]: {
        label:      'In Use',
        bg:         'bg-blue-50',
        text:       'text-blue-700',
        border:     'border-blue-200',
        dot:        'bg-blue-500',
        gradient:   'from-blue-500 to-blue-600',
        cardBorder: 'border-l-blue-500',
        iconBg:     'bg-blue-50',
        iconText:   'text-blue-600',
        ringColor:  'ring-blue-300',
        hex:        '#3b82f6'     // blue-500
    },
    [THEATRE_STATUS.MAINTENANCE]: {
        label:      'Maintenance',
        bg:         'bg-amber-50',
        text:       'text-amber-700',
        border:     'border-amber-200',
        dot:        'bg-amber-500',
        gradient:   'from-amber-500 to-amber-600',
        cardBorder: 'border-l-amber-500',
        iconBg:     'bg-amber-50',
        iconText:   'text-amber-600',
        ringColor:  'ring-amber-300',
        hex:        '#f59e0b'     // amber-500
    },
    [THEATRE_STATUS.CLEANING]: {
        label:      'Cleaning',
        bg:         'bg-purple-50',
        text:       'text-purple-700',
        border:     'border-purple-200',
        dot:        'bg-purple-500',
        gradient:   'from-purple-500 to-purple-600',
        cardBorder: 'border-l-purple-500',
        iconBg:     'bg-purple-50',
        iconText:   'text-purple-600',
        ringColor:  'ring-purple-300',
        hex:        '#a855f7'     // purple-500
    }
});

// ── Status Helper Functions ─────────────────────────────────────────────────

/** Safe lookup — returns the full colour token set, falling back to AVAILABLE */
export const getStatusColor = (status) =>
    THEATRE_STATUS_COLORS[status] || THEATRE_STATUS_COLORS[THEATRE_STATUS.AVAILABLE];

/** Human-readable label for a status */
export const getStatusLabel = (status) =>
    getStatusColor(status).label;

/** Dot indicator class (e.g. for small coloured circles) */
export const getStatusDotClass = (status) =>
    getStatusColor(status).dot;

/** Combined badge classes: bg + text + border */
export const getStatusBadgeClasses = (status) => {
    const c = getStatusColor(status);
    return `${c.bg} ${c.text} ${c.border}`;
};

/** Gradient classes for banners / headers */
export const getStatusGradient = (status) =>
    getStatusColor(status).gradient;

/** Card left-border accent class */
export const getStatusCardBorder = (status) =>
    getStatusColor(status).cardBorder;

/** Hex colour value (useful for charts / canvas) */
export const getStatusHex = (status) =>
    getStatusColor(status).hex;

// ── Theatre Type Enum (mirrors backend) ─────────────────────────────────────

export const THEATRE_TYPE = Object.freeze({
    GENERAL:     'general',
    CARDIAC:     'cardiac',
    NEURO:       'neuro',
    ORTHO:       'ortho',
    EMERGENCY:   'emergency',
    DAY_SURGERY: 'day_surgery'
});

export const VALID_THEATRE_TYPES = Object.values(THEATRE_TYPE);

// ── Type Colour Map ─────────────────────────────────────────────────────────

export const THEATRE_TYPE_COLORS = Object.freeze({
    [THEATRE_TYPE.GENERAL]:     { label: 'General',     bg: 'bg-gray-100',    text: 'text-gray-700',   hex: '#6b7280' },
    [THEATRE_TYPE.CARDIAC]:     { label: 'Cardiac',     bg: 'bg-red-50',      text: 'text-red-700',    hex: '#ef4444' },
    [THEATRE_TYPE.NEURO]:       { label: 'Neuro',       bg: 'bg-indigo-50',   text: 'text-indigo-700', hex: '#6366f1' },
    [THEATRE_TYPE.ORTHO]:       { label: 'Ortho',       bg: 'bg-teal-50',     text: 'text-teal-700',   hex: '#14b8a6' },
    [THEATRE_TYPE.EMERGENCY]:   { label: 'Emergency',   bg: 'bg-rose-50',     text: 'text-rose-700',   hex: '#f43f5e' },
    [THEATRE_TYPE.DAY_SURGERY]: { label: 'Day Surgery',  bg: 'bg-sky-50',      text: 'text-sky-700',    hex: '#0ea5e9' }
});

// ── Type Helper Functions ───────────────────────────────────────────────────

/** Safe lookup for type colour tokens */
export const getTypeColor = (type) =>
    THEATRE_TYPE_COLORS[type] || THEATRE_TYPE_COLORS[THEATRE_TYPE.GENERAL];

/** Human-readable type label */
export const getTypeLabel = (type) =>
    getTypeColor(type).label;

/** Combined type badge classes */
export const getTypeBadgeClasses = (type) => {
    const c = getTypeColor(type);
    return `${c.bg} ${c.text}`;
};

// ── Allowed Transitions (mirrors backend) ───────────────────────────────────

export const THEATRE_STATUS_TRANSITIONS = Object.freeze({
    [THEATRE_STATUS.AVAILABLE]:   [THEATRE_STATUS.IN_USE, THEATRE_STATUS.MAINTENANCE],
    [THEATRE_STATUS.IN_USE]:      [THEATRE_STATUS.AVAILABLE, THEATRE_STATUS.CLEANING],
    [THEATRE_STATUS.MAINTENANCE]: [THEATRE_STATUS.AVAILABLE],
    [THEATRE_STATUS.CLEANING]:    [THEATRE_STATUS.AVAILABLE]
});

/** Returns the allowed next statuses for a given current status */
export const getAllowedTransitions = (currentStatus) =>
    THEATRE_STATUS_TRANSITIONS[currentStatus] || [];
