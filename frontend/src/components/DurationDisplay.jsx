// ============================================================================
// Duration Display Component
// ============================================================================
// Created by: M4 (Oneli) - Day 11
//
// A reusable component that displays elapsed, remaining, and total duration
// for a theatre's current surgery. Auto-refreshes every 30 seconds using
// client-side calculation (mirrors backend progressCalculator.js logic).
//
// Variants:
//   - 'compact' : Single-row indicator for TheatreCard (elapsed / total)
//   - 'full'    : Detailed grid for TheatreDetailCard (elapsed, remaining,
//                  total, start time, estimated end)
//
// Props:
//   scheduledTime   - Surgery start time (HH:mm or HH:mm:ss)
//   durationMinutes - Estimated total duration in minutes
//   variant         - 'compact' | 'full' (default: 'compact')
//   className       - Additional CSS classes
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Clock, Timer, AlertTriangle, PlayCircle } from 'lucide-react';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Format minutes into human-readable string (e.g. "1h 23m" or "45m") */
const formatMinutes = (mins) => {
    if (mins <= 0) return '0m';
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
};

/** Format a HH:mm:ss or HH:mm time string into 12-hour AM/PM */
const formatTime12h = (timeString) => {
    if (!timeString) return 'N/A';
    const parts = timeString.toString().split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
};

/**
 * Calculate duration info from scheduled time and estimated duration.
 * Mirrors backend progressCalculator.js for client-side real-time updates.
 */
const calculateDuration = (scheduledTime, durationMinutes) => {
    if (!scheduledTime || !durationMinutes || durationMinutes <= 0) {
        return {
            elapsed: 0,
            remaining: durationMinutes || 0,
            total: durationMinutes || 0,
            isOverdue: false,
            overdueMinutes: 0,
            estimatedEnd: null,
            startTime: scheduledTime
        };
    }

    const timeParts = scheduledTime.toString().split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(hours, minutes, seconds, 0);

    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const elapsedMs = now.getTime() - startTime.getTime();
    const elapsed = Math.max(0, Math.round(elapsedMs / 60000));
    const remaining = Math.max(0, durationMinutes - elapsed);
    const isOverdue = elapsed > durationMinutes;
    const overdueMinutes = isOverdue ? elapsed - durationMinutes : 0;

    const endH = endTime.getHours().toString().padStart(2, '0');
    const endM = endTime.getMinutes().toString().padStart(2, '0');

    return {
        elapsed,
        remaining,
        total: durationMinutes,
        isOverdue,
        overdueMinutes,
        estimatedEnd: `${endH}:${endM}`,
        startTime: scheduledTime
    };
};

// ── Colour helpers ──────────────────────────────────────────────────────────

const getDurationColor = (elapsed, total) => {
    if (elapsed > total) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    const pct = (elapsed / total) * 100;
    if (pct >= 75) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
    return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' };
};

// ── Component ───────────────────────────────────────────────────────────────

const DurationDisplay = ({
    scheduledTime,
    durationMinutes,
    variant = 'compact',
    className = ''
}) => {
    const compute = useCallback(
        () => calculateDuration(scheduledTime, durationMinutes),
        [scheduledTime, durationMinutes]
    );

    const [dur, setDur] = useState(() => compute());

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const timer = setInterval(() => setDur(compute()), 30000);
        return () => clearInterval(timer);
    }, [compute]);

    if (!scheduledTime || !durationMinutes) return null;

    const colors = getDurationColor(dur.elapsed, dur.total);

    // ── Compact Variant (TheatreCard) ────────────────────────────────────

    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-2 mt-2 ${className}`}>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${colors.bg} ${colors.border} border`}>
                    <Timer className={`w-3 h-3 ${colors.text}`} />
                    <span className={`text-xs font-semibold ${colors.text}`}>
                        {formatMinutes(dur.elapsed)}
                    </span>
                    <span className="text-xs text-gray-400">/</span>
                    <span className="text-xs text-gray-500 font-medium">
                        {formatMinutes(dur.total)}
                    </span>
                </div>
                {dur.isOverdue && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        +{formatMinutes(dur.overdueMinutes)} over
                    </span>
                )}
                {!dur.isOverdue && dur.remaining > 0 && (
                    <span className="text-[10px] text-gray-400">
                        {formatMinutes(dur.remaining)} left
                    </span>
                )}
            </div>
        );
    }

    // ── Full Variant (TheatreDetailCard) ─────────────────────────────────

    return (
        <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Timer className={`w-4 h-4 ${colors.text}`} />
                    <span className={`text-sm font-semibold ${colors.text}`}>
                        Surgery Duration
                    </span>
                </div>
                {dur.isOverdue && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Overdue by {formatMinutes(dur.overdueMinutes)}
                    </span>
                )}
            </div>

            {/* Duration Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-2.5 bg-white/70 rounded-lg">
                    <PlayCircle className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Started</p>
                        <p className="text-sm font-semibold text-gray-700">
                            {formatTime12h(dur.startTime)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-white/70 rounded-lg">
                    <Timer className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Elapsed</p>
                        <p className={`text-sm font-semibold ${colors.text}`}>
                            {formatMinutes(dur.elapsed)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-white/70 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Remaining</p>
                        <p className="text-sm font-semibold text-gray-700">
                            {dur.isOverdue
                                ? `+${formatMinutes(dur.overdueMinutes)} over`
                                : formatMinutes(dur.remaining)
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-white/70 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Est. End</p>
                        <p className="text-sm font-semibold text-gray-700">
                            {dur.estimatedEnd ? formatTime12h(dur.estimatedEnd) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DurationDisplay;
