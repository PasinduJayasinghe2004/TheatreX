import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HistoryPage from '../pages/HistoryPage';
import surgeryService from '../services/surgeryService';

vi.mock('../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));

vi.mock('../services/surgeryService', () => ({
    default: {
        getSurgeryHistory: vi.fn(),
        getSurgeons: vi.fn(),
        getTheatres: vi.fn()
    }
}));

const renderPage = () => render(
    <BrowserRouter>
        <HistoryPage />
    </BrowserRouter>
);

describe('HistoryPage - M1 Day 20', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        surgeryService.getSurgeons.mockResolvedValue({
            success: true,
            data: [
                { id: 1, name: 'Dr. Silva', email: 'silva@test.com' },
                { id: 2, name: 'Dr. Perera', email: 'perera@test.com' }
            ]
        });
        surgeryService.getTheatres.mockResolvedValue({
            success: true,
            data: [
                { id: 10, name: 'Main Theatre' },
                { id: 11, name: 'Emergency Theatre' }
            ]
        });
    });

    it('renders completed surgery history rows from API', async () => {
        surgeryService.getSurgeryHistory.mockResolvedValue({
            success: true,
            data: [
                {
                    id: 101,
                    scheduled_date: '2026-03-01',
                    scheduled_time: '09:00:00',
                    patient_name: 'John Doe',
                    surgery_type: 'Appendectomy',
                    surgeon_name: 'Dr. Silva',
                    theatre_name: 'Theatre A',
                    duration_minutes: 90,
                    status: 'completed'
                }
            ],
            pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            }
        });

        renderPage();

        expect(screen.getByText('Surgery History')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        expect(screen.getByText('Appendectomy')).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: 'Dr. Silva' })).toBeInTheDocument();
        expect(screen.getByText('Theatre A')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });

    it('shows empty state when no completed surgeries are returned', async () => {
        surgeryService.getSurgeryHistory.mockResolvedValue({
            success: true,
            data: []
        });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('No completed surgeries yet')).toBeInTheDocument();
        });
    });

    it('shows API error state when fetch fails', async () => {
        surgeryService.getSurgeryHistory.mockRejectedValue(new Error('Network error'));

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    it('applies date range filter and refetches history with query filters', async () => {
        const user = userEvent.setup();

        surgeryService.getSurgeryHistory
            .mockResolvedValueOnce({ success: true, data: [] })
            .mockResolvedValueOnce({ success: true, data: [] });

        renderPage();

        await waitFor(() => {
            expect(surgeryService.getSurgeryHistory).toHaveBeenCalledWith({ startDate: null, endDate: null, surgeonId: null, theatreId: null, page: 1, limit: 10 });
        });

        const startDateInput = screen.getByLabelText('Start Date');
        const endDateInput = screen.getByLabelText('End Date');

        await user.type(startDateInput, '2026-03-01');
        await user.type(endDateInput, '2026-03-31');
        await user.click(screen.getByRole('button', { name: 'Apply Filter' }));

        await waitFor(() => {
            expect(surgeryService.getSurgeryHistory).toHaveBeenLastCalledWith({
                startDate: '2026-03-01',
                endDate: '2026-03-31',
                surgeonId: null,
                theatreId: null,
                page: 1,
                limit: 10
            });
        });
    });

    it('filters history by selected surgeon from dropdown', async () => {
        const user = userEvent.setup();

        surgeryService.getSurgeryHistory
            .mockResolvedValueOnce({ success: true, data: [] })
            .mockResolvedValueOnce({ success: true, data: [] });

        renderPage();

        await waitFor(() => {
            expect(surgeryService.getSurgeryHistory).toHaveBeenCalledWith({ startDate: null, endDate: null, surgeonId: null, theatreId: null, page: 1, limit: 10 });
        });

        const surgeonSelect = screen.getByLabelText('Surgeon');
        await user.selectOptions(surgeonSelect, '2');

        await waitFor(() => {
            expect(surgeryService.getSurgeryHistory).toHaveBeenLastCalledWith({
                startDate: null,
                endDate: null,
                surgeonId: 2,
                theatreId: null,
                page: 1,
                limit: 10
            });
        });
    });

    it('filters history by selected theatre from dropdown', async () => {
        const user = userEvent.setup();

        surgeryService.getSurgeryHistory
            .mockResolvedValueOnce({ success: true, data: [] })
            .mockResolvedValueOnce({ success: true, data: [] });

        renderPage();

        await waitFor(() => {
            expect(surgeryService.getSurgeryHistory).toHaveBeenCalledWith({ startDate: null, endDate: null, surgeonId: null, theatreId: null, page: 1, limit: 10 });
        });

        const theatreSelect = screen.getByLabelText('Theatre');
        await user.selectOptions(theatreSelect, '11');

        await waitFor(() => {
            expect(surgeryService.getSurgeryHistory).toHaveBeenLastCalledWith({
                startDate: null,
                endDate: null,
                surgeonId: null,
                theatreId: 11,
                page: 1,
                limit: 10
            });
        });
    });

    it('goes to next page when Next is clicked', async () => {
        const user = userEvent.setup();

        surgeryService.getSurgeryHistory
            .mockResolvedValueOnce({
                success: true,
                data: [
                    {
                        id: 1001,
                        patient_name: 'Patient One',
                        surgery_type: 'Procedure A',
                        scheduled_date: '2026-03-10',
                        scheduled_time: '08:00:00',
                        duration_minutes: 45,
                        status: 'completed'
                    }
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 15,
                    totalPages: 2,
                    hasNextPage: true,
                    hasPrevPage: false
                }
            })
            .mockResolvedValueOnce({
                success: true,
                data: [
                    {
                        id: 1002,
                        patient_name: 'Patient Two',
                        surgery_type: 'Procedure B',
                        scheduled_date: '2026-03-09',
                        scheduled_time: '09:00:00',
                        duration_minutes: 60,
                        status: 'completed'
                    }
                ],
                pagination: {
                    page: 2,
                    limit: 10,
                    total: 15,
                    totalPages: 2,
                    hasNextPage: false,
                    hasPrevPage: true
                }
            });

        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: 'Next page' }));

        await waitFor(() => {
            expect(surgeryService.getSurgeryHistory).toHaveBeenLastCalledWith({
                startDate: null,
                endDate: null,
                surgeonId: null,
                theatreId: null,
                page: 2,
                limit: 10
            });
        });
    });

    it('resets all filters using Reset All Filters action', async () => {
        const user = userEvent.setup();

        surgeryService.getSurgeryHistory
            .mockResolvedValue({ success: true, data: [] });

        renderPage();

        await waitFor(() => {
            expect(surgeryService.getSurgeryHistory).toHaveBeenCalledWith({
                startDate: null,
                endDate: null,
                surgeonId: null,
                theatreId: null,
                page: 1,
                limit: 10
            });
        });

        await user.selectOptions(screen.getByLabelText('Surgeon'), '2');
        await user.selectOptions(screen.getByLabelText('Theatre'), '11');

        await waitFor(() => {
            expect(surgeryService.getSurgeryHistory).toHaveBeenLastCalledWith({
                startDate: null,
                endDate: null,
                surgeonId: 2,
                theatreId: 11,
                page: 1,
                limit: 10
            });
        });

        await user.click(screen.getByRole('button', { name: 'Reset all filters' }));

        await waitFor(() => {
            expect(surgeryService.getSurgeryHistory).toHaveBeenLastCalledWith({
                startDate: null,
                endDate: null,
                surgeonId: null,
                theatreId: null,
                page: 1,
                limit: 10
            });
        });
    });
});
