// ============================================================================
// Coordinator Dashboard Page Tests
// ============================================================================
// Created by: M6 (Dinil) - Day 12
//
// Tests for the CoordinatorDashboard page covering:
//   - Loading state
//   - Error state + retry
//   - Success state (summary cards, theatre grid, filter bar, quick actions)
//   - Status filter interactions
//   - Navigation (quick action buttons)
//   - Quick status update (theatre toggle buttons)
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CoordinatorDashboard from '../pages/CoordinatorDashboard';
import theatreService from '../services/theatreService';

// Mock axios so there are no real HTTP calls
vi.mock('axios', () => {
    const mockApi = {
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        },
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        put: vi.fn()
    };
    return {
        default: {
            create: vi.fn(() => mockApi),
            get: vi.fn(),
            post: vi.fn()
        }
    };
});

// Mock theatreService
vi.mock('../services/theatreService');

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// Mock Layout so it just renders children
vi.mock('../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));

// Mock SummaryCard to simplify assertion
vi.mock('../components/SummaryCard', () => ({
    default: ({ label, value }) => (
        <div data-testid={`summary-card-${label.replace(/\s+/g, '-').toLowerCase()}`}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    )
}));

// Mock TheatreAssignmentDropdown
vi.mock('../components/TheatreAssignmentDropdown', () => ({
    default: ({ onClose }) => (
        <div data-testid="assignment-dropdown">
            <button onClick={onClose}>Close Dropdown</button>
        </div>
    )
}));

global.alert = vi.fn();

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockOverview = {
    success: true,
    generated_at: new Date().toISOString(),
    summary: {
        total: 3,
        available: 1,
        in_use: 1,
        maintenance: 1,
        cleaning: 0,
        utilization_rate: 33,
        overdue_count: 0
    },
    data: [
        {
            id: 1,
            name: 'Theatre Alpha',
            location: 'Block A',
            status: 'available',
            theatre_type: 'general',
            capacity: 10,
            current_surgery: null
        },
        {
            id: 2,
            name: 'Theatre Beta',
            location: 'Block B',
            status: 'in_use',
            theatre_type: 'cardiac',
            capacity: 8,
            current_surgery: {
                id: 101,
                surgery_type: 'Heart Bypass',
                patient_name: 'John Doe',
                scheduled_time: '09:00:00',
                duration_minutes: 180,
                priority: 'urgent',
                auto_progress: 45,
                elapsed_minutes: 80,
                remaining_minutes: 100,
                is_overdue: false,
                estimated_end_time: '12:00:00'
            }
        },
        {
            id: 3,
            name: 'Theatre Gamma',
            location: 'Block C',
            status: 'maintenance',
            theatre_type: 'general',
            capacity: 12,
            current_surgery: null
        }
    ]
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const renderDashboard = () =>
    render(
        <BrowserRouter>
            <CoordinatorDashboard />
        </BrowserRouter>
    );

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CoordinatorDashboard Page Tests - M6 Day 12', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    // ── Loading State ─────────────────────────────────────────────────────────
    describe('Loading State', () => {
        it('should show loading spinner while fetching overview', () => {
            theatreService.getCoordinatorOverview.mockImplementation(() => new Promise(() => { }));
            const { container } = renderDashboard();
            expect(container.querySelector('.animate-spin')).toBeTruthy();
            expect(screen.getByText('Loading coordinator overview…')).toBeInTheDocument();
        });
    });

    // ── Error State ───────────────────────────────────────────────────────────
    describe('Error State', () => {
        it('should show error message when API call fails', async () => {
            theatreService.getCoordinatorOverview.mockRejectedValue(new Error('Network error'));

            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Failed to Load')).toBeInTheDocument();
            });
        });

        it('should show the error message text', async () => {
            theatreService.getCoordinatorOverview.mockRejectedValue(new Error('Network error'));

            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Network error')).toBeInTheDocument();
            });
        });

        it('should show a Retry button on error', async () => {
            theatreService.getCoordinatorOverview.mockRejectedValue(new Error('Server error'));

            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Retry')).toBeInTheDocument();
            });
        });

        it('should refetch overview when Retry is clicked', async () => {
            theatreService.getCoordinatorOverview
                .mockRejectedValueOnce(new Error('Server error'))
                .mockResolvedValue(mockOverview);

            renderDashboard();
            await waitFor(() => expect(screen.getByText('Retry')).toBeInTheDocument());

            fireEvent.click(screen.getByText('Retry'));

            await waitFor(() => {
                expect(screen.getByText('Coordinator Dashboard')).toBeInTheDocument();
            });
        });
    });

    // ── Success State ─────────────────────────────────────────────────────────
    describe('Success State', () => {
        beforeEach(() => {
            theatreService.getCoordinatorOverview.mockResolvedValue(mockOverview);
        });

        it('should display page title', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Coordinator Dashboard')).toBeInTheDocument();
            });
        });

        it('should display Total Theatres summary card', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByTestId('summary-card-total-theatres')).toBeInTheDocument();
            });
        });

        it('should display Available summary card', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByTestId('summary-card-available')).toBeInTheDocument();
            });
        });

        it('should display In Use summary card', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByTestId('summary-card-in-use')).toBeInTheDocument();
            });
        });

        it('should display Maintenance summary card', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByTestId('summary-card-maintenance')).toBeInTheDocument();
            });
        });

        it('should display Utilization summary card', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByTestId('summary-card-utilization')).toBeInTheDocument();
            });
        });

        it('should display Overdue summary card', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByTestId('summary-card-overdue')).toBeInTheDocument();
            });
        });

        it('should display all 3 theatre names in the grid', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Theatre Alpha')).toBeInTheDocument();
                expect(screen.getByText('Theatre Beta')).toBeInTheDocument();
                expect(screen.getByText('Theatre Gamma')).toBeInTheDocument();
            });
        });

        it('should show current surgery details for in_use theatres', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Heart Bypass')).toBeInTheDocument();
            });
        });

        it('should show "No active surgery" for theatres with no current surgery', async () => {
            renderDashboard();
            await waitFor(() => {
                const msgs = screen.getAllByText('No active surgery');
                expect(msgs.length).toBeGreaterThanOrEqual(1);
            });
        });

        it('should display the filter bar buttons', async () => {
            renderDashboard();
            await waitFor(() => {
                // Use role='button' to avoid ambiguity with StatusBadge spans
                const buttons = screen.getAllByRole('button');
                const labels = buttons.map(b => b.textContent);
                expect(labels.some(l => /^All/.test(l))).toBe(true);
                expect(labels.some(l => /^Available/.test(l))).toBe(true);
                expect(labels.some(l => /^In Use/.test(l))).toBe(true);
                expect(labels.some(l => /^Maintenance/.test(l))).toBe(true);
                expect(labels.some(l => /^Cleaning/.test(l))).toBe(true);
            });
        });

        it('should display Quick Actions section', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Quick Actions')).toBeInTheDocument();
            });
        });

        it('should display Add Surgery quick action button', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Add Surgery')).toBeInTheDocument();
            });
        });

        it('should display Emergency quick action button', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Emergency')).toBeInTheDocument();
            });
        });

        it('should display All Theatres quick action button', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('All Theatres')).toBeInTheDocument();
            });
        });

        it('should display Calendar quick action button', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Calendar')).toBeInTheDocument();
            });
        });
    });

    // ── Filter Interactions ───────────────────────────────────────────────────
    describe('Filter Interactions', () => {
        beforeEach(() => {
            theatreService.getCoordinatorOverview.mockResolvedValue(mockOverview);
        });

        it('should show only available theatres when Available filter is clicked', async () => {
            renderDashboard();
            await waitFor(() => expect(screen.getByText('Theatre Alpha')).toBeInTheDocument());

            // Click the "Available" filter button specifically (not the status badge span)
            const availableBtn = screen.getAllByRole('button').find(b => /^Available/.test(b.textContent));
            fireEvent.click(availableBtn);

            await waitFor(() => {
                expect(screen.getByText('Theatre Alpha')).toBeInTheDocument();
                expect(screen.queryByText('Theatre Beta')).not.toBeInTheDocument();
                expect(screen.queryByText('Theatre Gamma')).not.toBeInTheDocument();
            });
        });

        it('should show all theatres again when All filter is clicked', async () => {
            renderDashboard();
            await waitFor(() => expect(screen.getByText('Theatre Alpha')).toBeInTheDocument());

            const availableBtn = screen.getAllByRole('button').find(b => /^Available/.test(b.textContent));
            fireEvent.click(availableBtn);
            const allBtn = screen.getAllByRole('button').find(b => /^All/.test(b.textContent));
            fireEvent.click(allBtn);

            await waitFor(() => {
                expect(screen.getByText('Theatre Alpha')).toBeInTheDocument();
                expect(screen.getByText('Theatre Beta')).toBeInTheDocument();
                expect(screen.getByText('Theatre Gamma')).toBeInTheDocument();
            });
        });

        it('should show "No theatres match this filter" when filter has no results', async () => {
            renderDashboard();
            await waitFor(() => expect(screen.getByText('Theatre Alpha')).toBeInTheDocument());

            // Click Cleaning — 0 theatres have this status (use button selector to be safe)
            const cleaningBtn = screen.getAllByRole('button').find(b => /^Cleaning/.test(b.textContent));
            fireEvent.click(cleaningBtn);

            await waitFor(() => {
                expect(screen.getByText('No theatres match this filter')).toBeInTheDocument();
            });
        });
    });

    // ── Navigation ────────────────────────────────────────────────────────────
    describe('Navigation', () => {
        beforeEach(() => {
            theatreService.getCoordinatorOverview.mockResolvedValue(mockOverview);
        });

        it('should navigate to /surgeries/new when Add Surgery is clicked', async () => {
            renderDashboard();
            await waitFor(() => expect(screen.getByText('Add Surgery')).toBeInTheDocument());
            fireEvent.click(screen.getByText('Add Surgery'));
            expect(mockNavigate).toHaveBeenCalledWith('/surgeries/new');
        });

        it('should navigate to /emergency when Emergency is clicked', async () => {
            renderDashboard();
            await waitFor(() => expect(screen.getByText('Emergency')).toBeInTheDocument());
            fireEvent.click(screen.getByText('Emergency'));
            expect(mockNavigate).toHaveBeenCalledWith('/emergency');
        });

        it('should navigate to /theatres when All Theatres is clicked', async () => {
            renderDashboard();
            await waitFor(() => expect(screen.getByText('All Theatres')).toBeInTheDocument());
            fireEvent.click(screen.getByText('All Theatres'));
            expect(mockNavigate).toHaveBeenCalledWith('/theatres');
        });

        it('should navigate to /calendar when Calendar is clicked', async () => {
            renderDashboard();
            await waitFor(() => expect(screen.getByText('Calendar')).toBeInTheDocument());
            fireEvent.click(screen.getByText('Calendar'));
            expect(mockNavigate).toHaveBeenCalledWith('/calendar');
        });

        it('should navigate to /live-status when Live Status header button is clicked', async () => {
            renderDashboard();
            await waitFor(() => expect(screen.getByText('Coordinator Dashboard')).toBeInTheDocument());
            // Multiple "Live Status" buttons exist (header + one per theatre card).
            // The header button is the first one rendered — click it.
            fireEvent.click(screen.getAllByText('Live Status')[0]);
            expect(mockNavigate).toHaveBeenCalledWith('/live-status');
        });

        it('should navigate to /theatres/:id when View Detail is clicked', async () => {
            renderDashboard();
            await waitFor(() => expect(screen.getAllByText('View Detail').length).toBeGreaterThan(0));
            fireEvent.click(screen.getAllByText('View Detail')[0]);
            expect(mockNavigate).toHaveBeenCalledWith('/theatres/1');
        });
    });

    // ── Quick Status Update ───────────────────────────────────────────────────
    describe('Quick Status Update', () => {
        it('should call theatreService.quickUpdateStatus when a quick-toggle button is clicked', async () => {
            theatreService.getCoordinatorOverview.mockResolvedValue(mockOverview);
            theatreService.quickUpdateStatus = vi.fn().mockResolvedValue({ success: true });

            renderDashboard();

            // Theatre Alpha is 'available' → quick-toggle shows "Set Maintenance" or similar button
            // Use getAllByRole to avoid matching Theatre Gamma's StatusBadge which also says "Maintenance"
            await waitFor(() => {
                const maintenanceBtns = screen.getAllByRole('button').filter(b => b.textContent.trim() === 'Maintenance');
                expect(maintenanceBtns.length).toBeGreaterThan(0);
            });

            const maintenanceToggleBtn = screen.getAllByRole('button').find(b => b.textContent.trim() === 'Maintenance');
            fireEvent.click(maintenanceToggleBtn);

            await waitFor(() => {
                expect(theatreService.quickUpdateStatus).toHaveBeenCalledWith(1, 'maintenance');
            });
        });

        it('should refresh the overview after a quick status update', async () => {
            theatreService.getCoordinatorOverview.mockResolvedValue(mockOverview);
            theatreService.quickUpdateStatus = vi.fn().mockResolvedValue({ success: true });

            renderDashboard();
            await waitFor(() => {
                const maintenanceBtns = screen.getAllByRole('button').filter(b => b.textContent.trim() === 'Maintenance');
                expect(maintenanceBtns.length).toBeGreaterThan(0);
            });
            const maintenanceToggleBtn = screen.getAllByRole('button').find(b => b.textContent.trim() === 'Maintenance');
            fireEvent.click(maintenanceToggleBtn);

            await waitFor(() => {
                // Called once on mount + once after update = 2 calls
                expect(theatreService.getCoordinatorOverview).toHaveBeenCalledTimes(2);
            });
        });
    });

    // ── Refresh Button ────────────────────────────────────────────────────────
    describe('Refresh Button', () => {
        it('should call getCoordinatorOverview again when Refresh is clicked', async () => {
            theatreService.getCoordinatorOverview.mockResolvedValue(mockOverview);

            renderDashboard();
            await waitFor(() => expect(screen.getByText('Refresh')).toBeInTheDocument());

            fireEvent.click(screen.getByText('Refresh'));

            await waitFor(() => {
                expect(theatreService.getCoordinatorOverview).toHaveBeenCalledTimes(2);
            });
        });
    });
});
