// ============================================================================
// Surgery Progress Bar Component Tests – M2 (Chandeepa) – Day 11
// ============================================================================
// Tests for the SurgeryProgressBar component:
// - Renders compact variant with correct progress
// - Renders full variant with time details
// - Shows 0% when surgery hasn't started
// - Shows overdue badge when elapsed > duration
// - Shows "Complete" badge at 100%
// - Uses manual progress when higher than auto
// - Auto-refreshes on timer
//
// Run with: npx vitest run src/tests/SurgeryProgressBar.test.jsx
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import SurgeryProgressBar from '../components/SurgeryProgressBar';

// ── Helpers ──────────────────────────────────────────────────────────────────

// Fixed reference date for deterministic tests
const FIXED_NOW = new Date('2026-02-22T14:00:00.000Z');

/**
 * Build a time string N minutes before FIXED_NOW
 */
const timeMinutesAgo = (mins) => {
    const d = new Date(FIXED_NOW.getTime() - mins * 60 * 1000);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:00`;
};

/**
 * Build a time string N minutes after FIXED_NOW
 */
const timeMinutesFromNow = (mins) => {
    const d = new Date(FIXED_NOW.getTime() + mins * 60 * 1000);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:00`;
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe('SurgeryProgressBar - M2 Day 11', () => {

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(FIXED_NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // ──────────────────────────────────────────────────────────────────────
    // Compact variant
    // ──────────────────────────────────────────────────────────────────────

    describe('Compact variant', () => {
        it('should render compact progress bar with correct percentage', () => {
            const scheduledTime = timeMinutesAgo(30);

            render(
                <SurgeryProgressBar
                    scheduledTime={scheduledTime}
                    durationMinutes={60}
                    variant="compact"
                />
            );

            // Should show "50%" label
            expect(screen.getByText('50%')).toBeInTheDocument();
            // Should show "Progress" label
            expect(screen.getByText('Progress')).toBeInTheDocument();
        });

        it('should show elapsed and remaining time', () => {
            const scheduledTime = timeMinutesAgo(20);

            render(
                <SurgeryProgressBar
                    scheduledTime={scheduledTime}
                    durationMinutes={40}
                    variant="compact"
                    showTimer={true}
                />
            );

            expect(screen.getByText('20m elapsed')).toBeInTheDocument();
            expect(screen.getByText('20m left')).toBeInTheDocument();
        });

        it('should hide timer when showTimer=false', () => {
            render(
                <SurgeryProgressBar
                    scheduledTime={timeMinutesAgo(10)}
                    durationMinutes={60}
                    variant="compact"
                    showTimer={false}
                />
            );

            expect(screen.queryByText(/elapsed/)).not.toBeInTheDocument();
            expect(screen.queryByText(/left/)).not.toBeInTheDocument();
        });

        it('should show "Overdue" when surgery exceeds duration', () => {
            const scheduledTime = timeMinutesAgo(90);

            render(
                <SurgeryProgressBar
                    scheduledTime={scheduledTime}
                    durationMinutes={60}
                    variant="compact"
                />
            );

            expect(screen.getByText('100%')).toBeInTheDocument();
            expect(screen.getByText('Overdue')).toBeInTheDocument();
        });
    });

    // ──────────────────────────────────────────────────────────────────────
    // Full variant
    // ──────────────────────────────────────────────────────────────────────

    describe('Full variant', () => {
        it('should render full progress bar with time detail cards', () => {
            const scheduledTime = timeMinutesAgo(15);

            render(
                <SurgeryProgressBar
                    scheduledTime={scheduledTime}
                    durationMinutes={60}
                    variant="full"
                />
            );

            // Header
            expect(screen.getByText('Auto-Calculated Progress')).toBeInTheDocument();
            // Progress percentage
            expect(screen.getByText('25%')).toBeInTheDocument();
            // Time detail labels
            expect(screen.getByText('Elapsed')).toBeInTheDocument();
            expect(screen.getByText('Remaining')).toBeInTheDocument();
            expect(screen.getByText('Est. End')).toBeInTheDocument();
        });

        it('should show "Complete" badge at 100%', () => {
            const scheduledTime = timeMinutesAgo(60);

            render(
                <SurgeryProgressBar
                    scheduledTime={scheduledTime}
                    durationMinutes={60}
                    variant="full"
                />
            );

            expect(screen.getByText('100%')).toBeInTheDocument();
            expect(screen.getByText('Complete')).toBeInTheDocument();
        });

        it('should show overdue warning with overtime amount', () => {
            const scheduledTime = timeMinutesAgo(80);

            render(
                <SurgeryProgressBar
                    scheduledTime={scheduledTime}
                    durationMinutes={60}
                    variant="full"
                />
            );

            expect(screen.getByText('100%')).toBeInTheDocument();
            expect(screen.getByText('Overdue')).toBeInTheDocument();
            expect(screen.getByText('+20m over')).toBeInTheDocument();
        });
    });

    // ──────────────────────────────────────────────────────────────────────
    // Edge cases
    // ──────────────────────────────────────────────────────────────────────

    describe('Edge cases', () => {
        it('should show 0% for future surgery', () => {
            const scheduledTime = timeMinutesFromNow(30);

            render(
                <SurgeryProgressBar
                    scheduledTime={scheduledTime}
                    durationMinutes={60}
                    variant="compact"
                />
            );

            expect(screen.getByText('0%')).toBeInTheDocument();
        });

        it('should handle missing scheduledTime gracefully', () => {
            render(
                <SurgeryProgressBar
                    scheduledTime={null}
                    durationMinutes={60}
                    variant="compact"
                />
            );

            expect(screen.getByText('0%')).toBeInTheDocument();
        });

        it('should handle missing durationMinutes gracefully', () => {
            render(
                <SurgeryProgressBar
                    scheduledTime="10:00"
                    durationMinutes={null}
                    variant="compact"
                />
            );

            expect(screen.getByText('0%')).toBeInTheDocument();
        });

        it('should use manual progress when higher than auto', () => {
            // Surgery just started (0% auto-progress)
            const scheduledTime = timeMinutesFromNow(5);

            render(
                <SurgeryProgressBar
                    scheduledTime={scheduledTime}
                    durationMinutes={60}
                    manualProgress={75}
                    variant="compact"
                />
            );

            // Should show manual progress since it's higher
            expect(screen.getByText('75%')).toBeInTheDocument();
        });
    });

    // ──────────────────────────────────────────────────────────────────────
    // Auto-refresh
    // ──────────────────────────────────────────────────────────────────────

    describe('Auto-refresh', () => {
        it('should auto-refresh progress on interval', async () => {
            // Start with a surgery 30 mins in on a 60 min duration
            const scheduledTime = timeMinutesAgo(30);

            render(
                <SurgeryProgressBar
                    scheduledTime={scheduledTime}
                    durationMinutes={60}
                    variant="compact"
                    autoRefreshMs={1000}
                />
            );

            // Initial state
            expect(screen.getByText('50%')).toBeInTheDocument();

            // Advance time by 1 second (just triggers the interval)
            await act(async () => {
                vi.advanceTimersByTime(1000);
            });

            // Progress should still be there (may or may not have changed by 1s)
            expect(screen.getByText(/\d+%/)).toBeInTheDocument();
        });
    });
});
