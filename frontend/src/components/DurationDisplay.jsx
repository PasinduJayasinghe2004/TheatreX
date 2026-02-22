// ============================================================================
// Duration Display Component
// ============================================================================
// Displays the elapsed duration since a given start time and auto-refreshes
// every 30 seconds so the display stays current without requiring a page reload.
//
// Props:
//   startTime       - Surgery start time string (HH:mm or HH:mm:ss)
//   durationMinutes - Estimated total duration in minutes (optional)
//   className       - Additional CSS classes for the container (optional)
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Compute elapsed duration string from a start time string.
 * Returns a human-readable string like "1h 23m" or "45m".
 */
const computeElapsed = (startTime) => {
    if (!startTime) return '—';

    const timeParts = startTime.toString().split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    const now = new Date();
    const start = new Date(now);
    start.setHours(hours, minutes, seconds, 0);

    const elapsedMs = now.getTime() - start.getTime();
    if (elapsedMs < 0) return '0m';

    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const remainingMins = elapsedMinutes % 60;

    if (elapsedHours > 0 && remainingMins > 0) return `${elapsedHours}h ${remainingMins}m`;
    if (elapsedHours > 0) return `${elapsedHours}h`;
    return `${elapsedMinutes}m`;
};

// ── Component ────────────────────────────────────────────────────────────────

const DurationDisplay = ({ startTime, durationMinutes, className = '' }) => {
    const compute = useCallback(() => computeElapsed(startTime), [startTime]);

    const [dur, setDur] = useState(() => compute());

    useEffect(() => {
        setDur(() => compute());
        const timer = setInterval(() => setDur(() => compute()), 30000);
        return () => clearInterval(timer);
    }, [compute]);

    return (
        <span className={`inline-flex items-center gap-1 text-sm text-gray-600 ${className}`}>
            <Clock className="w-3 h-3" />
            {dur}
            {durationMinutes ? ` / ${durationMinutes}m` : ''}
        </span>
    );
};

export default DurationDisplay;
