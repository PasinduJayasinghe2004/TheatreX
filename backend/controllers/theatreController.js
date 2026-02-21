// ============================================================================
// Theatre Controller
// ============================================================================
// Created by: M2 (Chandeepa) - Day 8
// Updated by: M1 (Pasindu) - Day 10 (Theatre list page, detail, status toggle)
//
// Handles theatre-related HTTP requests including:
// - Listing all active theatres (with optional status/type filters)
// - Getting a single theatre by ID (with current surgery info)
// - Updating theatre status
// - Checking theatre availability for a given date/time/duration
//
// EXPORTS:
// - getTheatres:              GET  /api/theatres              - List active theatres
// - getTheatreById:           GET  /api/theatres/:id          - Get theatre detail
// - updateTheatreStatus:      PUT  /api/theatres/:id/status   - Toggle status
// - checkTheatreAvailability: GET  /api/theatres/availability - Check availability
// ============================================================================

import { pool } from '../config/database.js';

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
                cs.duration_minutes AS current_surgery_duration
            FROM theatres t
            LEFT JOIN surgeries cs
                ON cs.theatre_id = t.id
               AND cs.status = 'in_progress'
            WHERE ${whereClause}
            ORDER BY t.name ASC
        `, params);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
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
                cs.status          AS current_surgery_status
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

        res.status(200).json({
            success: true,
            data: {
                ...theatre,
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
// ============================================================================
export const updateTheatreStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['available', 'in_use', 'maintenance', 'cleaning'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
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
