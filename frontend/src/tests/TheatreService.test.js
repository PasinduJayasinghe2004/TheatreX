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
