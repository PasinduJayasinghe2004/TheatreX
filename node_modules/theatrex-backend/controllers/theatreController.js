// ============================================================================
// Theatre Controller
// ============================================================================
// Created by: M2 (Chandeepa) - Day 8
// Updated by: M1 (Pasindu)   - Day 12 (Coordinator overview endpoint)
// Updated by: M1 (Pasindu) - Day 10 (Theatre list page, detail, status toggle)
// Updated by: M2 (Chandeepa) - Day 11 (Auto-progress calculation)
// Updated by: M3 (Janani)   - Day 11 (Live status polling endpoint)
// Updated by: M4 (Oneli)    - Day 11 (Theatre duration calculation)
//
// Handles theatre-related HTTP requests including:
// - Listing all active theatres (with optional status/type filters)
// - Getting a single theatre by ID (with current surgery info)
// - Updating theatre status
// - Checking theatre availability for a given date/time/duration
// - Auto-calculating surgery progress from elapsed time
// - Live status polling for real-time dashboard (lightweight)
//
// EXPORTS:
// - getTheatres:                   GET  /api/theatres                         - List active theatres
// - getTheatreById:                GET  /api/theatres/:id                     - Get theatre detail
// - updateTheatreStatus:           PUT  /api/theatres/:id/status              - Toggle status
// - checkTheatreAvailability:      GET  /api/theatres/availability            - Check availability
// - getAutoProgress:               GET  /api/theatres/:id/auto-progress       - Auto-calculated progress
// - getLiveStatus:                 GET  /api/theatres/live-status             - Live status polling
// - getCurrentSurgeryByTheatreId:  (see route definition below)               - Get current surgery for a theatre
// - updateSurgeryProgress:         (see route definition below)               - Update surgery progress
// - getTheatreDuration:            GET  /api/theatres/:id/duration            - Theatre duration calculation
// ============================================================================

import { pool } from '../config/database.js';
import {
    VALID_THEATRE_STATUSES,
    THEATRE_STATUS,
    getAllowedTransitions
} from '../utils/theatreConstants.js';
import { calculateAutoProgress, enrichSurgeryWithProgress } from '../utils/progressCalculator.js';

// ============================================================================
// GET ALL THEATRES
// ============================================================================
// @desc    Get all active theatres with optional status / type filters
//          and the currently-running surgery (if any)
// @route   GET /api/theatres?status=available&type=cardiac
// @access  Protected
// Created by: M2 (Chandeepa) - Day 8
// Updated by: M1 (Pasindu) - Day 10 (filters + current surgery subquery)
// ============================================================================
export const getTheatres = async (req, res) => {
    try {
        const { status, type } = req.query;

        // Build dynamic WHERE clauses
        const conditions = ['t.is_active = TRUE'];
        const params = [];

        if (status) {
            params.push(status);
            conditions.push(`t.status = $${params.length}`);
        }

        if (type) {
            params.push(type);
            conditions.push(`t.theatre_type = $${params.length}`);
        }

        const whereClause = conditions.join(' AND ');

        const { rows } = await pool.query(`
            SELECT
                t.id,
                t.name,
                t.location,
                t.status,
                t.capacity,
                t.equipment,
                t.theatre_type,
                t.is_active,
                t.created_at,
                t.updated_at,
                -- Current surgery (status = in_progress) linked to this theatre
                cs.id            AS current_surgery_id,
                cs.surgery_type  AS current_surgery_type,
                cs.patient_name  AS current_patient_name,
                cs.scheduled_time AS current_surgery_time,
                cs.duration_minutes AS current_surgery_duration,
                cs.progress_percent AS current_surgery_progress
            FROM theatres t
            LEFT JOIN surgeries cs
                ON cs.theatre_id = t.id
               AND cs.status = 'in_progress'
            WHERE ${whereClause}
            ORDER BY t.name ASC
        `, params);

        // Enrich theatres that have an in-progress surgery with auto-progress - M2 Day 11
        const enrichedRows = rows.map(row => {
            if (row.current_surgery_id && row.current_surgery_time && row.current_surgery_duration) {
                const progressData = calculateAutoProgress(
                    row.current_surgery_time,
                    row.current_surgery_duration
                );
                return {
                    ...row,
                    auto_progress: progressData.auto_progress,
                    elapsed_minutes: progressData.elapsed_minutes,
                    remaining_minutes: progressData.remaining_minutes,
                    is_overdue: progressData.is_overdue,
                    estimated_end_time: progressData.estimated_end_time
                };
            }
            return row;
        });

        res.status(200).json({
            success: true,
            count: enrichedRows.length,
            data: enrichedRows
        });
    } catch (error) {
        console.error('Error fetching theatres:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching theatres',
            error: error.message
        });
    }
};

// ============================================================================
// GET THEATRE BY ID
// ============================================================================
// @desc    Get a single theatre with:
//          - current in-progress surgery
//          - upcoming scheduled surgeries (next 7 days)
//          - recent completed/cancelled surgeries (last 7 days)
// @route   GET /api/theatres/:id
// @access  Protected
// Created by: M1 (Pasindu) - Day 10
// Updated by: M2 (Chandeepa) - Day 10 (Added upcoming + history queries)
// ============================================================================
export const getTheatreById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Theatre info + current surgery
        const { rows } = await pool.query(`
            SELECT
                t.id,
                t.name,
                t.location,
                t.status,
                t.capacity,
                t.equipment,
                t.theatre_type,
                t.is_active,
                t.created_at,
                t.updated_at,
                cs.id              AS current_surgery_id,
                cs.surgery_type    AS current_surgery_type,
                cs.patient_name    AS current_patient_name,
                cs.scheduled_time  AS current_surgery_time,
                cs.duration_minutes AS current_surgery_duration,
                cs.status          AS current_surgery_status,
                cs.progress_percent AS current_surgery_progress
            FROM theatres t
            LEFT JOIN surgeries cs
                ON cs.theatre_id = t.id
               AND cs.status = 'in_progress'
            WHERE t.id = $1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        const theatre = rows[0];

        // 2. Upcoming scheduled surgeries (next 7 days) - M2 Day 10
        const { rows: upcoming } = await pool.query(`
            SELECT id, surgery_type, patient_name, scheduled_date, scheduled_time,
                   duration_minutes, status, priority, surgeon_id
            FROM surgeries
            WHERE theatre_id = $1
              AND status = 'scheduled'
              AND scheduled_date >= CURRENT_DATE
              AND scheduled_date <= CURRENT_DATE + INTERVAL '7 days'
            ORDER BY scheduled_date ASC, scheduled_time ASC
            LIMIT 10
        `, [id]);

        // 3. Recent surgery history (last 7 days, completed/cancelled) - M2 Day 10
        const { rows: history } = await pool.query(`
            SELECT id, surgery_type, patient_name, scheduled_date, scheduled_time,
                   duration_minutes, status, priority
            FROM surgeries
            WHERE theatre_id = $1
              AND status IN ('completed', 'cancelled')
              AND scheduled_date >= CURRENT_DATE - INTERVAL '7 days'
            ORDER BY scheduled_date DESC, scheduled_time DESC
            LIMIT 10
        `, [id]);

        // 4. Quick stats - M2 Day 10
        const { rows: statsRows } = await pool.query(`
            SELECT
                COUNT(*) FILTER (WHERE status = 'completed' AND scheduled_date >= CURRENT_DATE - INTERVAL '7 days') AS completed_week,
                COUNT(*) FILTER (WHERE status = 'cancelled' AND scheduled_date >= CURRENT_DATE - INTERVAL '7 days') AS cancelled_week,
                COUNT(*) FILTER (WHERE status = 'scheduled' AND scheduled_date >= CURRENT_DATE) AS upcoming_total
            FROM surgeries
            WHERE theatre_id = $1
        `, [id]);

        const stats = statsRows[0] || { completed_week: 0, cancelled_week: 0, upcoming_total: 0 };

        // Enrich with auto-progress if there's a current surgery - M2 Day 11
        let autoProgressData = null;
        if (theatre.current_surgery_id && theatre.current_surgery_time && theatre.current_surgery_duration) {
            autoProgressData = calculateAutoProgress(
                theatre.current_surgery_time,
                theatre.current_surgery_duration
            );
        }

        res.status(200).json({
            success: true,
            data: {
                ...theatre,
                // Auto-progress fields - M2 Day 11
                auto_progress: autoProgressData?.auto_progress ?? null,
                elapsed_minutes: autoProgressData?.elapsed_minutes ?? null,
                remaining_minutes: autoProgressData?.remaining_minutes ?? null,
                is_overdue: autoProgressData?.is_overdue ?? false,
                estimated_end_time: autoProgressData?.estimated_end_time ?? null,
                upcoming_surgeries: upcoming,
                surgery_history: history,
                stats: {
                    completed_this_week: parseInt(stats.completed_week) || 0,
                    cancelled_this_week: parseInt(stats.cancelled_week) || 0,
                    upcoming_total: parseInt(stats.upcoming_total) || 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching theatre:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching theatre',
            error: error.message
        });
    }
};

// ============================================================================
// UPDATE THEATRE STATUS
// ============================================================================
// @desc    Update a theatre's status (available, in_use, maintenance, cleaning)
// @route   PUT /api/theatres/:id/status
// @access  Protected (coordinator, admin)
// Created by: M1 (Pasindu) - Day 10
// Updated by: M3 (Janani)  - Day 10 (Use centralised enum + transition guard)
// ============================================================================
export const updateTheatreStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Enum validation (belt-and-braces; middleware also validates)
        if (!status || !VALID_THEATRE_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${VALID_THEATRE_STATUSES.join(', ')}`
            });
        }

        // Verify theatre exists
        const { rows: existing } = await pool.query(
            'SELECT id, status FROM theatres WHERE id = $1',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        const previousStatus = existing[0].status;

        // Enforce valid status transitions (M3 - Day 10)
        const allowed = getAllowedTransitions(previousStatus);
        if (!allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot transition from '${previousStatus}' to '${status}'. Allowed transitions: ${allowed.join(', ')}`
            });
        }

        const { rows } = await pool.query(`
            UPDATE theatres
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, name, location, status, capacity, equipment, theatre_type, is_active, updated_at
        `, [status, id]);

        res.status(200).json({
            success: true,
            message: `Theatre status updated from '${previousStatus}' to '${status}'`,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error updating theatre status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating theatre status',
            error: error.message
        });
    }
};

// ============================================================================
// TOGGLE MAINTENANCE MODE
// ============================================================================
// @desc    Dedicated endpoint to put a theatre into or out of maintenance mode.
//          When enabling, an optional reason can be stored.
//          When disabling, the theatre returns to 'available' and the reason
//          is cleared.
// @route   PUT /api/theatres/:id/maintenance
// @access  Protected (coordinator, admin)
// Created by: M4 (Oneli) - Day 12
// ============================================================================
export const toggleMaintenanceMode = async (req, res) => {
    try {
        const { id } = req.params;
        const { enable, reason } = req.body;

        // 1. Validate 'enable' flag is provided
        if (enable === undefined || enable === null) {
            return res.status(400).json({
                success: false,
                message: "'enable' field is required (true to enter maintenance, false to exit)"
            });
        }

        const enableBool = Boolean(enable);

        // 2. Verify theatre exists
        const { rows: existing } = await pool.query(
            'SELECT id, status, name FROM theatres WHERE id = $1',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        const theatre = existing[0];
        const previousStatus = theatre.status;

        if (enableBool) {
            // --- ENTER MAINTENANCE ---
            // Validate transition is allowed
            const allowed = getAllowedTransitions(previousStatus);
            if (!allowed.includes(THEATRE_STATUS.MAINTENANCE)) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot enter maintenance from '${previousStatus}'. Allowed transitions: ${allowed.join(', ')}`
                });
            }

            // Trim & cap reason
            const trimmedReason = reason ? String(reason).trim().slice(0, 500) : null;

            // Try to update with maintenance_reason column; fall back gracefully
            let updatedTheatre;
            try {
                const { rows } = await pool.query(`
                    UPDATE theatres
                    SET status = $1, maintenance_reason = $2, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $3
                    RETURNING id, name, location, status, capacity, equipment,
                              theatre_type, is_active, maintenance_reason, updated_at
                `, [THEATRE_STATUS.MAINTENANCE, trimmedReason, id]);
                updatedTheatre = rows[0];
            } catch (colErr) {
                // Column may not exist yet on older DBs — fall back to status-only update
                const { rows } = await pool.query(`
                    UPDATE theatres
                    SET status = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                    RETURNING id, name, location, status, capacity, equipment,
                              theatre_type, is_active, updated_at
                `, [THEATRE_STATUS.MAINTENANCE, id]);
                updatedTheatre = { ...rows[0], maintenance_reason: trimmedReason };
            }

            return res.status(200).json({
                success: true,
                message: `Theatre '${theatre.name}' is now in maintenance mode`,
                data: updatedTheatre
            });
        } else {
            // --- EXIT MAINTENANCE ---
            if (previousStatus !== THEATRE_STATUS.MAINTENANCE) {
                return res.status(400).json({
                    success: false,
                    message: `Theatre is not in maintenance mode (current status: '${previousStatus}')`
                });
            }

            let updatedTheatre;
            try {
                const { rows } = await pool.query(`
                    UPDATE theatres
                    SET status = $1, maintenance_reason = NULL, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                    RETURNING id, name, location, status, capacity, equipment,
                              theatre_type, is_active, maintenance_reason, updated_at
                `, [THEATRE_STATUS.AVAILABLE, id]);
                updatedTheatre = rows[0];
            } catch (colErr) {
                const { rows } = await pool.query(`
                    UPDATE theatres
                    SET status = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                    RETURNING id, name, location, status, capacity, equipment,
                              theatre_type, is_active, updated_at
                `, [THEATRE_STATUS.AVAILABLE, id]);
                updatedTheatre = { ...rows[0], maintenance_reason: null };
            }

            return res.status(200).json({
                success: true,
                message: `Theatre '${theatre.name}' exited maintenance mode and is now available`,
                data: updatedTheatre
            });
        }
    } catch (error) {
        console.error('Error toggling maintenance mode:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling maintenance mode',
            error: error.message
        });
    }
};

// ============================================================================
// CHECK THEATRE AVAILABILITY
// ============================================================================
// @desc    Check which theatres are available for a given date, time & duration.
//          Returns every active theatre with an `available` boolean flag.
//          A theatre is unavailable if it has an overlapping surgery
//          (status = scheduled | in_progress) at the requested slot,
//          or its current status is 'maintenance'.
// @route   GET /api/theatres/availability?date=YYYY-MM-DD&time=HH:MM&duration=60
// @access  Protected
// Created by: M2 (Chandeepa) - Day 8
// ============================================================================
export const checkTheatreAvailability = async (req, res) => {
    try {
        const { date, time, duration } = req.query;

        // Validate required params
        if (!date || !time || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Missing required query parameters: date, time, duration'
            });
        }

        const durationMinutes = parseInt(duration, 10);
        if (isNaN(durationMinutes) || durationMinutes <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be a positive number (minutes)'
            });
        }

        // 1. Fetch all active theatres
        const { rows: theatres } = await pool.query(`
            SELECT id, name, location, status, capacity, equipment, theatre_type, is_active
            FROM theatres
            WHERE is_active = TRUE
            ORDER BY name ASC
        `);

        // 2. Find conflicting surgeries for the requested slot
        //    Two time ranges overlap when: startA < endB AND endA > startB
        //    We compare using the PostgreSQL interval arithmetic.
        const { rows: conflicts } = await pool.query(`
            SELECT theatre_id
            FROM surgeries
            WHERE scheduled_date = $1
              AND status IN ('scheduled', 'in_progress')
              AND theatre_id IS NOT NULL
              AND (
                  scheduled_time < ($2::time + ($3 || ' minutes')::interval)
                  AND (scheduled_time + (duration_minutes || ' minutes')::interval) > $2::time
              )
        `, [date, time, durationMinutes]);

        const conflictingTheatreIds = new Set(conflicts.map(c => c.theatre_id));

        // 3. Mark each theatre as available or unavailable
        const result = theatres.map(theatre => {
            const hasConflict = conflictingTheatreIds.has(theatre.id);
            const inMaintenance = theatre.status === 'maintenance';

            return {
                ...theatre,
                available: !hasConflict && !inMaintenance,
                conflict_reason: inMaintenance
                    ? 'Theatre is under maintenance'
                    : hasConflict
                        ? 'Theatre has a conflicting surgery at this time'
                        : null
            };
        });

        res.status(200).json({
            success: true,
            count: result.length,
            available_count: result.filter(t => t.available).length,
            data: result,
            query: { date, time, duration: durationMinutes }
        });
    } catch (error) {
        console.error('Error checking theatre availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking theatre availability',
            error: error.message
        });
    }
};
// ============================================================================
// GET CURRENT SURGERY BY THEATRE ID
// ============================================================================
// @desc    Get the currently in-progress surgery for a specific theatre
// @route   GET /api/theatres/:id/current-surgery
// @access  Protected
// Created by: M5 (Inthusha) - Day 10
// ============================================================================
export const getCurrentSurgeryByTheatreId = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the surgery that is currently 'in_progress' for this theatre
        const { rows } = await pool.query(`
            SELECT 
                id, 
                surgery_type, 
                patient_name, 
                scheduled_time, 
                duration_minutes,
                status,
                progress_percent
            FROM surgeries
            WHERE theatre_id = $1 
              AND status = 'in_progress'
            LIMIT 1
        `, [id]);

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No surgery currently in progress for this theatre',
                data: null
            });
        }

        // Enrich with auto-progress - M2 Day 11
        const surgery = rows[0];
        const enriched = enrichSurgeryWithProgress(surgery);

        res.status(200).json({
            success: true,
            data: enriched
        });
    } catch (error) {
        console.error('Error fetching current surgery:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching current surgery',
            error: error.message
        });
    }
};

// ============================================================================
// UPDATE SURGERY PROGRESS
// ============================================================================
// @desc    Update the progress percentage of the current in-progress surgery
//          for a specific theatre
// @route   PUT /api/theatres/:id/progress
// @access  Protected (coordinator, admin)
// Created by: M1 (Pasindu) - Day 11
// ============================================================================
export const updateSurgeryProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { progress } = req.body;

        // Validate progress value
        if (progress === undefined || progress === null) {
            return res.status(400).json({
                success: false,
                message: 'Progress value is required'
            });
        }

        const progressValue = Number(progress);

        if (!Number.isInteger(progressValue) || progressValue < 0 || progressValue > 100) {
            return res.status(400).json({
                success: false,
                message: 'Progress must be an integer between 0 and 100'
            });
        }

        // Verify theatre exists
        const { rows: theatreRows } = await pool.query(
            'SELECT id, name, status FROM theatres WHERE id = $1',
            [id]
        );

        if (theatreRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        // Find the current in-progress surgery for this theatre
        const { rows: surgeryRows } = await pool.query(`
            SELECT id, surgery_type, patient_name, progress_percent
            FROM surgeries
            WHERE theatre_id = $1 AND status = 'in_progress'
            ORDER BY updated_at DESC, id DESC
            LIMIT 1
        `, [id]);

        if (surgeryRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No in-progress surgery found for this theatre'
            });
        }

        const surgery = surgeryRows[0];
        const previousProgress = surgery.progress_percent || 0;

        // Update the surgery progress
        const { rows: updatedRows } = await pool.query(`
            UPDATE surgeries
            SET progress_percent = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, surgery_type, patient_name, progress_percent, status, duration_minutes
        `, [progressValue, surgery.id]);

        res.status(200).json({
            success: true,
            message: `Surgery progress updated from ${previousProgress}% to ${progressValue}%`,
            data: {
                theatre_id: parseInt(id),
                theatre_name: theatreRows[0].name,
                surgery: updatedRows[0]
            }
        });
    } catch (error) {
        console.error('Error updating surgery progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating surgery progress',
            error: error.message
        });
    }
};

// ============================================================================
// GET AUTO-CALCULATED PROGRESS
// ============================================================================
// @desc    Calculate real-time progress for the current in-progress surgery
//          in a specific theatre based on elapsed time vs. estimated duration.
//          Returns auto_progress (%), elapsed/remaining minutes, overdue flag,
//          and estimated end time.
// @route   GET /api/theatres/:id/auto-progress
// @access  Protected
// Created by: M2 (Chandeepa) - Day 11
// ============================================================================
export const getAutoProgress = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Verify theatre exists
        const { rows: theatreRows } = await pool.query(
            'SELECT id, name, status FROM theatres WHERE id = $1',
            [id]
        );

        if (theatreRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        // 2. Find the current in-progress surgery for this theatre
        const { rows: surgeryRows } = await pool.query(`
            SELECT id, surgery_type, patient_name, scheduled_time,
                   duration_minutes, progress_percent, status
            FROM surgeries
            WHERE theatre_id = $1 AND status = 'in_progress'
            ORDER BY updated_at DESC, id DESC
            LIMIT 1
        `, [id]);

        if (surgeryRows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No in-progress surgery found for this theatre',
                data: null
            });
        }

        const surgery = surgeryRows[0];

        // 3. Calculate auto-progress
        const progressData = calculateAutoProgress(
            surgery.scheduled_time,
            surgery.duration_minutes
        );

        res.status(200).json({
            success: true,
            data: {
                theatre_id: parseInt(id),
                theatre_name: theatreRows[0].name,
                surgery_id: surgery.id,
                surgery_type: surgery.surgery_type,
                patient_name: surgery.patient_name,
                scheduled_time: surgery.scheduled_time,
                duration_minutes: surgery.duration_minutes,
                manual_progress: surgery.progress_percent || 0,
                ...progressData
            }
        });
    } catch (error) {
        console.error('Error calculating auto-progress:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating auto-progress',
            error: error.message
        });
    }
};

// ============================================================================
// GET LIVE STATUS (Polling Endpoint)
// ============================================================================
// @desc    Lightweight endpoint optimised for frequent polling (every 30s).
//          Returns every active theatre with its current status, current
//          in-progress surgery (if any), auto-calculated progress, and
//          summary stats — all in a single, minimal payload.
// @route   GET /api/theatres/live-status
// @access  Protected
// Created by: M3 (Janani) - Day 11
// ============================================================================
export const getLiveStatus = async (req, res) => {
    try {
        // Single query: theatres + current in-progress surgery (if any)
        const { rows } = await pool.query(`
            SELECT
                t.id,
                t.name,
                t.location,
                t.status,
                t.theatre_type,
                cs.id              AS current_surgery_id,
                cs.surgery_type    AS current_surgery_type,
                cs.patient_name    AS current_patient_name,
                cs.scheduled_time  AS current_surgery_time,
                cs.duration_minutes AS current_surgery_duration,
                cs.progress_percent AS current_surgery_progress,
                cs.priority        AS current_surgery_priority
            FROM theatres t
            LEFT JOIN surgeries cs
                ON cs.theatre_id = t.id
               AND cs.status = 'in_progress'
            WHERE t.is_active = TRUE
            ORDER BY t.name ASC
        `);

        // Enrich with auto-progress for theatres that have a running surgery
        const theatres = rows.map(row => {
            const base = {
                id: row.id,
                name: row.name,
                location: row.location,
                status: row.status,
                theatre_type: row.theatre_type,
                current_surgery: null
            };

            if (row.current_surgery_id && row.current_surgery_time && row.current_surgery_duration) {
                const progressData = calculateAutoProgress(
                    row.current_surgery_time,
                    row.current_surgery_duration
                );

                base.current_surgery = {
                    id: row.current_surgery_id,
                    surgery_type: row.current_surgery_type,
                    patient_name: row.current_patient_name,
                    scheduled_time: row.current_surgery_time,
                    duration_minutes: row.current_surgery_duration,
                    manual_progress: row.current_surgery_progress || 0,
                    priority: row.current_surgery_priority,
                    auto_progress: progressData.auto_progress,
                    elapsed_minutes: progressData.elapsed_minutes,
                    remaining_minutes: progressData.remaining_minutes,
                    is_overdue: progressData.is_overdue,
                    estimated_end_time: progressData.estimated_end_time
                };
            }

            return base;
        });

        // Summary counts
        const summary = {
            total: theatres.length,
            available: theatres.filter(t => t.status === 'available').length,
            in_use: theatres.filter(t => t.status === 'in_use').length,
            maintenance: theatres.filter(t => t.status === 'maintenance').length,
            cleaning: theatres.filter(t => t.status === 'cleaning').length,
            overdue: theatres.filter(t => t.current_surgery?.is_overdue).length
        };

        res.status(200).json({
            success: true,
            polled_at: new Date().toISOString(),
            summary,
            data: theatres
        });
    } catch (error) {
        console.error('Error fetching live status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching live status',
            error: error.message
        });
    }
};

// ============================================================================
// GET THEATRE DURATION
// ============================================================================
// @desc    Calculate elapsed, remaining, and total duration for the current
//          in-progress surgery in a specific theatre. Returns both raw minute
//          values and human-readable formatted strings (e.g. "1h 23m").
// @route   GET /api/theatres/:id/duration
// @access  Protected
// Created by: M4 (Oneli) - Day 11
// ============================================================================
export const getTheatreDuration = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Verify theatre exists
        const { rows: theatreRows } = await pool.query(
            'SELECT id, name, status FROM theatres WHERE id = $1',
            [id]
        );

        if (theatreRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        // 2. Find the current in-progress surgery for this theatre
        const { rows: surgeryRows } = await pool.query(`
            SELECT id, surgery_type, patient_name, scheduled_time,
                   duration_minutes, progress_percent, status
            FROM surgeries
            WHERE theatre_id = $1 AND status = 'in_progress'
            ORDER BY updated_at DESC, id DESC
            LIMIT 1
        `, [id]);

        if (surgeryRows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No in-progress surgery found for this theatre',
                data: null
            });
        }

        const surgery = surgeryRows[0];

        // 3. Calculate duration using the existing progress calculator
        const progressData = calculateAutoProgress(
            surgery.scheduled_time,
            surgery.duration_minutes
        );

        // 4. Format minutes into human-readable strings
        const formatMinutes = (mins) => {
            if (mins <= 0) return '0m';
            const hours = Math.floor(mins / 60);
            const minutes = mins % 60;
            if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
            if (hours > 0) return `${hours}h`;
            return `${minutes}m`;
        };

        // 5. Calculate overdue amount if applicable
        const overdueMinutes = progressData.is_overdue
            ? progressData.elapsed_minutes - surgery.duration_minutes
            : 0;

        res.status(200).json({
            success: true,
            data: {
                theatre_id: parseInt(id),
                theatre_name: theatreRows[0].name,
                surgery_id: surgery.id,
                duration: {
                    total: surgery.duration_minutes,
                    elapsed: progressData.elapsed_minutes,
                    remaining: progressData.remaining_minutes,
                    overdue: overdueMinutes,
                    formatted: {
                        total: formatMinutes(surgery.duration_minutes),
                        elapsed: formatMinutes(progressData.elapsed_minutes),
                        remaining: progressData.is_overdue ? '0m' : formatMinutes(progressData.remaining_minutes),
                        overdue: overdueMinutes > 0 ? formatMinutes(overdueMinutes) : '0m'
                    }
                },
                is_overdue: progressData.is_overdue,
                estimated_end_time: progressData.estimated_end_time
            }
        });
    } catch (error) {
        console.error('Error calculating theatre duration:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating theatre duration',
            error: error.message
        });
    }
};

// ============================================================================
// GET THEATRE STATS
// ============================================================================
// @desc    Get summary statistics for all active theatres.
// @route   GET /api/theatres/stats
// @access  Protected
// Created by: M5 (Inthusha) - Day 11
// ============================================================================
export const getTheatreStats = async (req, res) => {
    try {
        // 1. Get status-based counts
        const { rows: statusRows } = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM theatres
            WHERE is_active = TRUE
            GROUP BY status
        `);

        // 2. Get type-based counts
        const { rows: typeRows } = await pool.query(`
            SELECT theatre_type, COUNT(*) as count
            FROM theatres
            WHERE is_active = TRUE
            GROUP BY theatre_type
        `);

        // 3. Get utilization stats (in_use vs total)
        const { rows: utilizationRows } = await pool.query(`
            SELECT 
                COUNT(*) as total_active,
                COUNT(*) FILTER (WHERE status = 'in_use') as currently_in_use,
                SUM(capacity) as total_capacity
            FROM theatres
            WHERE is_active = TRUE
        `);

        // 4. Get average surgery progress for in-progress surgeries
        const { rows: progressRows } = await pool.query(`
            SELECT COALESCE(AVG(progress_percent), 0) as avg_progress
            FROM surgeries
            WHERE status = 'in_progress'
        `);

        // Format status counts into a cleaner object
        const statusCounts = {};
        VALID_THEATRE_STATUSES.forEach(status => {
            statusCounts[status] = 0;
        });
        statusRows.forEach(row => {
            statusCounts[row.status] = parseInt(row.count);
        });

        const stats = {
            total_theatres: parseInt(utilizationRows[0].total_active) || 0,
            status_summary: statusCounts,
            type_summary: typeRows.reduce((acc, row) => {
                acc[row.theatre_type] = parseInt(row.count);
                return acc;
            }, {}),
            utilization: {
                in_use_count: parseInt(utilizationRows[0].currently_in_use) || 0,
                utilization_rate: utilizationRows[0].total_active > 0
                    ? ((utilizationRows[0].currently_in_use / utilizationRows[0].total_active) * 100).toFixed(1)
                    : 0,
                total_capacity: parseInt(utilizationRows[0].total_capacity) || 0
            },
            average_surgery_progress: parseFloat(progressRows[0].avg_progress).toFixed(1)
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching theatre stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching theatre stats',
            error: error.message
        });
    }
};

// ============================================================================
// GET COORDINATOR OVERVIEW
// ============================================================================
// @desc    Coordinator-specific overview of ALL active theatres.
//          Returns every theatre with its current surgery (if any) enriched
//          with auto-progress, plus a summary object with status counts,
//          utilization rate, and overdue count — all in one query.
// @route   GET /api/theatres/coordinator-overview
// @access  Protected (coordinator, admin)
// Created by: M1 (Pasindu) - Day 12
// ============================================================================
export const getCoordinatorOverview = async (req, res) => {
    try {
        // Single query: all active theatres + current in-progress surgery (if any)
        const { rows } = await pool.query(`
            SELECT
                t.id,
                t.name,
                t.location,
                t.status,
                t.capacity,
                t.theatre_type,
                t.is_active,
                cs.id               AS current_surgery_id,
                cs.surgery_type     AS current_surgery_type,
                cs.patient_name     AS current_patient_name,
                cs.scheduled_time   AS current_surgery_time,
                cs.duration_minutes AS current_surgery_duration,
                cs.progress_percent AS current_surgery_progress,
                cs.priority         AS current_surgery_priority
            FROM theatres t
            LEFT JOIN surgeries cs
                ON cs.theatre_id = t.id
               AND cs.status = 'in_progress'
            WHERE t.is_active = TRUE
            ORDER BY t.name ASC
        `);

        // Enrich each row with auto-progress if a surgery is running
        const theatres = rows.map(row => {
            const theatre = {
                id: row.id,
                name: row.name,
                location: row.location,
                status: row.status,
                capacity: row.capacity,
                theatre_type: row.theatre_type,
                current_surgery: null
            };

            if (row.current_surgery_id && row.current_surgery_time && row.current_surgery_duration) {
                const progressData = calculateAutoProgress(
                    row.current_surgery_time,
                    row.current_surgery_duration
                );

                theatre.current_surgery = {
                    id: row.current_surgery_id,
                    surgery_type: row.current_surgery_type,
                    patient_name: row.current_patient_name,
                    scheduled_time: row.current_surgery_time,
                    duration_minutes: row.current_surgery_duration,
                    manual_progress: row.current_surgery_progress || 0,
                    priority: row.current_surgery_priority,
                    auto_progress: progressData.auto_progress,
                    elapsed_minutes: progressData.elapsed_minutes,
                    remaining_minutes: progressData.remaining_minutes,
                    is_overdue: progressData.is_overdue,
                    estimated_end_time: progressData.estimated_end_time
                };
            }

            return theatre;
        });

        // Build summary object
        const total = theatres.length;
        const available = theatres.filter(t => t.status === 'available').length;
        const in_use = theatres.filter(t => t.status === 'in_use').length;
        const maintenance = theatres.filter(t => t.status === 'maintenance').length;
        const cleaning = theatres.filter(t => t.status === 'cleaning').length;
        const overdue_count = theatres.filter(t => t.current_surgery?.is_overdue).length;
        const utilization_rate = total > 0
            ? parseFloat(((in_use / total) * 100).toFixed(1))
            : 0;

        const summary = {
            total,
            available,
            in_use,
            maintenance,
            cleaning,
            utilization_rate,
            overdue_count
        };

        res.status(200).json({
            success: true,
            generated_at: new Date().toISOString(),
            summary,
            data: theatres
        });
    } catch (error) {
        console.error('Error fetching coordinator overview:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coordinator overview',
            error: error.message
        });
    }
};
// ============================================================================
// QUICK UPDATE THEATRE STATUS
// ============================================================================
// @desc    One-click status update for the Coordinator Dashboard.
//          Validates current status and allowed transitions.
// @route   PATCH /api/theatres/:id/quick-status
// @access  Protected (coordinator, admin)
// Created by: M2 (Chandeepa) - Day 12
// ============================================================================
export const quickUpdateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !VALID_THEATRE_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${VALID_THEATRE_STATUSES.join(', ')}`
            });
        }

        // Validate that :id is numeric
        if (isNaN(parseInt(id, 10)) || !/^\d+$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: 'Theatre ID must be a numeric value'
            });
        }

        // 1. Get current status
        const { rows: existing } = await pool.query(
            'SELECT id, status, name FROM theatres WHERE id = $1',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        const currentStatus = existing[0].status;
        const name = existing[0].name;

        // 2. Validate transition
        const allowed = getAllowedTransitions(currentStatus);
        if (!allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot transition from '${currentStatus}' to '${status}'. Allowed: ${allowed.join(', ')}`
            });
        }

        // 3. Update status
        const { rows } = await pool.query(`
            UPDATE theatres
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, name, status, updated_at
        `, [status, id]);

        res.status(200).json({
            success: true,
            message: `Theatre '${name}' updated to ${status}`,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error in quickUpdateStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating theatre status',
            error: error.message
        });
    }
};
