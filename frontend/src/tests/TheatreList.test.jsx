// ============================================================================
// Theatre List Page Tests – M6 (Dinil) – Day 10
// ============================================================================
// Tests for the TheatreList page component:
// - Loading state
// - Success state (theatres displayed)
// - Empty state (no theatres)
// - Error state (API failure)
// - Filter interactions (status, type)
//
// Run with: npx vitest run src/tests/TheatreList.test.jsx
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TheatreList from '../pages/TheatreList';
import theatreService from '../services/theatreService';

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock theatreService entirely
vi.mock('../services/theatreService');

// Mock AuthContext
const mockCoordinatorUser = { id: 1, name: 'Test Coordinator', role: 'coordinator' };
let mockUser = mockCoordinatorUser;

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ user: mockUser })
}));

// Mock TheatreCard – renders a simple div with the theatre name so our tests work
vi.mock('../components/TheatreCard', () => ({
    default: ({ theatre }) => (
        <div data-testid={`theatre-card-${theatre.id}`}>
            <span>{theatre.name}</span>
            <span>{theatre.status}</span>
        </div>
    )
}));

// Mock TheatreStatusBadge AND its named exports that TheatreList uses
vi.mock('../components/TheatreStatusBadge', () => ({
    default: ({ status }) => <span data-testid="status-badge">{status}</span>,
    ALL_THEATRE_STATUSES: ['available', 'in_use', 'maintenance', 'cleaning'],
    THEATRE_STATUS_LABELS: {
        available: 'Available',
        in_use: 'In Use',
        maintenance: 'Maintenance',
        cleaning: 'Cleaning'
    },
    ALL_THEATRE_TYPES: ['general', 'cardiac', 'neuro', 'ortho', 'emergency', 'day_surgery'],
    THEATRE_TYPE_LABELS: {
        general: 'General',
        cardiac: 'Cardiac',
        neuro: 'Neuro',
        ortho: 'Ortho',
        emergency: 'Emergency',
        day_surgery: 'Day Surgery'
    }
}));

// Mock TheatreStatusLegend – renders a simple div
vi.mock('../components/TheatreStatusLegend', () => ({
    default: () => <div data-testid="theatre-status-legend" />
}));

// ── Test Data ────────────────────────────────────────────────────────────────

const mockTheatres = [
    {
        id: 1,
        name: 'Theatre A',
        location: 'Block 1',
        status: 'available',
        theatre_type: 'general',
        capacity: 10,
        is_active: true,
        current_surgery_id: null
    },
    {
        id: 2,
        name: 'Theatre B',
        location: 'Block 2',
        status: 'in_use',
        theatre_type: 'cardiac',
        capacity: 8,
        is_active: true,
        current_surgery_id: 5
    },
    {
        id: 3,
        name: 'Theatre C',
        location: 'Block 3',
        status: 'maintenance',
        theatre_type: 'neuro',
        capacity: 6,
        is_active: true,
        current_surgery_id: null
    }
];

// ── Helper ───────────────────────────────────────────────────────────────────

const renderPage = () =>
    render(
        <BrowserRouter>
            <TheatreList />
        </BrowserRouter>
    );

// ============================================================================
// TEST SUITES
// ============================================================================

describe('TheatreList Page – M6 Day 10', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = mockCoordinatorUser;
    });

    // ========================================================================
    // Loading State
    // ========================================================================
    describe('Loading State', () => {
        it('should show a loading spinner while data is being fetched', async () => {
            theatreService.getAllTheatres.mockImplementation(
                () => new Promise(() => { }) // never resolves, stays in loading
            );

            const { container } = renderPage();
            expect(container.querySelector('.animate-spin')).toBeTruthy();
        });
    });

    // ========================================================================
    // Success State
    // ========================================================================
    describe('Success State', () => {
        beforeEach(() => {
            theatreService.getAllTheatres.mockResolvedValue({
                success: true,
                data: mockTheatres
            });
        });

        it('should display the page title "Theatres"', async () => {
            renderPage();
            await waitFor(() => expect(screen.getByTestId('theatre-list-title')).toBeInTheDocument());
        });

        it('should show correct theatre count (3)', async () => {
            renderPage();
            await waitFor(() => expect(screen.getByText('3 theatres found')).toBeInTheDocument());
        });

        it('should display all theatre names', async () => {
            renderPage();
            await waitFor(() => {
                expect(screen.getByText('Theatre A')).toBeInTheDocument();
                expect(screen.getByText('Theatre B')).toBeInTheDocument();
                expect(screen.getByText('Theatre C')).toBeInTheDocument();
            });
        });

        it('should call getAllTheatres on mount', async () => {
            renderPage();
            await waitFor(() =>
                expect(theatreService.getAllTheatres).toHaveBeenCalledTimes(1)
            );
        });

        it('should display the status summary cards for all 4 statuses', async () => {
            renderPage();
            await waitFor(() => {
                // Each label appears in both the status card AND the dropdown option,
                // so we use queryAllByText and assert at least one match exists.
                expect(screen.queryAllByText('Available').length).toBeGreaterThan(0);
                expect(screen.queryAllByText('In Use').length).toBeGreaterThan(0);
                expect(screen.queryAllByText('Maintenance').length).toBeGreaterThan(0);
                expect(screen.queryAllByText('Cleaning').length).toBeGreaterThan(0);
            });
        });
    });

    // ========================================================================
    // Empty State
    // ========================================================================
    describe('Empty State', () => {
        it('should show "No Theatres Found" when the list is empty', async () => {
            theatreService.getAllTheatres.mockResolvedValue({
                success: true,
                data: []
            });

            renderPage();
            await waitFor(() =>
                expect(screen.getByText('No Theatres Found')).toBeInTheDocument()
            );
        });

        it('should show "0 theatres found" count when list is empty', async () => {
            theatreService.getAllTheatres.mockResolvedValue({
                success: true,
                data: []
            });

            renderPage();
            await waitFor(() =>
                expect(screen.getByText('0 theatres found')).toBeInTheDocument()
            );
        });

        it('should display "No theatres have been configured yet." when no filter is active', async () => {
            theatreService.getAllTheatres.mockResolvedValue({
                success: true,
                data: []
            });

            renderPage();
            await waitFor(() =>
                expect(
                    screen.getByText('No theatres have been configured yet.')
                ).toBeInTheDocument()
            );
        });
    });

    // ========================================================================
    // Error State
    // ========================================================================
    describe('Error State', () => {
        it('should show error heading when API throws', async () => {
            theatreService.getAllTheatres.mockRejectedValue(new Error('Network timeout'));

            renderPage();
            await waitFor(() =>
                expect(screen.getByText('Error Loading Theatres')).toBeInTheDocument()
            );
        });

        it('should display the error message text', async () => {
            theatreService.getAllTheatres.mockRejectedValue(new Error('Network timeout'));

            renderPage();
            await waitFor(() =>
                expect(screen.getByText('Network timeout')).toBeInTheDocument()
            );
        });

        it('should show "Try Again" button on error', async () => {
            theatreService.getAllTheatres.mockRejectedValue(new Error('Server error'));

            renderPage();
            await waitFor(() =>
                expect(screen.getByText('Try Again')).toBeInTheDocument()
            );
        });

        it('"Try Again" button should re-trigger the API call', async () => {
            theatreService.getAllTheatres
                .mockRejectedValueOnce(new Error('First failure'))
                .mockResolvedValueOnce({ success: true, data: [] });

            renderPage();

            await waitFor(() =>
                expect(screen.getByText('Try Again')).toBeInTheDocument()
            );

            fireEvent.click(screen.getByText('Try Again'));

            await waitFor(() =>
                expect(theatreService.getAllTheatres).toHaveBeenCalledTimes(2)
            );
        });

        it('should show error state when success is false', async () => {
            theatreService.getAllTheatres.mockResolvedValue({
                success: false,
                message: 'Unauthorized access'
            });

            renderPage();
            await waitFor(() =>
                expect(screen.getByText('Error Loading Theatres')).toBeInTheDocument()
            );
        });
    });

    // ========================================================================
    // Filter Behaviour
    // ========================================================================
    describe('Filter Behaviour', () => {
        beforeEach(() => {
            theatreService.getAllTheatres.mockResolvedValue({
                success: true,
                data: mockTheatres
            });
        });

        it('should show "All Statuses" select option by default', async () => {
            renderPage();
            await waitFor(() => {
                const select = screen.getByDisplayValue('All Statuses');
                expect(select).toBeInTheDocument();
            });
        });

        it('should show "All Types" select option by default', async () => {
            renderPage();
            await waitFor(() => {
                const select = screen.getByDisplayValue('All Types');
                expect(select).toBeInTheDocument();
            });
        });

        it('should re-fetch when a status filter is selected', async () => {
            renderPage();
            await waitFor(() => screen.getByDisplayValue('All Statuses'));

            const statusSelect = screen.getByDisplayValue('All Statuses');
            fireEvent.change(statusSelect, { target: { value: 'available' } });

            await waitFor(() =>
                // Called once on mount + once on filter change = 2 total
                expect(theatreService.getAllTheatres).toHaveBeenCalledTimes(2)
            );
        });

        it('should re-fetch when a type filter is selected', async () => {
            renderPage();
            await waitFor(() => screen.getByDisplayValue('All Types'));

            const typeSelect = screen.getByDisplayValue('All Types');
            fireEvent.change(typeSelect, { target: { value: 'general' } });

            await waitFor(() =>
                expect(theatreService.getAllTheatres).toHaveBeenCalledTimes(2)
            );
        });

        it('should call getAllTheatres with status filter param', async () => {
            renderPage();
            await waitFor(() => screen.getByDisplayValue('All Statuses'));

            const statusSelect = screen.getByDisplayValue('All Statuses');
            fireEvent.change(statusSelect, { target: { value: 'in_use' } });

            await waitFor(() => {
                const calls = theatreService.getAllTheatres.mock.calls;
                const lastCall = calls[calls.length - 1][0];
                expect(lastCall.status).toBe('in_use');
            });
        });

        it('should pass null type filter when "All Types" stays selected', async () => {
            renderPage();
            await waitFor(() => screen.getByDisplayValue('All Types'));

            // Initial call should have null type
            const firstCall = theatreService.getAllTheatres.mock.calls[0][0];
            expect(firstCall.type).toBeNull();
        });
    });

    // ========================================================================
    // Count Display (singular vs plural)
    // ========================================================================
    describe('Count Display', () => {
        it('should say "1 theatre found" (singular) for one theatre', async () => {
            theatreService.getAllTheatres.mockResolvedValue({
                success: true,
                data: [mockTheatres[0]]
            });

            renderPage();
            await waitFor(() =>
                expect(screen.getByText('1 theatre found')).toBeInTheDocument()
            );
        });

        it('should say "3 theatres found" (plural) for multiple theatres', async () => {
            theatreService.getAllTheatres.mockResolvedValue({
                success: true,
                data: mockTheatres
            });

            renderPage();
            await waitFor(() =>
                expect(screen.getByText('3 theatres found')).toBeInTheDocument()
            );
        });
    });
});
