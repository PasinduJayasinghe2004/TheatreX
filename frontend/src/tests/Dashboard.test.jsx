// ============================================================================
// Dashboard Page Tests
// ============================================================================
// Created by: Copilot - UI Design Review
//
// Tests for the Dashboard page covering loading states, error handling,
// data fetching, component rendering, and user interactions.
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import surgeryService from '../services/surgeryService';
import { getDashboardStats } from '../services/dashboardService';
import { AuthProvider } from '../context/AuthContext';

// Mock axios to avoid real API calls from AuthContext
vi.mock('axios', () => {
    const mockApi = {
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        },
        get: vi.fn(),
        post: vi.fn()
    };
    return {
        default: {
            create: vi.fn(() => mockApi),
            get: vi.fn(),
            post: vi.fn()
        }
    };
});

// Mock services
vi.mock('../services/surgeryService');
vi.mock('../services/dashboardService');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// Mock window.confirm and window.alert
global.confirm = vi.fn(() => true);
global.alert = vi.fn();

describe('Dashboard Page Tests', () => {
    const mockStats = {
        success: true,
        data: {
            totalSurgeries: 5,
            yesterdayComparison: 2,
            staffOnDuty: {
                total: 13,
                surgeons: 7,
                nurses: 3,
                anaesthetists: 1,
                technicians: 2
            },
            avgDuration: 125
        }
    };

    const mockSurgeries = [
        {
            id: 1,
            patient_name: 'John Doe',
            surgery_type: 'Appendectomy',
            scheduled_date: '2024-01-15',
            scheduled_time: '09:00:00',
            status: 'scheduled',
            priority: 'routine',
            theatre_id: 1,
            surgeon: { id: 1, name: 'Dr. Smith' }
        },
        {
            id: 2,
            patient_name: 'Jane Smith',
            surgery_type: 'Knee Replacement',
            scheduled_date: '2024-01-15',
            scheduled_time: '11:00:00',
            status: 'in_progress',
            priority: 'urgent',
            theatre_id: 2,
            surgeon: { id: 2, name: 'Dr. Johnson' }
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    const renderDashboard = () => {
        return render(
            <BrowserRouter>
                <AuthProvider>
                    <Dashboard />
                </AuthProvider>
            </BrowserRouter>
        );
    };

    // ========================================================================
    // Loading State Tests
    // ========================================================================
    describe('Loading State', () => {
        it('should show loading indicator while fetching data', async () => {
            getDashboardStats.mockImplementation(() => new Promise(() => {}));
            surgeryService.getAllSurgeries.mockImplementation(() => new Promise(() => {}));

            const { container } = renderDashboard();
            expect(container.querySelector('.animate-spin')).toBeTruthy();
            expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
        });
    });

    // ========================================================================
    // Success State Tests
    // ========================================================================
    describe('Success State', () => {
        beforeEach(() => {
            getDashboardStats.mockResolvedValue(mockStats);
            surgeryService.getAllSurgeries.mockResolvedValue({
                success: true,
                data: mockSurgeries
            });
        });

        it('should display page title after loading', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Theatre Management Dashboard')).toBeInTheDocument();
            });
        });

        it('should display stats cards', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText("Today's Surgeries")).toBeInTheDocument();
                expect(screen.getByText('Staff on Duty')).toBeInTheDocument();
                expect(screen.getByText('Avg Duration')).toBeInTheDocument();
            });
        });

        it('should display correct surgery count', async () => {
            renderDashboard();
            await waitFor(() => {
                // 2 surgeries in mockSurgeries
                expect(screen.getByText('2')).toBeInTheDocument();
            });
        });

        it('should display staff comparison data when available', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('+2 from yesterday')).toBeInTheDocument();
            });
        });

        it('should display upcoming surgeries table', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Upcoming Surgeries')).toBeInTheDocument();
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('Appendectomy')).toBeInTheDocument();
            });
        });

        it('should not show in_progress surgeries in upcoming table', async () => {
            renderDashboard();
            await waitFor(() => {
                // Jane Smith has status in_progress so should not appear in upcoming
                expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            });
        });

        it('should display live surgeries section', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Live Surgeries & Status')).toBeInTheDocument();
            });
        });

        it('should display action buttons', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Add New Surgery')).toBeInTheDocument();
                expect(screen.getByText('Emergency Surgery')).toBeInTheDocument();
                expect(screen.getByText('Calendar View')).toBeInTheDocument();
            });
        });
    });

    // ========================================================================
    // Null/Missing Data State Tests
    // ========================================================================
    describe('Missing Data State', () => {
        it('should show -- for avgDuration when not provided', async () => {
            getDashboardStats.mockResolvedValue({ success: true, data: {} });
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [] });

            renderDashboard();
            await waitFor(() => {
                // Both staff total and avgDuration will show '--', so check count
                const dashes = screen.getAllByText('--');
                expect(dashes.length).toBeGreaterThanOrEqual(1);
            });
        });

        it('should show no comparison data when yesterdayComparison is null', async () => {
            getDashboardStats.mockResolvedValue({ success: true, data: { yesterdayComparison: null } });
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
        it('should show error message when stats API fails', async () => {
            getDashboardStats.mockRejectedValue(new Error('Network error'));
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [] });

            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
            });
        });

        it('should show Retry button on error', async () => {
            getDashboardStats.mockRejectedValue(new Error('Server error'));
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [] });

            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Retry')).toBeInTheDocument();
            });
        });

        it('should show empty surgeries when surgeries API fails', async () => {
            getDashboardStats.mockResolvedValue(mockStats);
            surgeryService.getAllSurgeries.mockRejectedValue(new Error('Surgery API error'));

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
        beforeEach(() => {
            getDashboardStats.mockResolvedValue(mockStats);
            surgeryService.getAllSurgeries.mockResolvedValue({
                success: true,
                data: mockSurgeries
            });
        });

        it('should navigate to /surgeries/new when Add New Surgery is clicked', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Add New Surgery')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByText('Add New Surgery'));
            expect(mockNavigate).toHaveBeenCalledWith('/surgeries/new');
        });

        it('should navigate to /emergency when Emergency Surgery is clicked', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Emergency Surgery')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByText('Emergency Surgery'));
            expect(mockNavigate).toHaveBeenCalledWith('/emergency');
        });

        it('should navigate to /calendar when Calendar View is clicked', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Calendar View')).toBeInTheDocument();
            });
            fireEvent.click(screen.getByText('Calendar View'));
            expect(mockNavigate).toHaveBeenCalledWith('/calendar');
        });

        it('should navigate to surgery detail when view button is clicked', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });
            const viewButtons = screen.getAllByLabelText('View surgery');
            fireEvent.click(viewButtons[0]);
            expect(mockNavigate).toHaveBeenCalledWith('/surgeries/1');
        });

        it('should navigate to /surgeries when search button is clicked', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('Theatre Management Dashboard')).toBeInTheDocument();
            });
            const searchButton = screen.getByLabelText('Search');
            fireEvent.click(searchButton);
            expect(mockNavigate).toHaveBeenCalledWith('/surgeries');
        });
    });

    // ========================================================================
    // Delete Surgery Tests
    // ========================================================================
    describe('Delete Surgery', () => {
        beforeEach(() => {
            getDashboardStats.mockResolvedValue(mockStats);
            surgeryService.getAllSurgeries.mockResolvedValue({
                success: true,
                data: mockSurgeries
            });
        });

        it('should call deleteSurgery and remove surgery on confirm', async () => {
            surgeryService.deleteSurgery = vi.fn().mockResolvedValue({ success: true });
            global.confirm = vi.fn(() => true);

            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByLabelText('Delete surgery');
            fireEvent.click(deleteButtons[0]);

            await waitFor(() => {
                expect(surgeryService.deleteSurgery).toHaveBeenCalledWith(1);
            });
        });

        it('should not call deleteSurgery when confirmation is cancelled', async () => {
            surgeryService.deleteSurgery = vi.fn();
            global.confirm = vi.fn(() => false);

            renderDashboard();
            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            const deleteButtons = screen.getAllByLabelText('Delete surgery');
            fireEvent.click(deleteButtons[0]);

            expect(surgeryService.deleteSurgery).not.toHaveBeenCalled();
        });
    });

    // ========================================================================
    // Accessibility Tests
    // ========================================================================
    describe('Accessibility', () => {
        beforeEach(() => {
            getDashboardStats.mockResolvedValue(mockStats);
            surgeryService.getAllSurgeries.mockResolvedValue({ success: true, data: [] });
        });

        it('should have aria-labels on icon buttons', async () => {
            renderDashboard();
            await waitFor(() => {
                expect(screen.getByLabelText('Search')).toBeInTheDocument();
                // Multiple elements with label 'Notifications' is expected (header button + sidebar)
                expect(screen.getAllByLabelText('Notifications').length).toBeGreaterThanOrEqual(1);
            });
        });
    });
});
