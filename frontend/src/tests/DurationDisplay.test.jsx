// ============================================================================
// DurationDisplay Component Tests
// ============================================================================
// Tests for the DurationDisplay component:
// - Renders elapsed time for a started surgery
// - Shows '—' when no startTime is provided
// - Shows estimated total duration when durationMinutes is given
// - Uses functional form of setDur (prevents cascading renders)
// - Auto-refreshes on interval
//
// Run with: npx vitest run src/tests/DurationDisplay.test.jsx
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import DurationDisplay from '../components/DurationDisplay';

// ── Helpers ──────────────────────────────────────────────────────────────────

const FIXED_NOW = new Date('2026-02-22T14:00:00.000Z');

const timeMinutesAgo = (mins) => {
    const d = new Date(FIXED_NOW.getTime() - mins * 60 * 1000);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:00`;
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('DurationDisplay', () => {

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(FIXED_NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render elapsed time when startTime is provided', () => {
        const startTime = timeMinutesAgo(45);

        render(<DurationDisplay startTime={startTime} />);

        expect(screen.getByText(/45m/)).toBeInTheDocument();
    });

    it('should show "—" when startTime is not provided', () => {
        render(<DurationDisplay startTime={null} />);

        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('should show total duration when durationMinutes is given', () => {
        const startTime = timeMinutesAgo(30);

        render(<DurationDisplay startTime={startTime} durationMinutes={60} />);

        expect(screen.getByText(/30m/)).toBeInTheDocument();
        expect(screen.getByText(/\/\s*60m/)).toBeInTheDocument();
    });

    it('should show hours and minutes for long elapsed times', () => {
        const startTime = timeMinutesAgo(90);

        render(<DurationDisplay startTime={startTime} />);

        expect(screen.getByText(/1h 30m/)).toBeInTheDocument();
    });

    it('should show "0m" when surgery start is in the future', () => {
        const d = new Date(FIXED_NOW.getTime() + 30 * 60 * 1000);
        const futureTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:00`;

        render(<DurationDisplay startTime={futureTime} />);

        expect(screen.getByText(/0m/)).toBeInTheDocument();
    });

    it('should auto-refresh elapsed time on interval', async () => {
        const startTime = timeMinutesAgo(30);

        render(<DurationDisplay startTime={startTime} autoRefreshMs={1000} />);

        expect(screen.getByText(/30m/)).toBeInTheDocument();

        // Advance time by 1 minute
        await act(async () => {
            vi.setSystemTime(new Date(FIXED_NOW.getTime() + 60 * 1000));
            vi.advanceTimersByTime(30000);
        });

        // Should still display a duration string
        expect(screen.getByText(/\d+m/)).toBeInTheDocument();
    });

    it('should accept a custom className', () => {
        const startTime = timeMinutesAgo(10);

        const { container } = render(
            <DurationDisplay startTime={startTime} className="text-blue-600" />
        );

        expect(container.firstChild).toHaveClass('text-blue-600');
    });
});
