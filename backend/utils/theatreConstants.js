// ============================================================================
// Theatre Constants (Single Source of Truth)
// ============================================================================
// Created by: M3 (Janani) - Day 10
//
// Centralised enums and labels for theatre statuses and types.
// Import these everywhere instead of hard-coding strings.
//
// EXPORTS:
//   THEATRE_STATUS          – enum object  { AVAILABLE, IN_USE, … }
//   VALID_THEATRE_STATUSES  – array of valid status strings
//   THEATRE_STATUS_LABELS   – human-readable labels keyed by status
//   THEATRE_TYPE            – enum object  { GENERAL, CARDIAC, … }
//   VALID_THEATRE_TYPES     – array of valid type strings
//   THEATRE_TYPE_LABELS     – human-readable labels keyed by type
//   THEATRE_STATUS_TRANSITIONS – allowed next-statuses per current status
//   isValidTheatreStatus()  – helper predicate
//   isValidTheatreType()    – helper predicate
//   getAllowedTransitions() – returns allowed next statuses for a given status
// ============================================================================

// ── Theatre Status Enum ─────────────────────────────────────────────────────

export const THEATRE_STATUS = Object.freeze({
    AVAILABLE:   'available',
    IN_USE:      'in_use',
    MAINTENANCE: 'maintenance',
    CLEANING:    'cleaning'
});

export const VALID_THEATRE_STATUSES = Object.values(THEATRE_STATUS);

export const THEATRE_STATUS_LABELS = Object.freeze({
    [THEATRE_STATUS.AVAILABLE]:   'Available',
    [THEATRE_STATUS.IN_USE]:      'In Use',
    [THEATRE_STATUS.MAINTENANCE]: 'Maintenance',
    [THEATRE_STATUS.CLEANING]:    'Cleaning'
});

// ── Status Transition Map ───────────────────────────────────────────────────
// Defines which statuses a theatre can move TO from a given status.
// Prevents invalid transitions (e.g. maintenance → in_use directly).

export const THEATRE_STATUS_TRANSITIONS = Object.freeze({
    [THEATRE_STATUS.AVAILABLE]:   [THEATRE_STATUS.IN_USE, THEATRE_STATUS.MAINTENANCE],
    [THEATRE_STATUS.IN_USE]:      [THEATRE_STATUS.AVAILABLE, THEATRE_STATUS.CLEANING],
    [THEATRE_STATUS.MAINTENANCE]: [THEATRE_STATUS.AVAILABLE],
    [THEATRE_STATUS.CLEANING]:    [THEATRE_STATUS.AVAILABLE]
});

// ── Theatre Type Enum ───────────────────────────────────────────────────────

export const THEATRE_TYPE = Object.freeze({
    GENERAL:     'general',
    CARDIAC:     'cardiac',
    NEURO:       'neuro',
    ORTHO:       'ortho',
    EMERGENCY:   'emergency',
    DAY_SURGERY: 'day_surgery'
});

export const VALID_THEATRE_TYPES = Object.values(THEATRE_TYPE);

export const THEATRE_TYPE_LABELS = Object.freeze({
    [THEATRE_TYPE.GENERAL]:     'General',
    [THEATRE_TYPE.CARDIAC]:     'Cardiac',
    [THEATRE_TYPE.NEURO]:       'Neuro',
    [THEATRE_TYPE.ORTHO]:       'Ortho',
    [THEATRE_TYPE.EMERGENCY]:   'Emergency',
    [THEATRE_TYPE.DAY_SURGERY]: 'Day Surgery'
});

// ── Helper Functions ────────────────────────────────────────────────────────

/**
 * Check whether a string is a valid theatre status.
 * @param {string} status
 * @returns {boolean}
 */
export const isValidTheatreStatus = (status) => VALID_THEATRE_STATUSES.includes(status);

/**
 * Check whether a string is a valid theatre type.
 * @param {string} type
 * @returns {boolean}
 */
export const isValidTheatreType = (type) => VALID_THEATRE_TYPES.includes(type);

/**
 * Return the list of statuses a theatre is allowed to transition to
 * from its current status.  Returns an empty array for unknown statuses.
 * @param {string} currentStatus
 * @returns {string[]}
 */
export const getAllowedTransitions = (currentStatus) =>
    THEATRE_STATUS_TRANSITIONS[currentStatus] || [];
