// ============================================================================
// Theatre Validation Middleware
// ============================================================================
// Created by: M3 (Janani) - Day 10
//
// Express middleware that validates theatre-related request data before
// the request reaches the controller.
//
// EXPORTS:
//   validateTheatreStatus  – validates PUT /api/theatres/:id/status body
//   validateTheatreFilters – validates GET /api/theatres query params
// ============================================================================

import {
    isValidTheatreStatus,
    isValidTheatreType,
    VALID_THEATRE_STATUSES,
    VALID_THEATRE_TYPES
} from '../utils/theatreConstants.js';

// ============================================================================
// Validate Theatre Status (for PUT /api/theatres/:id/status)
// ============================================================================
// Ensures:
//   1. `status` is present in req.body
//   2. `status` is one of the allowed enum values
// ============================================================================
export const validateTheatreStatus = (req, res, next) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status is required'
        });
    }

    if (!isValidTheatreStatus(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status '${status}'. Must be one of: ${VALID_THEATRE_STATUSES.join(', ')}`
        });
    }

    next();
};

// ============================================================================
// Validate Theatre Query Filters (for GET /api/theatres)
// ============================================================================
// If the caller provides ?status= or ?type=, make sure the values are valid.
// Invalid filter values return 400 instead of silently returning 0 results.
// ============================================================================
export const validateTheatreFilters = (req, res, next) => {
    const { status, type } = req.query;

    if (status && !isValidTheatreStatus(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status filter '${status}'. Must be one of: ${VALID_THEATRE_STATUSES.join(', ')}`
        });
    }

    if (type && !isValidTheatreType(type)) {
        return res.status(400).json({
            success: false,
            message: `Invalid type filter '${type}'. Must be one of: ${VALID_THEATRE_TYPES.join(', ')}`
        });
    }

    next();
};
