// ============================================================================
// Scheduler Tests - M6 Day 16
// ============================================================================
// Created by: M6 (Dinil) - Day 16
//
// Tests for checkSurgeryReminders() in utils/scheduler.js
//
// Strategy:
//   - Use jest.unstable_mockModule for ES module mocking (required in Jest ESM)
//   - Mock the database pool and Notification model without real DB calls
//   - Verify deduplication, staff notification, and error handling
//
// Run: npx jest tests/day16_m6_scheduler.test.js --no-coverage --verbose
// ============================================================================

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.setTimeout(15000);

// ── Mock the database pool (must be done before dynamic import) ──────────────
const mockQuery = jest.fn();
jest.unstable_mockModule('../config/database.js', () => ({
    pool: { query: (...args) => mockQuery(...args) }
}));

// ── Mock the Notification model ──────────────────────────────────────────────
const mockNotificationCreate = jest.fn();
jest.unstable_mockModule('../models/notificationModel.js', () => ({
    Notification: {
        create: (...args) => mockNotificationCreate(...args)
    }
}));

// ── Dynamic import AFTER module mocks are registered ────────────────────────
const { checkSurgeryReminders } = await import('../utils/scheduler.js');

// ─────────────────────────────────────────────────────────────────────────────
describe('Scheduler – checkSurgeryReminders (M6 Day 16)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── No upcoming surgeries ─────────────────────────────────────────────────
    it('should not create any notifications when there are no upcoming surgeries', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });

        await checkSurgeryReminders();

        expect(mockNotificationCreate).not.toHaveBeenCalled();
    });

    // ── Surgeon + anaesthetist are both notified ──────────────────────────────
    it('should create one notification per staff member (surgeon + anaesthetist)', async () => {
        const fakeSurgery = {
            surgery_id: 101,
            surgery_type: 'Appendectomy',
            scheduled_date: new Date().toISOString(),
            scheduled_time: '14:00:00',
            surgeon_id: 1,
            anaesthetist_id: 2,
            surgeon_user_id: 10,
            anaesthetist_user_id: 20,
            patient_name: 'John Doe',
            manual_patient_name: null
        };

        // Call sequence (see scheduler.js):
        // 1. Surgery lookup
        mockQuery.mockResolvedValueOnce({ rows: [fakeSurgery] });
        // 2. Nurse lookup for surgery 101
        mockQuery.mockResolvedValueOnce({ rows: [] });
        // 3. Dedup check for surgeon user (10)
        mockQuery.mockResolvedValueOnce({ rows: [] });
        // 4. Dedup check for anaesthetist user (20)
        mockQuery.mockResolvedValueOnce({ rows: [] });

        mockNotificationCreate.mockResolvedValue({ id: 1 });

        await checkSurgeryReminders();

        expect(mockNotificationCreate).toHaveBeenCalledTimes(2);
        expect(mockNotificationCreate).toHaveBeenCalledWith(
            expect.objectContaining({ user_id: 10, type: 'reminder', surgery_id: 101 })
        );
        expect(mockNotificationCreate).toHaveBeenCalledWith(
            expect.objectContaining({ user_id: 20, type: 'reminder', surgery_id: 101 })
        );
    });

    // ── Nurses are also notified ──────────────────────────────────────────────
    it('should also notify nurses assigned to the surgery', async () => {
        const fakeSurgery = {
            surgery_id: 202,
            surgery_type: 'Hip Replacement',
            scheduled_date: new Date().toISOString(),
            scheduled_time: '09:00:00',
            surgeon_id: 1,
            anaesthetist_id: null,
            surgeon_user_id: 30,
            anaesthetist_user_id: null,
            patient_name: 'Jane Smith',
            manual_patient_name: null
        };

        mockQuery.mockResolvedValueOnce({ rows: [fakeSurgery] });         // surgery lookup
        mockQuery.mockResolvedValueOnce({ rows: [{ user_id: 40 }, { user_id: 50 }] }); // nurses
        // Dedup checks all return empty
        mockQuery.mockResolvedValue({ rows: [] });

        mockNotificationCreate.mockResolvedValue({ id: 2 });

        await checkSurgeryReminders();

        // surgeon (30) + nurse (40) + nurse (50) = 3
        expect(mockNotificationCreate).toHaveBeenCalledTimes(3);
    });

    // ── Deduplication prevents duplicate reminders ────────────────────────────
    it('should NOT send a reminder if one has already been sent for the same user+surgery', async () => {
        const fakeSurgery = {
            surgery_id: 303,
            surgery_type: 'Knee Arthroscopy',
            scheduled_date: new Date().toISOString(),
            scheduled_time: '11:00:00',
            surgeon_id: 1,
            anaesthetist_id: null,
            surgeon_user_id: 60,
            anaesthetist_user_id: null,
            patient_name: null,
            manual_patient_name: 'Manual Patient'
        };

        mockQuery.mockResolvedValueOnce({ rows: [fakeSurgery] }); // surgery lookup
        mockQuery.mockResolvedValueOnce({ rows: [] });             // nurse lookup
        // Dedup check returns an existing row → skip
        mockQuery.mockResolvedValueOnce({ rows: [{ id: 99 }] });

        await checkSurgeryReminders();

        expect(mockNotificationCreate).not.toHaveBeenCalled();
    });

    // ── Uses manual_patient_name fallback ────────────────────────────────────
    it('should use manual_patient_name when patient_name is null', async () => {
        const fakeSurgery = {
            surgery_id: 404,
            surgery_type: 'Gallbladder Removal',
            scheduled_date: new Date().toISOString(),
            scheduled_time: '08:30:00',
            surgeon_id: 1,
            anaesthetist_id: null,
            surgeon_user_id: 70,
            anaesthetist_user_id: null,
            patient_name: null,
            manual_patient_name: 'Emergency Patient'
        };

        mockQuery.mockResolvedValueOnce({ rows: [fakeSurgery] });
        mockQuery.mockResolvedValueOnce({ rows: [] }); // nurses
        mockQuery.mockResolvedValueOnce({ rows: [] }); // dedup

        mockNotificationCreate.mockResolvedValue({ id: 3 });

        await checkSurgeryReminders();

        expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
        const callArg = mockNotificationCreate.mock.calls[0][0];
        expect(callArg.message).toContain('Emergency Patient');
    });

    // ── Handles database errors gracefully ────────────────────────────────────
    it('should not throw when a database query fails', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB connection lost'));

        await expect(checkSurgeryReminders()).resolves.not.toThrow();
    });

    // ── Multiple surgeries processed in a single run ──────────────────────────
    it('should process multiple surgeries in one run', async () => {
        const makeSurgery = (id, userId) => ({
            surgery_id: id,
            surgery_type: 'Surgery ' + id,
            scheduled_date: new Date().toISOString(),
            scheduled_time: '10:00',
            surgeon_id: userId,
            anaesthetist_id: null,
            surgeon_user_id: userId,
            anaesthetist_user_id: null,
            patient_name: 'Patient ' + id,
            manual_patient_name: null
        });

        mockQuery.mockResolvedValueOnce({ rows: [makeSurgery(501, 80), makeSurgery(502, 90)] });
        // Surgery 501: nurses + dedup
        mockQuery.mockResolvedValueOnce({ rows: [] });
        mockQuery.mockResolvedValueOnce({ rows: [] });
        // Surgery 502: nurses + dedup
        mockQuery.mockResolvedValueOnce({ rows: [] });
        mockQuery.mockResolvedValueOnce({ rows: [] });

        mockNotificationCreate.mockResolvedValue({ id: 5 });

        await checkSurgeryReminders();

        expect(mockNotificationCreate).toHaveBeenCalledTimes(2);
    });
});
