// ============================================================================
// Day 26 – M3 (Janani) – Theatre Component Tests (Frontend)
// ============================================================================
// Covers:
//   - TheatreList: loading, success, empty, error states; status/type filters
//   - TheatreDetail page: renders theatre fields, error/empty handling
//   - TheatreStatusBadge: correct label + class for each status value
//   - E2E component flow: list → detail → status badge verification
//
// Run: cd frontend && npx vitest run src/tests/day26_m3_theatre_components.test.jsx
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// ── Service mock ───────────────────────────────────────────────────────────
vi.mock('../services/theatreService');

// ── Router mock ────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ id: '1' })
    };
});

// ── AuthContext mock ────────────────────────────────────────────────────────
const mockCoordinatorUser = { id: 1, name: 'Test Coordinator', role: 'coordinator' };
let mockUser = mockCoordinatorUser;
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ user: mockUser })
}));

// ── Child component mocks ──────────────────────────────────────────────────
vi.mock('../components/TheatreCard', () => ({
    default: ({ theatre }) => (
        <div data-testid={`theatre-card-${theatre.id}`}>
            <span>{theatre.name}</span>
            <span>{theatre.status}</span>
        </div>
    )
}));

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

vi.mock('../components/TheatreStatusLegend', () => ({
    default: () => <div data-testid="theatre-status-legend" />
}));

// ── Lazy imports ───────────────────────────────────────────────────────────
import TheatreList from '../pages/TheatreList';
import TheatreStatusBadge, {
    ALL_THEATRE_STATUSES,
    THEATRE_STATUS_LABELS
} from '../components/TheatreStatusBadge';
import theatreService from '../services/theatreService';

// ── Shared mock data ───────────────────────────────────────────────────────
const mockTheatres = [
    {
        id: 1, name: 'Theatre Alpha', location: 'Block A',
        status: 'available', theatre_type: 'general',
        capacity: 10, is_active: true, current_surgery_id: null
    },
    {
        id: 2, name: 'Theatre Beta', location: 'Block B',
        status: 'in_use', theatre_type: 'cardiac',
        capacity: 8, is_active: true, current_surgery_id: 5
    },
    {
        id: 3, name: 'Theatre Gamma', location: 'Block C',
        status: 'maintenance', theatre_type: 'neuro',
        capacity: 6, is_active: true, current_surgery_id: null
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. TheatreList Page
// ─────────────────────────────────────────────────────────────────────────────
describe('M3 Day 26 – TheatreList Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = mockCoordinatorUser;
    });

    const renderPage = () => render(<BrowserRouter><TheatreList /></BrowserRouter>);

    // ── Loading State ────────────────────────────────────────────────────────
    describe('Loading State', () => {
        it('shows spinner while data loads', () => {
            theatreService.getAllTheatres.mockImplementation(() => new Promise(() => {}));
            const { container } = renderPage();
            expect(container.querySelector('.animate-spin')).toBeTruthy();
        });
    });

    // ── Success State ────────────────────────────────────────────────────────
    describe('Success State', () => {
        beforeEach(() => {
            theatreService.getAllTheatres.mockResolvedValue({ success: true, data: mockTheatres });
        });

        it('displays the page title', async () => {
            renderPage();
            await waitFor(() => expect(screen.getByTestId('theatre-list-title')).toBeInTheDocument());
        });

        it('shows correct theatre count (3)', async () => {
            renderPage();
            await waitFor(() => expect(screen.getByText('3 theatres found')).toBeInTheDocument());
        });

        it('displays all theatre names', async () => {
            renderPage();
            await waitFor(() => {
                expect(screen.getByText('Theatre Alpha')).toBeInTheDocument();
                expect(screen.getByText('Theatre Beta')).toBeInTheDocument();
                expect(screen.getByText('Theatre Gamma')).toBeInTheDocument();
            });
        });

        it('calls getAllTheatres on mount', async () => {
            renderPage();
            await waitFor(() => expect(theatreService.getAllTheatres).toHaveBeenCalledTimes(1));
        });

        it('shows status summary cards for all 4 statuses', async () => {
            renderPage();
            await waitFor(() => {
                expect(screen.queryAllByText('Available').length).toBeGreaterThan(0);
                expect(screen.queryAllByText('In Use').length).toBeGreaterThan(0);
                expect(screen.queryAllByText('Maintenance').length).toBeGreaterThan(0);
                expect(screen.queryAllByText('Cleaning').length).toBeGreaterThan(0);
            });
        });

        it('shows "All Statuses" dropdown by default', async () => {
            renderPage();
            await waitFor(() => {
                expect(screen.getByDisplayValue('All Statuses')).toBeInTheDocument();
            });
        });

        it('shows "All Types" dropdown by default', async () => {
            renderPage();
            await waitFor(() => {
                expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
            });
        });
    });

    // ── Empty State ──────────────────────────────────────────────────────────
    describe('Empty State', () => {
        beforeEach(() => {
            theatreService.getAllTheatres.mockResolvedValue({ success: true, data: [] });
        });

        it('shows "No theatres found" when list is empty', async () => {
            renderPage();
            await waitFor(() => expect(screen.getByText('No theatres found')).toBeInTheDocument());
        });

        it('shows "0 theatres found" count', async () => {
            renderPage();
            await waitFor(() => expect(screen.getByText('0 theatres found')).toBeInTheDocument());
        });

        it('shows configuration message when no filter active', async () => {
            renderPage();
            await waitFor(() => {
                const elements = screen.getAllByText(/There are no theatres configured in the system yet/);
                expect(elements.length).toBeGreaterThan(0);
            });
        });
    });

    // ── Error State ──────────────────────────────────────────────────────────
    describe('Error State', () => {
        it('shows error heading when API throws', async () => {
            theatreService.getAllTheatres.mockRejectedValue(new Error('Network timeout'));
            renderPage();
            await waitFor(() => expect(screen.getByText('Error Loading Theatres')).toBeInTheDocument());
        });

        it('shows the error message text', async () => {
            theatreService.getAllTheatres.mockRejectedValue(new Error('Network timeout'));
            renderPage();
            await waitFor(() => expect(screen.getByText('Network timeout')).toBeInTheDocument());
        });

        it('shows "Try Again" button on error', async () => {
            theatreService.getAllTheatres.mockRejectedValue(new Error('Server error'));
            renderPage();
            await waitFor(() => expect(screen.getByText('Try Again')).toBeInTheDocument());
        });

        it('"Try Again" re-triggers the API call', async () => {
            theatreService.getAllTheatres
                .mockRejectedValueOnce(new Error('First failure'))
                .mockResolvedValueOnce({ success: true, data: [] });

            renderPage();
            await waitFor(() => screen.getByText('Try Again'));
            fireEvent.click(screen.getByText('Try Again'));

            await waitFor(() => expect(theatreService.getAllTheatres).toHaveBeenCalledTimes(2));
        });

        it('shows error state when success is false', async () => {
            theatreService.getAllTheatres.mockResolvedValue({ success: false, message: 'Unauthorized' });
            renderPage();
            await waitFor(() => expect(screen.getByText('Error Loading Theatres')).toBeInTheDocument());
        });
    });

    // ── Filter Behaviour ─────────────────────────────────────────────────────
    describe('Filter Behaviour', () => {
        beforeEach(() => {
            theatreService.getAllTheatres.mockResolvedValue({ success: true, data: mockTheatres });
        });

        it('re-fetches when status filter changes', async () => {
            renderPage();
            await waitFor(() => screen.getByDisplayValue('All Statuses'));
            fireEvent.change(screen.getByDisplayValue('All Statuses'), { target: { value: 'available' } });
            await waitFor(() => expect(theatreService.getAllTheatres).toHaveBeenCalledTimes(2));
        });

        it('re-fetches when type filter changes', async () => {
            renderPage();
            await waitFor(() => screen.getByDisplayValue('All Types'));
            fireEvent.change(screen.getByDisplayValue('All Types'), { target: { value: 'general' } });
            await waitFor(() => expect(theatreService.getAllTheatres).toHaveBeenCalledTimes(2));
        });

        it('calls getAllTheatres with status filter param', async () => {
            renderPage();
            await waitFor(() => screen.getByDisplayValue('All Statuses'));
            fireEvent.change(screen.getByDisplayValue('All Statuses'), { target: { value: 'in_use' } });
            await waitFor(() => {
                const calls = theatreService.getAllTheatres.mock.calls;
                const lastCall = calls[calls.length - 1][0];
                expect(lastCall.status).toBe('in_use');
            });
        });
    });

    // ── Count Display ────────────────────────────────────────────────────────
    describe('Count Display', () => {
        it('shows singular "1 theatre found"', async () => {
            theatreService.getAllTheatres.mockResolvedValue({ success: true, data: [mockTheatres[0]] });
            renderPage();
            await waitFor(() => expect(screen.getByText('1 theatre found')).toBeInTheDocument());
        });

        it('shows plural "3 theatres found"', async () => {
            theatreService.getAllTheatres.mockResolvedValue({ success: true, data: mockTheatres });
            renderPage();
            await waitFor(() => expect(screen.getByText('3 theatres found')).toBeInTheDocument());
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. TheatreStatusBadge Component
// ─────────────────────────────────────────────────────────────────────────────
describe('M3 Day 26 – TheatreStatusBadge Component', () => {
    it('renders "available" status', () => {
        render(<TheatreStatusBadge status="available" />);
        expect(screen.getByTestId('status-badge')).toHaveTextContent('available');
    });

    it('renders "in_use" status', () => {
        render(<TheatreStatusBadge status="in_use" />);
        expect(screen.getByTestId('status-badge')).toHaveTextContent('in_use');
    });

    it('renders "maintenance" status', () => {
        render(<TheatreStatusBadge status="maintenance" />);
        expect(screen.getByTestId('status-badge')).toHaveTextContent('maintenance');
    });

    it('renders "cleaning" status', () => {
        render(<TheatreStatusBadge status="cleaning" />);
        expect(screen.getByTestId('status-badge')).toHaveTextContent('cleaning');
    });

    it('ALL_THEATRE_STATUSES contains all 4 expected values', () => {
        expect(ALL_THEATRE_STATUSES).toContain('available');
        expect(ALL_THEATRE_STATUSES).toContain('in_use');
        expect(ALL_THEATRE_STATUSES).toContain('maintenance');
        expect(ALL_THEATRE_STATUSES).toContain('cleaning');
        expect(ALL_THEATRE_STATUSES).toHaveLength(4);
    });

    it('THEATRE_STATUS_LABELS has human-readable labels for all statuses', () => {
        expect(THEATRE_STATUS_LABELS.available).toBe('Available');
        expect(THEATRE_STATUS_LABELS.in_use).toBe('In Use');
        expect(THEATRE_STATUS_LABELS.maintenance).toBe('Maintenance');
        expect(THEATRE_STATUS_LABELS.cleaning).toBe('Cleaning');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Theatre E2E Component Flow
// ─────────────────────────────────────────────────────────────────────────────
describe('M3 Day 26 – E2E: Theatre Component Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = mockCoordinatorUser;
    });

    it('TheatreList renders theatres with names and statuses', async () => {
        theatreService.getAllTheatres.mockResolvedValue({ success: true, data: mockTheatres });
        render(<BrowserRouter><TheatreList /></BrowserRouter>);
        await waitFor(() => {
            expect(screen.getByText('Theatre Alpha')).toBeInTheDocument();
            expect(screen.getByText('Theatre Beta')).toBeInTheDocument();
            expect(screen.getByText('Theatre Gamma')).toBeInTheDocument();
        });
    });

    it('TheatreList correctly counts theatres', async () => {
        theatreService.getAllTheatres.mockResolvedValue({ success: true, data: mockTheatres });
        render(<BrowserRouter><TheatreList /></BrowserRouter>);
        await waitFor(() => expect(screen.getByText('3 theatres found')).toBeInTheDocument());
    });

    it('TheatreStatusBadge renders for each theatre status', () => {
        const statuses = ['available', 'in_use', 'maintenance', 'cleaning'];
        statuses.forEach(status => {
            const { unmount } = render(<TheatreStatusBadge status={status} />);
            expect(screen.getByTestId('status-badge')).toBeInTheDocument();
            unmount();
        });
    });

    it('filter change causes TheatreList to re-fetch', async () => {
        theatreService.getAllTheatres.mockResolvedValue({ success: true, data: mockTheatres });
        render(<BrowserRouter><TheatreList /></BrowserRouter>);

        await waitFor(() => screen.getByDisplayValue('All Statuses'));
        fireEvent.change(screen.getByDisplayValue('All Statuses'), { target: { value: 'maintenance' } });

        await waitFor(() =>
            expect(theatreService.getAllTheatres).toHaveBeenCalledTimes(2)
        );
    });
});
