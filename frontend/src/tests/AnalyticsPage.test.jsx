import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnalyticsPage from '../pages/AnalyticsPage';
import {
    getSurgeryStatusCounts,
    getPatientDemographics,
    getStaffCountsByRole,
    getTheatreUtilization,
    getSurgeriesPerDay,
} from '../services/analyticsService';

vi.mock('../components/Layout', () => ({
    default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

vi.mock('../components/analytics/StaffDistribution', () => ({
    default: () => <div>Staff Distribution</div>,
}));

vi.mock('../components/analytics/TheatreUtilizationStats', () => ({
    default: () => <div>Theatre Utilization</div>,
}));

vi.mock('../services/analyticsService', () => ({
    getSurgeriesPerDay: vi.fn(),
    getSurgeryStatusCounts: vi.fn(),
    getPatientDemographics: vi.fn(),
    getStaffCountsByRole: vi.fn(),
    getTheatreUtilization: vi.fn(),
}));

const mockDemographics = {
    total: 12,
    gender: [
        { gender: 'male', count: 7, percentage: 58.3 },
        { gender: 'female', count: 5, percentage: 41.7 },
    ],
    ageGroups: [
        { ageGroup: '18-30', count: 4, percentage: 33.3 },
        { ageGroup: '31-45', count: 5, percentage: 41.7 },
        { ageGroup: '46-60', count: 3, percentage: 25.0 },
    ],
    bloodType: [
        { bloodType: 'A+', count: 3, percentage: 25.0 },
        { bloodType: 'B+', count: 4, percentage: 33.3 },
        { bloodType: 'O+', count: 5, percentage: 41.7 },
    ],
};

const renderPage = () => render(
    <BrowserRouter>
        <AnalyticsPage />
    </BrowserRouter>
);

describe('AnalyticsPage - M3 Day 19', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        getSurgeriesPerDay.mockResolvedValue({
            success: true,
            data: [
                { day: 'Mon', count: 2 },
                { day: 'Tue', count: 3 },
                { day: 'Wed', count: 1 },
            ],
        });

        getSurgeryStatusCounts.mockResolvedValue({
            success: true,
            data: {
                total: 6,
                breakdown: [
                    { status: 'scheduled', count: 2, percentage: 33.3 },
                    { status: 'completed', count: 4, percentage: 66.7 },
                ],
            },
        });

        getPatientDemographics.mockResolvedValue({
            success: true,
            data: mockDemographics,
        });

        getStaffCountsByRole.mockResolvedValue({
            success: true,
            data: {
                total: 8,
                breakdown: [
                    { role: 'surgeon', count: 3 },
                    { role: 'nurse', count: 5 },
                ],
            },
        });

        getTheatreUtilization.mockResolvedValue({
            success: true,
            data: [
                { theatreName: 'Theatre 1', utilizationRate: 80 },
            ],
        });
    });

    it('renders the demographics bar chart with age-group data by default', async () => {
        renderPage();

        await waitFor(() => {
            expect(screen.getByText('Patient Demographics')).toBeInTheDocument();
        });

        expect(screen.getByText('Demographics Bar Chart')).toBeInTheDocument();
        expect(screen.getByText('Age bands across active patients')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Age Groups' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByTestId('patient-demographics-bar-chart')).toBeInTheDocument();
        expect(screen.getByText('31-45')).toBeInTheDocument();
        expect(screen.getByText('Largest Segment')).toBeInTheDocument();
    });

    it('switches the demographics bar chart to gender view', async () => {
        renderPage();

        const genderButton = await screen.findByRole('button', { name: 'Gender' });
        fireEvent.click(genderButton);

        await waitFor(() => {
            expect(genderButton).toHaveAttribute('aria-pressed', 'true');
            expect(screen.getByText('Gender mix across active patients')).toBeInTheDocument();
            expect(screen.getByText('Male')).toBeInTheDocument();
            expect(screen.getByText('Female')).toBeInTheDocument();
        });
    });
});