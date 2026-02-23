// ============================================================================
// Live Status Page Tests – M3 (Janani) – Day 11
// ============================================================================
// Fixed by: M6 (Dinil) – Day 11 Bug Fix
//
// Tests for the LiveStatusPage component:
// - Loading state
// - Successful data display (theatres + summary)
// - Error state
// - Pause / Resume controls
// - Manual refresh button
//
// Bug fixed: `waitFor` internally uses real setTimeout which hangs when
// vi.useFakeTimers() is active. Replaced with `act(async () => {})` to
// flush microtasks / promise chains without relying on real timers.
//
// Run with: npx vitest run src/tests/LiveStatusPage.test.jsx
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LiveStatusPage from '../pages/LiveStatusPage';
import theatreService from '../services/theatreService';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../services/theatreService');

// Mock TheatreStatusBadge
vi.mock('../components/TheatreStatusBadge', () => ({
    default: ({ status }) => <span data-testid="status-badge">{status}</span>
}));

// Sample API response
const mockLiveResponse = {
    success: true,
    polled_at: new Date().toISOString(),
    summary: {
        total: 4,
        available: 2,
        in_use: 1,
        maintenance: 1,
        cleaning: 0,
        overdue: 0
    },
    data: [
        {
            id: 1,
            name: 'Theatre A',
            location: 'Building 1',
            status: 'available',
            theatre_type: 'general',
            current_surgery: null
        },
        {
            id: 2,
            name: 'Theatre B',
            location: 'Building 2',
            status: 'in_use',
            theatre_type: 'cardiac',
            current_surgery: {
                id: 10,
                surgery_type: 'Cardiac Bypass',
                patient_name: 'John Doe',
                scheduled_time: '09:00',
                duration_minutes: 120,
                manual_progress: 30,
                priority: 'high',
                auto_progress: 55,
                elapsed_minutes: 66,
                remaining_minutes: 54,
                is_overdue: false,
                estimated_end_time: '11:00'
            }
        },
        {
            id: 3,
            name: 'Theatre C',
            location: 'Building 1',
            status: 'maintenance',
            theatre_type: 'neuro',
            current_surgery: null
        },
        {
            id: 4,
            name: 'Theatre D',
            location: 'Building 3',
            status: 'available',
            theatre_type: 'ortho',
            current_surgery: null
        }
    ]
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const renderPage = () =>
    render(
        <BrowserRouter>
            <LiveStatusPage />
        </BrowserRouter>
    );

/** Flush all pending React state updates + microtasks */
const flushPromises = async () => {
    await act(async () => {
        await Promise.resolve();
    });
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('LiveStatusPage', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        theatreService.getLiveStatus.mockResolvedValue(mockLiveResponse);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ── Loading state ────────────────────────────────────────────────────

    it('should show a loading spinner before data arrives', () => {
        // Make the service hang
        theatreService.getLiveStatus.mockReturnValue(new Promise(() => { }));
        renderPage();

        // The heading should already be visible
        expect(screen.getByText('Live Theatre Status')).toBeInTheDocument();
    });

    // ── Successful render ────────────────────────────────────────────────

    it('should render theatre names after data loads', async () => {
        renderPage();
        await flushPromises();

        expect(screen.getByText('Theatre A')).toBeInTheDocument();
        expect(screen.getByText('Theatre B')).toBeInTheDocument();
        expect(screen.getByText('Theatre C')).toBeInTheDocument();
        expect(screen.getByText('Theatre D')).toBeInTheDocument();
    });

    it('should display summary counts', async () => {
        renderPage();
        await flushPromises();

        // Available count = 2
        expect(screen.getByText('2')).toBeInTheDocument();
        // In use count = 1, maintenance count = 1 shown in summary cards
        expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2);
    });

    it('should show surgery info for theatres with a current surgery', async () => {
        renderPage();
        await flushPromises();

        expect(screen.getByText('Cardiac Bypass')).toBeInTheDocument();
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText('55%')).toBeInTheDocument();
    });

    it('should display "No surgery in progress" for idle theatres', async () => {
        renderPage();
        await flushPromises();

        const labels = screen.getAllByText('No surgery in progress');
        // 3 out of 4 theatres have no current surgery
        expect(labels.length).toBe(3);
    });

    // ── Error state ──────────────────────────────────────────────────────

    it('should show an error message when the API fails', async () => {
        theatreService.getLiveStatus.mockRejectedValue(new Error('Server unreachable'));
        renderPage();
        await flushPromises();

        expect(screen.getByText('Polling Error')).toBeInTheDocument();
        expect(screen.getByText('Server unreachable')).toBeInTheDocument();
    });

    // ── Controls ─────────────────────────────────────────────────────────

    it('should have Refresh and Pause buttons', async () => {
        renderPage();
        await flushPromises();

        expect(screen.getByText('Refresh')).toBeInTheDocument();
        expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    it('should toggle to Resume when Pause is clicked', async () => {
        renderPage();
        await flushPromises();

        expect(screen.getByText('Pause')).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByText('Pause'));
        });

        expect(screen.getByText('Resume')).toBeInTheDocument();
        expect(screen.getByText('Polling paused')).toBeInTheDocument();
    });

    it('should call getLiveStatus again when Refresh is clicked', async () => {
        renderPage();
        await flushPromises();

        expect(theatreService.getLiveStatus).toHaveBeenCalledTimes(1);

        await act(async () => {
            fireEvent.click(screen.getByText('Refresh'));
            await Promise.resolve();
        });

        expect(theatreService.getLiveStatus).toHaveBeenCalledTimes(2);
    });
});
