// ============================================================================
// Theatre Service Unit Tests – M6 (Dinil) – Day 10
// ============================================================================
// Tests for theatreService.js API calls:
// - getAllTheatres()            – GET /theatres (no/with filters)
// - getTheatreById(id)         – GET /theatres/:id
// - updateTheatreStatus(id)    – PUT /theatres/:id/status
// - checkAvailability()        – GET /theatres/availability
// - getCurrentSurgery(id)      – GET /theatres/:id/current-surgery
//
// Run with: npx vitest run src/tests/TheatreService.test.js
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import theatreService from '../services/theatreService';

// ── Mock the shared `api` axios instance exported from authService ───────────
const mockGet = vi.fn();
const mockPut = vi.fn();

vi.mock('../services/authService', () => ({
    api: {
        get: (...args) => mockGet(...args),
        put: (...args) => mockPut(...args),
        post: vi.fn(),
    },
    default: {}
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('theatreService – M6 Day 10', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ========================================================================
    // getAllTheatres()
    // ========================================================================
    describe('getAllTheatres()', () => {
        it('calls GET /theatres with no params when no filters supplied', async () => {
            mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });

            await theatreService.getAllTheatres();

            expect(mockGet).toHaveBeenCalledWith('/theatres');
        });

        it('appends ?status= query param when status filter provided', async () => {
            mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });

            await theatreService.getAllTheatres({ status: 'available' });

            expect(mockGet).toHaveBeenCalledWith('/theatres?status=available');
        });

        it('appends ?type= query param when type filter provided', async () => {
            mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });

            await theatreService.getAllTheatres({ type: 'cardiac' });

            expect(mockGet).toHaveBeenCalledWith('/theatres?type=cardiac');
        });

        it('appends both query params when status + type filters provided', async () => {
            mockGet.mockResolvedValueOnce({ data: { success: true, data: [] } });

            await theatreService.getAllTheatres({ status: 'in_use', type: 'general' });

            const calledUrl = mockGet.mock.calls[0][0];
            expect(calledUrl).toContain('status=in_use');
            expect(calledUrl).toContain('type=general');
        });

        it('returns the data from the API response', async () => {
            const faketheatres = [{ id: 1, name: 'Theatre A', status: 'available' }];
            mockGet.mockResolvedValueOnce({
                data: { success: true, data: faketheatres, count: 1 }
            });

            const result = await theatreService.getAllTheatres();
            expect(result.data).toEqual(faketheatres);
            expect(result.success).toBe(true);
        });

        it('throws an Error when the API call fails', async () => {
            mockGet.mockRejectedValueOnce({
                response: { data: { message: 'Internal server error' } }
            });

            await expect(theatreService.getAllTheatres()).rejects.toThrow('Internal server error');
        });

        it('throws a fallback error when response has no message', async () => {
            mockGet.mockRejectedValueOnce(new Error('Network error'));

            await expect(theatreService.getAllTheatres()).rejects.toThrow(
                'Error fetching theatres. Please try again.'
            );
        });
    });

    // ========================================================================
    // getTheatreById(id)
    // ========================================================================
    describe('getTheatreById()', () => {
        it('calls GET /theatres/:id with the correct id', async () => {
            mockGet.mockResolvedValueOnce({ data: { success: true, data: { id: 42 } } });

            await theatreService.getTheatreById(42);

            expect(mockGet).toHaveBeenCalledWith('/theatres/42');
        });

        it('returns theatre detail data on success', async () => {
            const theatre = { id: 7, name: 'Theatre G', status: 'maintenance' };
            mockGet.mockResolvedValueOnce({ data: { success: true, data: theatre } });

            const result = await theatreService.getTheatreById(7);
            expect(result.data).toEqual(theatre);
        });

        it('throws an Error when the API call fails', async () => {
            mockGet.mockRejectedValueOnce({
                response: { data: { message: 'Theatre not found' } }
            });

            await expect(theatreService.getTheatreById(999)).rejects.toThrow('Theatre not found');
        });
    });

    // ========================================================================
    // updateTheatreStatus(id, status)
    // ========================================================================
    describe('updateTheatreStatus()', () => {
        it('calls PUT /theatres/:id/status with the correct body', async () => {
            mockPut.mockResolvedValueOnce({ data: { success: true, data: { id: 3, status: 'maintenance' } } });

            await theatreService.updateTheatreStatus(3, 'maintenance');

            expect(mockPut).toHaveBeenCalledWith(
                '/theatres/3/status',
                { status: 'maintenance' }
            );
        });

        it('returns the updated theatre data on success', async () => {
            const updated = { id: 3, status: 'maintenance' };
            mockPut.mockResolvedValueOnce({ data: { success: true, data: updated } });

            const result = await theatreService.updateTheatreStatus(3, 'maintenance');
            expect(result.data).toEqual(updated);
        });

        it('throws an Error when the API call fails (e.g. invalid transition)', async () => {
            mockPut.mockRejectedValueOnce({
                response: { data: { message: 'Cannot transition from available to cleaning' } }
            });

            await expect(theatreService.updateTheatreStatus(1, 'cleaning')).rejects.toThrow(
                'Cannot transition from available to cleaning'
            );
        });

        it('throws a fallback error when response has no message', async () => {
            mockPut.mockRejectedValueOnce(new Error('Network error'));

            await expect(theatreService.updateTheatreStatus(1, 'maintenance')).rejects.toThrow(
                'Error updating theatre status. Please try again.'
            );
        });
    });

    // ========================================================================
    // checkAvailability(date, time, duration)
    // ========================================================================
    describe('checkAvailability()', () => {
        it('calls GET /theatres/availability with correct params object', async () => {
            mockGet.mockResolvedValueOnce({
                data: { success: true, data: [], available_count: 0, count: 0 }
            });

            await theatreService.checkAvailability('2025-06-01', '10:00', 90);

            expect(mockGet).toHaveBeenCalledWith('/theatres/availability', {
                params: { date: '2025-06-01', time: '10:00', duration: 90 }
            });
        });

        it('returns the availability data on success', async () => {
            const availData = [{ id: 1, available: true }, { id: 2, available: false }];
            mockGet.mockResolvedValueOnce({
                data: { success: true, data: availData, count: 2, available_count: 1 }
            });

            const result = await theatreService.checkAvailability('2025-06-01', '10:00', 60);
            expect(result.data).toEqual(availData);
        });

        it('throws an Error when params are invalid (API error)', async () => {
            mockGet.mockRejectedValueOnce({
                response: { data: { message: 'Missing required query parameters' } }
            });

            await expect(
                theatreService.checkAvailability(null, null, null)
            ).rejects.toThrow('Missing required query parameters');
        });
    });

    // ========================================================================
    // getCurrentSurgery(id)
    // ========================================================================
    describe('getCurrentSurgery()', () => {
        it('calls GET /theatres/:id/current-surgery with correct URL', async () => {
            mockGet.mockResolvedValueOnce({
                data: { success: true, data: null }
            });

            await theatreService.getCurrentSurgery(5);

            expect(mockGet).toHaveBeenCalledWith('/theatres/5/current-surgery');
        });

        it('returns null data when no surgery is in progress', async () => {
            mockGet.mockResolvedValueOnce({
                data: { success: true, data: null, message: 'No surgery currently in progress' }
            });

            const result = await theatreService.getCurrentSurgery(5);
            expect(result.data).toBeNull();
        });

        it('returns surgery data when surgery is in progress', async () => {
            const surgery = {
                id: 10,
                surgery_type: 'Appendectomy',
                status: 'in_progress',
                patient_name: 'John Doe'
            };
            mockGet.mockResolvedValueOnce({
                data: { success: true, data: surgery }
            });

            const result = await theatreService.getCurrentSurgery(5);
            expect(result.data).toEqual(surgery);
            expect(result.data.status).toBe('in_progress');
        });

        it('throws an Error when the API call fails', async () => {
            mockGet.mockRejectedValueOnce({
                response: { data: { message: 'Theatre not found' } }
            });

            await expect(theatreService.getCurrentSurgery(999)).rejects.toThrow('Theatre not found');
        });

        it('throws a fallback error when response has no message', async () => {
            mockGet.mockRejectedValueOnce(new Error('Network error'));

            await expect(theatreService.getCurrentSurgery(5)).rejects.toThrow(
                'Error fetching current surgery. Please try again.'
            );
        });
    });
});

// ============================================================================
// Day 11 – New Service Methods (M6 Dinil – Day 11)
// Tests for: updateProgress, getAutoProgress, getLiveStatus, getTheatreDuration
// ============================================================================

describe('theatreService – M6 Day 11', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ========================================================================
    // updateProgress(id, progress)
    // ========================================================================
    describe('updateProgress()', () => {
        it('calls PUT /theatres/:id/progress with correct body', async () => {
            mockPut.mockResolvedValueOnce({
                data: { success: true, message: 'updated', data: { theatre_id: 2, surgery: { progress_percent: 65 } } }
            });

            await theatreService.updateProgress(2, 65);

            expect(mockPut).toHaveBeenCalledWith('/theatres/2/progress', { progress: 65 });
        });

        it('returns the updated progress data on success', async () => {
            const responseData = { theatre_id: 2, theatre_name: 'Theatre B', surgery: { progress_percent: 75 } };
            mockPut.mockResolvedValueOnce({ data: { success: true, data: responseData } });

            const result = await theatreService.updateProgress(2, 75);
            expect(result.data).toEqual(responseData);
        });

        it('throws error with API message on validation failure (e.g. progress > 100)', async () => {
            mockPut.mockRejectedValueOnce({
                response: { data: { message: 'Progress must be an integer between 0 and 100' } }
            });

            await expect(theatreService.updateProgress(1, 150)).rejects.toThrow(
                'Progress must be an integer between 0 and 100'
            );
        });

        it('throws error with API message when no in-progress surgery', async () => {
            mockPut.mockRejectedValueOnce({
                response: { data: { message: 'No in-progress surgery found for this theatre' } }
            });

            await expect(theatreService.updateProgress(5, 50)).rejects.toThrow(
                'No in-progress surgery found for this theatre'
            );
        });

        it('throws fallback error when response has no message', async () => {
            mockPut.mockRejectedValueOnce(new Error('Network error'));

            await expect(theatreService.updateProgress(1, 50)).rejects.toThrow(
                'Error updating surgery progress. Please try again.'
            );
        });
    });

    // ========================================================================
    // getAutoProgress(id)
    // ========================================================================
    describe('getAutoProgress()', () => {
        it('calls GET /theatres/:id/auto-progress with correct URL', async () => {
            mockGet.mockResolvedValueOnce({ data: { success: true, data: null } });

            await theatreService.getAutoProgress(3);

            expect(mockGet).toHaveBeenCalledWith('/theatres/3/auto-progress');
        });

        it('returns null data when no surgery is in progress', async () => {
            mockGet.mockResolvedValueOnce({
                data: { success: true, data: null, message: 'No in-progress surgery found for this theatre' }
            });

            const result = await theatreService.getAutoProgress(3);
            expect(result.data).toBeNull();
        });

        it('returns auto-progress data when surgery is in progress', async () => {
            const progressData = {
                theatre_id: 3,
                surgery_id: 10,
                auto_progress: 45,
                elapsed_minutes: 27,
                remaining_minutes: 33,
                is_overdue: false,
                estimated_end_time: '11:00'
            };
            mockGet.mockResolvedValueOnce({ data: { success: true, data: progressData } });

            const result = await theatreService.getAutoProgress(3);
            expect(result.data.auto_progress).toBe(45);
            expect(result.data.is_overdue).toBe(false);
        });

        it('throws error when theatre not found (404)', async () => {
            mockGet.mockRejectedValueOnce({
                response: { data: { message: 'Theatre not found' } }
            });

            await expect(theatreService.getAutoProgress(99999)).rejects.toThrow('Theatre not found');
        });

        it('throws fallback error when response has no message', async () => {
            mockGet.mockRejectedValueOnce(new Error('Network error'));

            await expect(theatreService.getAutoProgress(1)).rejects.toThrow(
                'Error fetching auto-progress. Please try again.'
            );
        });
    });

    // ========================================================================
    // getLiveStatus()
    // ========================================================================
    describe('getLiveStatus()', () => {
        it('calls GET /theatres/live-status', async () => {
            mockGet.mockResolvedValueOnce({
                data: { success: true, polled_at: new Date().toISOString(), summary: {}, data: [] }
            });

            await theatreService.getLiveStatus();

            expect(mockGet).toHaveBeenCalledWith('/theatres/live-status');
        });

        it('returns full response with summary and data array', async () => {
            const liveData = {
                success: true,
                polled_at: '2026-02-23T10:00:00.000Z',
                summary: { total: 4, available: 2, in_use: 1, maintenance: 1, cleaning: 0, overdue: 0 },
                data: [{ id: 1, name: 'Theatre A', status: 'available', current_surgery: null }]
            };
            mockGet.mockResolvedValueOnce({ data: liveData });

            const result = await theatreService.getLiveStatus();
            expect(result.success).toBe(true);
            expect(result.summary.total).toBe(4);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data[0].name).toBe('Theatre A');
        });

        it('returns polled_at as a valid ISO string', async () => {
            const polledAt = new Date().toISOString();
            mockGet.mockResolvedValueOnce({
                data: { success: true, polled_at: polledAt, summary: {}, data: [] }
            });

            const result = await theatreService.getLiveStatus();
            expect(result.polled_at).toBe(polledAt);
            expect(new Date(result.polled_at).toISOString()).toBe(polledAt);
        });

        it('throws error when API fails', async () => {
            mockGet.mockRejectedValueOnce({
                response: { data: { message: 'Server unavailable' } }
            });

            await expect(theatreService.getLiveStatus()).rejects.toThrow('Server unavailable');
        });

        it('throws fallback error when response has no message', async () => {
            mockGet.mockRejectedValueOnce(new Error('Network error'));

            await expect(theatreService.getLiveStatus()).rejects.toThrow(
                'Error fetching live status. Please try again.'
            );
        });
    });

    // ========================================================================
    // getTheatreDuration(id)
    // ========================================================================
    describe('getTheatreDuration()', () => {
        it('calls GET /theatres/:id/duration with correct URL', async () => {
            mockGet.mockResolvedValueOnce({ data: { success: true, data: null } });

            await theatreService.getTheatreDuration(7);

            expect(mockGet).toHaveBeenCalledWith('/theatres/7/duration');
        });

        it('returns null when no in-progress surgery', async () => {
            mockGet.mockResolvedValueOnce({
                data: { success: true, data: null, message: 'No in-progress surgery found for this theatre' }
            });

            const result = await theatreService.getTheatreDuration(7);
            expect(result.data).toBeNull();
        });

        it('returns duration data with expected fields when surgery is in progress', async () => {
            const durationData = {
                theatre_id: 7,
                theatre_name: 'Theatre G',
                surgery_id: 22,
                elapsed_minutes: 35,
                remaining_minutes: 25,
                total_minutes: 60,
                elapsed_formatted: '35m',
                remaining_formatted: '25m',
                is_overdue: false,
                overdue_minutes: 0
            };
            mockGet.mockResolvedValueOnce({ data: { success: true, data: durationData } });

            const result = await theatreService.getTheatreDuration(7);
            expect(result.data.elapsed_minutes).toBe(35);
            expect(result.data.remaining_minutes).toBe(25);
            expect(result.data.total_minutes).toBe(60);
            expect(result.data.elapsed_formatted).toBe('35m');
            expect(result.data.is_overdue).toBe(false);
        });

        it('returns overdue fields when surgery exceeds duration', async () => {
            const overdueData = {
                theatre_id: 7,
                surgery_id: 22,
                elapsed_minutes: 80,
                remaining_minutes: 0,
                total_minutes: 60,
                elapsed_formatted: '1h 20m',
                remaining_formatted: '0m',
                is_overdue: true,
                overdue_minutes: 20
            };
            mockGet.mockResolvedValueOnce({ data: { success: true, data: overdueData } });

            const result = await theatreService.getTheatreDuration(7);
            expect(result.data.is_overdue).toBe(true);
            expect(result.data.overdue_minutes).toBe(20);
        });

        it('throws error when theatre not found', async () => {
            mockGet.mockRejectedValueOnce({
                response: { data: { message: 'Theatre not found' } }
            });

            await expect(theatreService.getTheatreDuration(99999)).rejects.toThrow('Theatre not found');
        });

        it('throws fallback error when response has no message', async () => {
            mockGet.mockRejectedValueOnce(new Error('Network error'));

            await expect(theatreService.getTheatreDuration(7)).rejects.toThrow(
                'Error fetching theatre duration. Please try again.'
            );
        });
    });
});
