// ============================================================================
// Auto-Progress Calculator Utility
// ============================================================================
// Created by: M2 (Chandeepa) - Day 11
//
// Calculates surgery progress automatically based on elapsed time vs.
// estimated duration. Used by the theatre controller to provide real-time
// progress without requiring manual slider updates.
//
// EXPORTS:
//   calculateAutoProgress(scheduledTime, durationMinutes, referenceDate)
//     → { auto_progress, elapsed_minutes, remaining_minutes, is_overdue }
//
//   enrichSurgeryWithProgress(surgery, referenceDate)
//     → surgery object with auto_progress fields merged in
// ============================================================================

/**
 * Calculate auto-progress for an in-progress surgery based on elapsed time.
 *
 * @param {string} scheduledTime  - Surgery start time in HH:mm:ss or HH:mm format
 * @param {number} durationMinutes - Estimated surgery duration in minutes
 * @param {Date}   [referenceDate] - Override "now" for testing (default: new Date())
 * @returns {{
 *   auto_progress: number,
 *   elapsed_minutes: number,
 *   remaining_minutes: number,
 *   is_overdue: boolean,
 *   estimated_end_time: string
 * }}
 */
export const calculateAutoProgress = (scheduledTime, durationMinutes, referenceDate = new Date()) => {
    // Guard: missing inputs → return zero progress
    if (!scheduledTime || !durationMinutes || durationMinutes <= 0) {
        return {
            auto_progress: 0,
            elapsed_minutes: 0,
            remaining_minutes: durationMinutes || 0,
            is_overdue: false,
            estimated_end_time: null
        };
    }

    // Parse scheduled time (could be HH:mm:ss or HH:mm)
    const timeParts = scheduledTime.toString().split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    // Build a Date for the surgery start using today's date as base
    const startTime = new Date(referenceDate);
    startTime.setHours(hours, minutes, seconds, 0);

    // Calculate the estimated end time
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    // Elapsed time in minutes (can be negative if surgery hasn't started yet)
    const elapsedMs = referenceDate.getTime() - startTime.getTime();
    const elapsedMinutes = Math.max(0, Math.round(elapsedMs / 60000));

    // Calculate progress percentage (0-100, capped at 100)
    const rawProgress = (elapsedMinutes / durationMinutes) * 100;
    const autoProgress = Math.min(100, Math.max(0, Math.round(rawProgress)));

    // Remaining minutes (can be negative if overdue)
    const remainingMinutes = Math.max(0, durationMinutes - elapsedMinutes);

    // Whether surgery has exceeded estimated duration
    const isOverdue = elapsedMinutes > durationMinutes;

    // Format end time as HH:mm
    const endHours = endTime.getHours().toString().padStart(2, '0');
    const endMins = endTime.getMinutes().toString().padStart(2, '0');
    const estimatedEndTime = `${endHours}:${endMins}`;

    return {
        auto_progress: autoProgress,
        elapsed_minutes: elapsedMinutes,
        remaining_minutes: remainingMinutes,
        is_overdue: isOverdue,
        estimated_end_time: estimatedEndTime
    };
};

/**
 * Enrich a surgery row with auto-calculated progress fields.
 * Merges auto_progress data into the surgery object without
 * overwriting the manual progress_percent field.
 *
 * @param {object} surgery        - Surgery row from the database
 * @param {Date}   [referenceDate] - Override "now" for testing
 * @returns {object} - Surgery with additional auto_progress fields
 */
export const enrichSurgeryWithProgress = (surgery, referenceDate = new Date()) => {
    if (!surgery || surgery.status !== 'in_progress') {
        return surgery;
    }

    // Use scheduled_time from the surgery record
    const scheduledTime = surgery.scheduled_time || surgery.current_surgery_time;
    const durationMinutes = surgery.duration_minutes || surgery.current_surgery_duration;

    const progressData = calculateAutoProgress(scheduledTime, durationMinutes, referenceDate);

    return {
        ...surgery,
        auto_progress: progressData.auto_progress,
        elapsed_minutes: progressData.elapsed_minutes,
        remaining_minutes: progressData.remaining_minutes,
        is_overdue: progressData.is_overdue,
        estimated_end_time: progressData.estimated_end_time
    };
};
