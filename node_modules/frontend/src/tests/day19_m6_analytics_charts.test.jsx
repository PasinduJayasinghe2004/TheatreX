// ============================================================================
// Analytics Charts Tests - M6 Day 19
// ============================================================================
// Tests for rendering properties of newly added Day 19 charts:
// - DurationHistogram
// - PeakHoursChart
// ============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DurationHistogram from '../components/analytics/DurationHistogram';
import PeakHoursChart from '../components/analytics/PeakHoursChart';

// Mock recharts because its internals rely on DOM measurements we can't easily mock in JSDOM
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    Bar: () => <div data-testid="bar" />,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Cell: () => <div data-testid="cell" />,
}));

describe('Day 19 M6 Analytics Charts', () => {
    describe('DurationHistogram', () => {
        it('renders empty state when no data provided', () => {
            render(<DurationHistogram buckets={[]} stats={{}} />);
            expect(screen.getByText('No duration data available')).toBeInTheDocument();
        });

        it('renders chart when buckets are provided', () => {
            const mockBuckets = [
                { range: '0-30', count: 5 },
                { range: '31-60', count: 12 },
            ];
            
            const mockStats = {
                avgDuration: 45,
                minDuration: 10,
                maxDuration: 60,
                totalSurgeries: 17
            };

            render(<DurationHistogram buckets={mockBuckets} stats={mockStats} />);
            
            // Check title
            expect(screen.getByText(/Surgery Duration Distribution/i)).toBeInTheDocument();

            // Check stats render
            expect(screen.getByText('45')).toBeInTheDocument(); // Avg
            expect(screen.getByText('10')).toBeInTheDocument(); // Min
            expect(screen.getByText('60')).toBeInTheDocument(); // Max

            // Check chart parts are rendered
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        });
    });

    describe('PeakHoursChart', () => {
        it('renders empty state when no data provided', () => {
            const { container } = render(<PeakHoursChart chartData={[]} peak={null} />);
            expect(container).toBeEmptyDOMElement();
        });

        it('renders chart and peak info when data is provided', () => {
            const mockData = [
                { hour: '12:00', displayHour: '12 PM', count: 3 },
                { hour: '13:00', displayHour: '1 PM', count: 8 },
            ];
            
            const mockPeak = {
                hour: '13:00',
                displayHour: '1 PM',
                count: 8
            };

            render(<PeakHoursChart data={mockData} peak={mockPeak} />);
            
            // Check chart parts are rendered
            expect(screen.getByTestId('area-chart')).toBeInTheDocument();
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        });
    });
});
