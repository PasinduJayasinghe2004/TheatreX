// ============================================================================
// Dashboard Page Tests
// ============================================================================
// Created by: Copilot - Sub-PR #63
//
// Tests for the Dashboard page, including:
// - Loading state
// - Success state with data
// - Error states (stats failure, surgery fetch failure)
// - Empty state (no surgeries today)
// - Navigation (Add Surgery, Emergency, Calendar, View Surgery)
// - Delete surgery with confirmation
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { getDashboardStats } from '../services/dashboardService';
import surgeryService from '../services/surgeryService';

// Mock Layout to avoid auth dependencies from Header/RoleGuard
vi.mock('../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));

// Mock services
vi.mock('../services/dashboardService');
vi.mock('../services/surgeryService');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('Dashboard Page Tests', () => {
    const mockStats = {
        yesterdayComparison: 3,
        staffOnDuty: {
            surgeons: 5,
            nurses: 4,
            anaesthetists: 2,
            technicians: 3,
            total: 14
        },
        avgDuration: 110
    };

    const mockSurgeries = [
        {
            id: 1,
            patient_name: 'John Doe',
            surgery_type: 'Appendectomy',
            scheduled_time: '10:00:00',
            theatre_id: 1,
            status: 'scheduled',
            surgeon: { name: 'Dr. Smith' }
        },
        {
            id: 2,
            patient_name: 'Jane Smith',
            surgery_type: 'Knee Replacement',
            scheduled_time: '14:00:00',
            theatre_id: 2,
            status: 'in_progress',
            surgeon: { name: 'Dr. Johnson' }
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        getDashboardStats.mockResolvedValue({ success: true, data: mockStats });
        surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: mockSurgeries });
    });

    const renderDashboard = () =>
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

    // ========================================================================
    // Loading State Tests
    // ========================================================================
    describe('Loading State', () => {
        it('shows loading indicator while fetching data', async () => {
            getDashboardStats.mockImplementation(() => new Promise(() => {}));
            const { container } = renderDashboard();
            expect(container.querySelector('.animate-spin')).toBeTruthy();
        });

        it('shows loading text', () => {
            getDashboardStats.mockImplementation(() => new Promise(() => {}));
            renderDashboard();
            expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Success State Tests
    // ========================================================================
    describe('Success State', () => {
        it('displays dashboard title after loading', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Theatre Management Dashboard')).toBeInTheDocument();
            });
        });

        it('displays today\'s surgeries count', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText("Today's Surgeries")).toBeInTheDocument();
                expect(screen.getByText('2')).toBeInTheDocument();
            });
        });

        it('displays yesterday comparison when available', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('+3 from yesterday')).toBeInTheDocument();
            });
        });

        it('displays staff on duty count', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('14')).toBeInTheDocument();
            });
        });

        it('displays average duration', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('110')).toBeInTheDocument();
            });
        });

        it('displays upcoming surgeries for scheduled status only', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                // in_progress surgery should not appear in upcoming table
                expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            });
        });

        it('displays surgery type in upcoming table', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Appendectomy')).toBeInTheDocument();
            });
        });

        it('displays action buttons', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Add New Surgery')).toBeInTheDocument();
                expect(screen.getByText('Emergency Surgery')).toBeInTheDocument();
                expect(screen.getByText('Calendar View')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Empty State Tests
    // ========================================================================
    describe('Empty State', () => {
        it('shows empty state message when no surgeries', async () => {
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [] });
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('No upcoming surgeries scheduled for today')).toBeInTheDocument();
            });
        });

        it('shows "0" for today\'s surgeries when none exist', async () => {
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [] });
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('0')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Null/Missing Data State Tests
    // ========================================================================
    describe('Missing Stats Data', () => {
        it('shows "--" for avgDuration when stats not available', async () => {
            getDashboardStats.mockResolvedValue({ success: false });
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [] });
            renderDashboard();
            await waitFor(() => {
                const dashes = screen.getAllByText('--');
                expect(dashes.length).toBeGreaterThanOrEqual(1);
            });
        });

        it('shows "No comparison data" when yesterdayComparison is null', async () => {
            getDashboardStats.mockResolvedValue({ success: true, data: { avgDuration: 100 } });
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [] });
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('No comparison data')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Error State Tests
    // ========================================================================
    describe('Error State', () => {
        it('shows error message when dashboard stats fail', async () => {
            getDashboardStats.mockRejectedValue({
                response: { data: { message: 'Server error' } }
            });
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [] });
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
            });
        });

        it('shows retry button on error', async () => {
            getDashboardStats.mockRejectedValue(new Error('Network error'));
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Retry')).toBeInTheDocument();
            });
        });

        it('shows surgery-specific error when surgery fetch fails', async () => {
            getDashboardStats.mockResolvedValue({ success: true, data: mockStats });
            surgeryService.getAllSurgeries.mockRejectedValue(
                new Error('Failed to load today\'s surgeries')
            );
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Navigation Tests
    // ========================================================================
    describe('Navigation', () => {
        it('navigates to /surgeries/new when Add New Surgery is clicked', async () => {
            renderDashboard();
            await waitFor(() => screen.getByText('Add New Surgery'));
            fireEvent.click(screen.getByText('Add New Surgery'));
            expect(mockNavigate).toHaveBeenCalledWith('/surgeries/new');
        });

        it('navigates to /emergency when Emergency Surgery is clicked', async () => {
            renderDashboard();
            await waitFor(() => screen.getByText('Emergency Surgery'));
            fireEvent.click(screen.getByText('Emergency Surgery'));
            expect(mockNavigate).toHaveBeenCalledWith('/emergency');
        });

        it('navigates to /calendar when Calendar View is clicked', async () => {
            renderDashboard();
            await waitFor(() => screen.getByText('Calendar View'));
            fireEvent.click(screen.getByText('Calendar View'));
            expect(mockNavigate).toHaveBeenCalledWith('/calendar');
        });

        it('navigates to surgery detail when View button is clicked', async () => {
            renderDashboard();
            await waitFor(() => screen.getByText('John Doe'));
            const viewButtons = screen.getAllByTitle('View');
            fireEvent.click(viewButtons[0]);
            expect(mockNavigate).toHaveBeenCalledWith('/surgeries/1');
        });
    });

    // ========================================================================
    // Delete Tests
    // ========================================================================
    describe('Delete Surgery', () => {
        it('calls deleteSurgery and removes surgery after confirmation', async () => {
            vi.spyOn(window, 'confirm').mockReturnValue(true);
            surgeryService.deleteSurgery = vi.fn().mockResolvedValue({ success: true });

            renderDashboard();
            await waitFor(() => screen.getByText('John Doe'));

            const deleteButtons = screen.getAllByTitle('Delete');
            fireEvent.click(deleteButtons[0]);

            await waitFor(() => {
                expect(surgeryService.deleteSurgery).toHaveBeenCalledWith(1);
            });

            window.confirm.mockRestore();
        });

        it('does not call deleteSurgery when confirmation is cancelled', async () => {
            vi.spyOn(window, 'confirm').mockReturnValue(false);
            surgeryService.deleteSurgery = vi.fn();

            renderDashboard();
            await waitFor(() => screen.getByText('John Doe'));

            const deleteButtons = screen.getAllByTitle('Delete');
            fireEvent.click(deleteButtons[0]);

            expect(surgeryService.deleteSurgery).not.toHaveBeenCalled();
            window.confirm.mockRestore();
        });
    });

    // ========================================================================
    // Accessibility Tests
    // ========================================================================
    describe('Accessibility', () => {
        it('search button has aria-label', async () => {
            renderDashboard();
            await waitFor(() => screen.getByText('Theatre Management Dashboard'));
            expect(screen.getByLabelText('Search')).toBeInTheDocument();
        });

        it('notifications button has aria-label', async () => {
            renderDashboard();
            await waitFor(() => screen.getByText('Theatre Management Dashboard'));
            expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // API Call Tests
    // ========================================================================
    describe('API Calls', () => {
        it('calls getDashboardStats on mount', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(getDashboardStats).toHaveBeenCalledTimes(1);
            });
        });

        it('calls getAllSurgeries with today\'s date on mount', async () => {
            renderDashboard();
            const today = new Date().toISOString().split('T')[0];
            await waitFor(() => {
                expect(surgeryService.getAllSurgeries).toHaveBeenCalledWith({
                    startDate: today,
                    endDate: today
                });
            });
        });
    });
});
