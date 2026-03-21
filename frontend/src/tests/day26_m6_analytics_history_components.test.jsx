import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnalyticsPage from '../pages/AnalyticsPage';
import HistoryPage from '../pages/HistoryPage';
import * as analyticsService from '../services/analyticsService';
import surgeryService from '../services/surgeryService';

// Mock Recharts
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: () => <div data-testid="line-chart" />,
    Line: () => null,
    BarChart: () => <div data-testid="bar-chart" />,
    Bar: () => null,
    AreaChart: () => <div data-testid="area-chart" />,
    Area: () => null,
    PieChart: () => <div data-testid="pie-chart" />,
    Pie: () => null,
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
}));

// Mock Services
vi.mock('../services/analyticsService', () => ({
    getSurgeriesPerDay: vi.fn(),
    getSurgeryStatusCounts: vi.fn(),
    getPatientDemographics: vi.fn(),
    getStaffCountsByRole: vi.fn(),
    getTheatreUtilization: vi.fn(),
    getSurgeryDurationStats: vi.fn(),
    getPeakHoursAnalysis: vi.fn(),
}));

vi.mock('../services/surgeryService', () => ({
    default: {
        getSurgeryHistory: vi.fn(),
        getSurgeons: vi.fn(),
        getTheatres: vi.fn(),
        exportSurgeryHistoryCsv: vi.fn(),
        exportSurgeryDetailCsv: vi.fn(),
    }
}));

// Mock Layout to avoid sidebar/header complexity
vi.mock('../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>
}));

const mockAnalyticsData = {
    surgeriesPerDay: { success: true, data: [{ day: 'Mon', count: 5 }] },
    statusCounts: { success: true, data: { total: 10, breakdown: [{ status: 'completed', count: 8, percentage: 80 }, { status: 'scheduled', count: 2, percentage: 20 }] } },
    demographics: { success: true, data: { total: 100, gender: [{ gender: 'male', count: 50, percentage: 50 }], ageGroups: [], bloodType: [] } },
    staffCounts: { success: true, data: { total: 10, breakdown: [] } },
    utilization: { success: true, data: [] },
    duration: { success: true, data: { buckets: [], stats: {} } },
    peakHours: { success: true, data: { chartData: [], peak: {} } },
};

describe('M6 Day 26 - Analytics & History Components', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('AnalyticsPage', () => {
        it('renders analytics components after loading data', async () => {
            analyticsService.getSurgeriesPerDay.mockResolvedValue(mockAnalyticsData.surgeriesPerDay);
            analyticsService.getSurgeryStatusCounts.mockResolvedValue(mockAnalyticsData.statusCounts);
            analyticsService.getPatientDemographics.mockResolvedValue(mockAnalyticsData.demographics);
            analyticsService.getStaffCountsByRole.mockResolvedValue(mockAnalyticsData.staffCounts);
            analyticsService.getTheatreUtilization.mockResolvedValue(mockAnalyticsData.utilization);
            analyticsService.getSurgeryDurationStats.mockResolvedValue(mockAnalyticsData.duration);
            analyticsService.getPeakHoursAnalysis.mockResolvedValue(mockAnalyticsData.peakHours);

            render(<BrowserRouter><AnalyticsPage /></BrowserRouter>);

            // Wait for loading to finish
            await waitFor(() => expect(screen.queryByText(/Fetching/i)).not.toBeInTheDocument());

            expect(screen.getByText(/Analytics/i)).toBeInTheDocument();
            expect(screen.getByText(/Total \(7 Days\)/i)).toBeInTheDocument();
            expect(screen.getByText(/Surgery Status Breakdown/i)).toBeInTheDocument();
        });

        it('shows error state when all data fails', async () => {
            // Mock all services to fail to ensure successfulCount === 0
            analyticsService.getSurgeriesPerDay.mockRejectedValue(new Error('API Error'));
            analyticsService.getSurgeryStatusCounts.mockRejectedValue(new Error('API Error'));
            analyticsService.getPatientDemographics.mockRejectedValue(new Error('API Error'));
            analyticsService.getStaffCountsByRole.mockRejectedValue(new Error('API Error'));
            analyticsService.getTheatreUtilization.mockRejectedValue(new Error('API Error'));
            analyticsService.getSurgeryDurationStats.mockRejectedValue(new Error('API Error'));
            analyticsService.getPeakHoursAnalysis.mockRejectedValue(new Error('API Error'));
            
            render(<BrowserRouter><AnalyticsPage /></BrowserRouter>);
            
            expect(await screen.findByText(/Error Loading Analytics/i)).toBeInTheDocument();
        });
    });

    describe('HistoryPage', () => {
        const mockHistory = {
            success: true,
            data: [
                { id: 1, scheduled_date: '2026-03-20', patient_name: 'John Doe', surgery_type: 'Appendectomy', status: 'completed' }
            ],
            pagination: { page: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false }
        };

        it('renders surgery history table', async () => {
            surgeryService.getSurgeryHistory.mockResolvedValue(mockHistory);
            surgeryService.getSurgeons.mockResolvedValue({ success: true, data: [] });
            surgeryService.getTheatres.mockResolvedValue({ success: true, data: [] });

            render(<BrowserRouter><HistoryPage /></BrowserRouter>);

            await waitFor(() => expect(screen.getByText(/Surgery History/i)).toBeInTheDocument());
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Appendectomy')).toBeInTheDocument();
        });

        it('handles pagination click', async () => {
            const multiPageHistory = {
                ...mockHistory,
                pagination: { page: 1, totalPages: 2, hasNextPage: true, hasPrevPage: false }
            };
            surgeryService.getSurgeryHistory.mockResolvedValue(multiPageHistory);
            surgeryService.getSurgeons.mockResolvedValue({ success: true, data: [] });
            surgeryService.getTheatres.mockResolvedValue({ success: true, data: [] });

            render(<BrowserRouter><HistoryPage /></BrowserRouter>);

            await waitFor(() => expect(screen.getByText(/Next/i)).toBeInTheDocument());
            const nextBtn = screen.getByText(/Next/i);
            expect(nextBtn).not.toBeDisabled();
            
            fireEvent.click(nextBtn);
            expect(surgeryService.getSurgeryHistory).toHaveBeenCalledTimes(2);
        });
    });
});
