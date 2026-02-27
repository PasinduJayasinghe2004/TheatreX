// ============================================================================
// Theatre Constants & Validation Tests (Backend)
// ============================================================================
// Created by: M3 (Janani) - Day 10
//
// Unit tests for:
// - theatreConstants.js  – enum values, helper functions, transitions
// - theatreValidation.js – middleware behaviour (mocked req/res/next)
//
// Run with: npm test -- --testPathPattern=theatreConstants
// ============================================================================

import { describe, it, expect, jest } from '@jest/globals';

import {
    THEATRE_STATUS,
    VALID_THEATRE_STATUSES,
    THEATRE_STATUS_LABELS,
    THEATRE_TYPE,
    VALID_THEATRE_TYPES,
    THEATRE_TYPE_LABELS,
    THEATRE_STATUS_TRANSITIONS,
    isValidTheatreStatus,
    isValidTheatreType,
    getAllowedTransitions
} from '../utils/theatreConstants.js';

import {
    validateTheatreStatus,
    validateTheatreFilters
} from '../middleware/theatreValidation.js';

// ============================================================================
// theatreConstants.js
// ============================================================================
describe('Theatre Constants', () => {
    // ── Enum values ─────────────────────────────────────────────────────────

    it('should define exactly 4 theatre statuses', () => {
        expect(VALID_THEATRE_STATUSES).toHaveLength(4);
        expect(VALID_THEATRE_STATUSES).toEqual([
            'available', 'in_use', 'maintenance', 'cleaning'
        ]);
    });

    it('THEATRE_STATUS should be a frozen enum', () => {
        expect(Object.isFrozen(THEATRE_STATUS)).toBe(true);
        expect(THEATRE_STATUS.AVAILABLE).toBe('available');
        expect(THEATRE_STATUS.IN_USE).toBe('in_use');
        expect(THEATRE_STATUS.MAINTENANCE).toBe('maintenance');
        expect(THEATRE_STATUS.CLEANING).toBe('cleaning');
    });

    it('should define exactly 6 theatre types', () => {
        expect(VALID_THEATRE_TYPES).toHaveLength(6);
        expect(VALID_THEATRE_TYPES).toContain('general');
        expect(VALID_THEATRE_TYPES).toContain('cardiac');
        expect(VALID_THEATRE_TYPES).toContain('neuro');
        expect(VALID_THEATRE_TYPES).toContain('ortho');
        expect(VALID_THEATRE_TYPES).toContain('emergency');
        expect(VALID_THEATRE_TYPES).toContain('day_surgery');
    });

    it('THEATRE_TYPE should be a frozen enum', () => {
        expect(Object.isFrozen(THEATRE_TYPE)).toBe(true);
    });

    // ── Labels ──────────────────────────────────────────────────────────────

    it('THEATRE_STATUS_LABELS should map every status to a string', () => {
        VALID_THEATRE_STATUSES.forEach(s => {
            expect(typeof THEATRE_STATUS_LABELS[s]).toBe('string');
            expect(THEATRE_STATUS_LABELS[s].length).toBeGreaterThan(0);
        });
    });

    it('THEATRE_TYPE_LABELS should map every type to a string', () => {
        VALID_THEATRE_TYPES.forEach(t => {
            expect(typeof THEATRE_TYPE_LABELS[t]).toBe('string');
            expect(THEATRE_TYPE_LABELS[t].length).toBeGreaterThan(0);
        });
    });

    // ── isValidTheatreStatus ────────────────────────────────────────────────

    it('isValidTheatreStatus returns true for valid statuses', () => {
        VALID_THEATRE_STATUSES.forEach(s => {
            expect(isValidTheatreStatus(s)).toBe(true);
        });
    });

    it('isValidTheatreStatus returns false for invalid strings', () => {
        expect(isValidTheatreStatus('unknown')).toBe(false);
        expect(isValidTheatreStatus('')).toBe(false);
        expect(isValidTheatreStatus(null)).toBe(false);
        expect(isValidTheatreStatus(undefined)).toBe(false);
    });

    // ── isValidTheatreType ──────────────────────────────────────────────────

    it('isValidTheatreType returns true for valid types', () => {
        VALID_THEATRE_TYPES.forEach(t => {
            expect(isValidTheatreType(t)).toBe(true);
        });
    });

    it('isValidTheatreType returns false for invalid strings', () => {
        expect(isValidTheatreType('magic')).toBe(false);
        expect(isValidTheatreType('')).toBe(false);
    });

    // ── Transitions ─────────────────────────────────────────────────────────

    it('THEATRE_STATUS_TRANSITIONS should be frozen', () => {
        expect(Object.isFrozen(THEATRE_STATUS_TRANSITIONS)).toBe(true);
    });

    it('getAllowedTransitions returns correct transitions for available', () => {
        expect(getAllowedTransitions('available')).toEqual(['in_use', 'maintenance']);
    });

    it('getAllowedTransitions returns correct transitions for in_use', () => {
        expect(getAllowedTransitions('in_use')).toEqual(['available', 'cleaning']);
    });

    it('getAllowedTransitions returns correct transitions for maintenance', () => {
        expect(getAllowedTransitions('maintenance')).toEqual(['available']);
    });

    it('getAllowedTransitions returns correct transitions for cleaning', () => {
        expect(getAllowedTransitions('cleaning')).toEqual(['available']);
    });

    it('getAllowedTransitions returns empty array for unknown status', () => {
        expect(getAllowedTransitions('invalid')).toEqual([]);
    });

    it('no status can transition to itself', () => {
        VALID_THEATRE_STATUSES.forEach(s => {
            expect(getAllowedTransitions(s)).not.toContain(s);
        });
    });
});

// ============================================================================
// theatreValidation.js middleware
// ============================================================================
describe('Theatre Validation Middleware', () => {
    // Helper to create mock Express req / res / next
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    const mockNext = () => jest.fn();

    // ── validateTheatreStatus ───────────────────────────────────────────────

    describe('validateTheatreStatus', () => {
        it('calls next() for a valid status', () => {
            const req = { body: { status: 'available' } };
            const res = mockRes();
            const next = mockNext();

            validateTheatreStatus(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('returns 400 when status is missing', () => {
            const req = { body: {} };
            const res = mockRes();
            const next = mockNext();

            validateTheatreStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: 'Status is required'
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 400 for an invalid status value', () => {
            const req = { body: { status: 'broken' } };
            const res = mockRes();
            const next = mockNext();

            validateTheatreStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('Invalid status')
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('accepts all valid statuses', () => {
            VALID_THEATRE_STATUSES.forEach(status => {
                const req = { body: { status } };
                const res = mockRes();
                const next = mockNext();

                validateTheatreStatus(req, res, next);
                expect(next).toHaveBeenCalled();
            });
        });
    });

    // ── validateTheatreFilters ──────────────────────────────────────────────

    describe('validateTheatreFilters', () => {
        it('calls next() when no filters are provided', () => {
            const req = { query: {} };
            const res = mockRes();
            const next = mockNext();

            validateTheatreFilters(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('calls next() for valid status filter', () => {
            const req = { query: { status: 'in_use' } };
            const res = mockRes();
            const next = mockNext();

            validateTheatreFilters(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('calls next() for valid type filter', () => {
            const req = { query: { type: 'cardiac' } };
            const res = mockRes();
            const next = mockNext();

            validateTheatreFilters(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('returns 400 for invalid status filter', () => {
            const req = { query: { status: 'destroyed' } };
            const res = mockRes();
            const next = mockNext();

            validateTheatreFilters(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('Invalid status filter')
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('returns 400 for invalid type filter', () => {
            const req = { query: { type: 'magic' } };
            const res = mockRes();
            const next = mockNext();

            validateTheatreFilters(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: expect.stringContaining('Invalid type filter')
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('calls next() when both valid filters are provided', () => {
            const req = { query: { status: 'available', type: 'general' } };
            const res = mockRes();
            const next = mockNext();

            validateTheatreFilters(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });
});
