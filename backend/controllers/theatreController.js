// ============================================================================
// Theatre Controller
// ============================================================================
// Created by: M2 (Chandeepa) - Day 8
//
// Handles theatre-related HTTP requests including:
// - Listing all active theatres
// - Checking theatre availability for a given date/time/duration
//
// EXPORTS:
// - getTheatres:             GET  /api/theatres           - List active theatres
// - checkTheatreAvailability: GET /api/theatres/availability - Check availability
// ============================================================================

import { pool } from '../config/database.js';

// ============================================================================
// GET ALL THEATRES
// ============================================================================
// @desc    Get all active theatres for dropdown selection
// @route   GET /api/theatres
// @access  Protected
// Created by: M2 (Chandeepa) - Day 8
// ============================================================================
export const getTheatres = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT id, name, location, status, capacity, equipment, theatre_type, is_active
            FROM theatres
            WHERE is_active = TRUE
            ORDER BY name ASC
        `);

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
