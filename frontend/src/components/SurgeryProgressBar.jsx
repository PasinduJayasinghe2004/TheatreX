// ============================================================================
// Surgery Progress Bar Component
// ============================================================================
// Created by: M2 (Chandeepa) - Day 11
//
// A reusable, auto-updating progress bar that displays real-time surgery
// progress based on elapsed time vs. estimated duration. Differs from the
// ProgressSlider (M1 Day 11) — this is a read-only display component that
// auto-calculates progress from the scheduled time and duration.
//
// Features:
//   - Auto-calculates progress from scheduled_time + duration_minutes
//   - Auto-updates every 30 seconds via internal timer
//   - Colour-coded progress bar (red → amber → blue → green)
//   - Shows elapsed / remaining time in human-readable format
//   - "Overdue" warning when elapsed > estimated duration
//   - Supports compact (for cards) and full (for detail views) variants
//
// Props:
//   scheduledTime   - Surgery start time (HH:mm or HH:mm:ss string)
//   durationMinutes - Estimated surgery duration in minutes
//   manualProgress  - Optional manual progress override (0-100)
//   variant         - 'compact' | 'full' (default: 'compact')
//   showTimer       - Whether to show elapsed/remaining time (default: true)
//   autoRefreshMs   - Auto-refresh interval in ms (default: 30000 = 30s)
//   className       - Additional CSS classes for the container
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Activity, Clock, AlertTriangle, Timer, CheckCircle2 } from 'lucide-react';

// ── Progress colour helpers ─────────────────────────────────────────────────

const getProgressColor = (value) => {
    if (value < 25) return 'bg-red-500';
    if (value < 50) return 'bg-amber-500';
    if (value < 75) return 'bg-blue-500';
    return 'bg-emerald-500';
};

const getProgressTextColor = (value) => {
    if (value < 25) return 'text-red-600';
    if (value < 50) return 'text-amber-600';
    if (value < 75) return 'text-blue-600';
    return 'text-emerald-600';
};

const getProgressBgColor = (value) => {
    if (value < 25) return 'bg-red-100';
    if (value < 50) return 'bg-amber-100';
    if (value < 75) return 'bg-blue-100';
    return 'bg-emerald-100';
};

// ── Time formatting helpers ─────────────────────────────────────────────────

/**
 * Format minutes into human-readable string (e.g. "1h 23m" or "45m")
 */
const formatMinutes = (mins) => {
    if (mins <= 0) return '0m';
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
};

/**
 * Calculate auto-progress based on scheduled time and duration.
 * Mirrors the backend progressCalculator.js logic for client-side real-time updates.
 */
const calculateProgress = (scheduledTime, durationMinutes) => {
    if (!scheduledTime || !durationMinutes || durationMinutes <= 0) {
        return {
            progress: 0,
            elapsed: 0,
            remaining: durationMinutes || 0,
            isOverdue: false,
            estimatedEnd: null
        };
    }

    // Parse scheduled time
    const timeParts = scheduledTime.toString().split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    // Build start time from today
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(hours, minutes, seconds, 0);

    // End time
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    // Elapsed
    const elapsedMs = now.getTime() - startTime.getTime();
    const elapsedMinutes = Math.max(0, Math.round(elapsedMs / 60000));

    // Progress (0-100)
    const rawProgress = (elapsedMinutes / durationMinutes) * 100;
    const progress = Math.min(100, Math.max(0, Math.round(rawProgress)));

    // Remaining
    const remaining = Math.max(0, durationMinutes - elapsedMinutes);

    // End time string
    const endHours = endTime.getHours().toString().padStart(2, '0');
    const endMins = endTime.getMinutes().toString().padStart(2, '0');

    return {
        progress,
        elapsed: elapsedMinutes,
        remaining,
        isOverdue: elapsedMinutes > durationMinutes,
        estimatedEnd: `${endHours}:${endMins}`
    };
};

// ── Component ───────────────────────────────────────────────────────────────

const SurgeryProgressBar = ({
    scheduledTime,
    durationMinutes,
    manualProgress,
    variant = 'compact',
    showTimer = true,
    autoRefreshMs = 30000,
    className = ''
}) => {
    // Calculate progress state
    const computeProgress = useCallback(() => {
        return calculateProgress(scheduledTime, durationMinutes);
    }, [scheduledTime, durationMinutes]);

    const [progressState, setProgressState] = useState(computeProgress);

    // Auto-refresh timer
    useEffect(() => {
        // Initial calculation
        setProgressState(computeProgress());

        // Set up interval for auto-refresh
        const timer = setInterval(() => {
            setProgressState(computeProgress());
        }, autoRefreshMs);

        return () => clearInterval(timer);
    }, [computeProgress, autoRefreshMs]);

    // Use manual progress if provided and higher than auto
    const displayProgress = useMemo(() => {
        if (manualProgress !== undefined && manualProgress !== null) {
            return Math.max(progressState.progress, manualProgress);
        }
        return progressState.progress;
    }, [progressState.progress, manualProgress]);

    const barColor = getProgressColor(displayProgress);
    const textColor = getProgressTextColor(displayProgress);
    const bgColor = getProgressBgColor(displayProgress);

    // ── Compact Variant (for TheatreCard) ────────────────────────────────

    if (variant === 'compact') {
        return (
            <div className={`w-full ${className}`}>
                {/* Progress header row */}
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium text-gray-600">Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {progressState.isOverdue && (
                            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-600">
                                <AlertTriangle className="w-3 h-3" />
                                Overdue
                            </span>
                        )}
                        <span className={`text-xs font-bold ${textColor}`}>
                            {displayProgress}%
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className={`relative w-full h-1.5 ${bgColor} rounded-full overflow-hidden`}>
                    <div
                        className={`absolute left-0 top-0 h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${displayProgress}%` }}
                    />
                </div>

                {/* Time info */}
                {showTimer && (
                    <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                        <span>{formatMinutes(progressState.elapsed)} elapsed</span>
                        <span>{formatMinutes(progressState.remaining)} left</span>
                    </div>
                )}
            </div>
        );
    }

    // ── Full Variant (for TheatreDetail / standalone) ────────────────────

    return (
        <div className={`w-full ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">
                        Auto-Calculated Progress
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {progressState.isOverdue && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Overdue
                        </span>
                    )}
                    {displayProgress === 100 && !progressState.isOverdue && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Complete
                        </span>
                    )}
                    <span className={`text-lg font-bold ${textColor}`}>
                        {displayProgress}%
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div className={`relative w-full h-3 ${bgColor} rounded-full overflow-hidden mb-3`}>
                <div
                    className={`absolute left-0 top-0 h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${displayProgress}%` }}
                />
            </div>

            {/* Time details grid */}
            {showTimer && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Timer className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Elapsed</p>
                            <p className="text-sm font-semibold text-gray-700">
                                {formatMinutes(progressState.elapsed)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Remaining</p>
                            <p className="text-sm font-semibold text-gray-700">
                                {progressState.isOverdue
                                    ? `+${formatMinutes(progressState.elapsed - durationMinutes)} over`
                                    : formatMinutes(progressState.remaining)
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Est. End</p>
                            <p className="text-sm font-semibold text-gray-700">
                                {progressState.estimatedEnd || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SurgeryProgressBar;
