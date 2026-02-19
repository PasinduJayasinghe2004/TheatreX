// ============================================================================
// Surgery Controller
// ============================================================================
// Created by: M1 (Pasindu) - Day 5
// Updated by: M2 (Chandeepa) - Day 6 (Added deleteSurgery)
// Updated by: M3 (Janani) - Day 6 (Added updateSurgeryStatus, status filter)
// Updated by: M1 (Pasindu) - Day 8 (Added checkConflicts for emergency booking)
// Updated by: M2 (Chandeepa) - Day 9 (Added getAvailableNurses, nurse assignment)
// 
// Handles all surgery-related HTTP requests and business logic.
// Contains CRUD operations for surgery management.
//
// EXPORTS:
// - createSurgery: POST /api/surgeries - Create new surgery
// - getAllSurgeries: GET /api/surgeries - List surgeries (with date/status filters)
// - getSurgeryById: GET /api/surgeries/:id - Get single surgery
// - updateSurgery: PUT /api/surgeries/:id - Update surgery fields
// - updateSurgeryStatus: PATCH /api/surgeries/:id/status - Update surgery status
// - deleteSurgery: DELETE /api/surgeries/:id - Delete surgery
// - getSurgeonsDropdown: GET /api/surgeries/surgeons - Surgeons list
// - getAvailableSurgeons: GET /api/surgeries/surgeons/available - Available surgeons (M1 Day 9)
// - getAvailableNurses: GET /api/surgeries/nurses/available - Available nurses (M2 Day 9)
// - getCalendarEvents: GET /api/surgeries/events - FullCalendar events
// - checkConflicts: POST /api/surgeries/check-conflicts - Conflict detection (M1 Day 8)
// ============================================================================

import { pool } from '../config/database.js';
import { assignNursesToSurgery, getNursesBySurgeryId } from '../models/surgeryNurseModel.js';

// ============================================================================
// CREATE SURGERY
// ============================================================================
// @desc    Create a new surgery
// @route   POST /api/surgeries
// @access  Protected (Coordinator, Admin)
// ============================================================================
export const createSurgery = async (req, res) => {
    try {
        const {
            // Patient Information
            patient_id,
            patient_name,
            patient_age,
            patient_gender,
            // Surgery Details
            surgery_type,
            description,
            scheduled_date,
            scheduled_time,
            duration_minutes,
            // Resource Assignment
            theatre_id,
            surgeon_id,
            // Nurse Assignment (M2 Day 9)
            nurse_ids,  // array of nurse IDs (up to 3)
            // Status and Priority
            status = 'scheduled',
            priority = 'routine',
            // Additional
            notes
        } = req.body;

        // Build the INSERT query dynamically
        const insertQuery = `
            INSERT INTO surgeries (
                patient_id,
                patient_name,
                patient_age,
                patient_gender,
                surgery_type,
                description,
                scheduled_date,
                scheduled_time,
                duration_minutes,
                theatre_id,
                surgeon_id,
                status,
                priority,
                notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        const values = [
            patient_id || null,
            patient_name || null,
            patient_age || null,
            patient_gender || null,
            surgery_type,
            description || null,
            scheduled_date,
            scheduled_time,
            duration_minutes,
            theatre_id || null,
            surgeon_id || null,
            status,
            priority,
            notes || null
        ];

        const { rows } = await pool.query(insertQuery, values);
        const newSurgery = rows[0];

        // Assign nurses if nurse_ids provided (M2 Day 9)
        let assignedNurses = [];
        if (nurse_ids && Array.isArray(nurse_ids) && nurse_ids.length > 0) {
            try {
                const validNurseIds = nurse_ids.filter(id => id && !isNaN(id)).map(Number).slice(0, 3);
                if (validNurseIds.length > 0) {
                    await assignNursesToSurgery(newSurgery.id, validNurseIds);
                    assignedNurses = await getNursesBySurgeryId(newSurgery.id);
                }
            } catch (nurseErr) {
                console.error('Warning: Error assigning nurses:', nurseErr.message);
                // Don't fail the entire create — surgery is already created
            }
        }

        res.status(201).json({
            success: true,
            message: 'Surgery created successfully',
            data: {
                ...newSurgery,
                nurses: assignedNurses
            }
        });

    } catch (error) {
        console.error('Error creating surgery:', error);

        // Handle specific PostgreSQL errors
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Surgery conflict - duplicate entry detected'
            });
        }

        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'Invalid reference - theatre or surgeon does not exist'
            });
        }

        if (error.code === '23514') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed - check patient data or enum values'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating surgery',
            error: error.message
        });
    }
};

// ============================================================================
// GET ALL SURGERIES
// ============================================================================
// @desc    Get all surgeries with surgeon details
// @route   GET /api/surgeries
// @access  Protected
// Updated by: M2 (Chandeepa) - Day 5 (Added surgeon JOIN)
// Updated by: M4 (Oneli) - Day 6 (Added date filtering)
// ============================================================================
export const getAllSurgeries = async (req, res) => {
    try {
        // Extract query parameters for filtering
        // Updated by: M3 (Janani) - Day 6 (Added status filter)
        // Updated by: M4 (Oneli) - Day 6 (Added date filtering)
        const { startDate, endDate, status } = req.query;

        // Build dynamic WHERE clause
        let whereConditions = [];
        let queryParams = [];
        let paramCounter = 1;

        if (startDate) {
            whereConditions.push(`s.scheduled_date >= $${paramCounter}`);
            queryParams.push(startDate);
            paramCounter++;
        }

        if (endDate) {
            whereConditions.push(`s.scheduled_date <= $${paramCounter}`);
            queryParams.push(endDate);
            paramCounter++;
        }

        // Status filter - M3 (Janani) Day 6
        const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
        if (status && validStatuses.includes(status)) {
            whereConditions.push(`s.status = $${paramCounter}`);
            queryParams.push(status);
            paramCounter++;
        }

        // Construct the WHERE clause
        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Build the complete query
        const query = `
            SELECT 
                s.*,
                u.name as surgeon_name,
                u.email as surgeon_email
            FROM surgeries s
            LEFT JOIN users u ON s.surgeon_id = u.id
            ${whereClause}
            ORDER BY s.scheduled_date ASC, s.scheduled_time ASC
        `;

        const { rows } = await pool.query(query, queryParams);

        // Transform the flat result into nested structure
        const surgeries = rows.map(row => ({
            id: row.id,
            patient_id: row.patient_id,
            patient_name: row.patient_name,
            patient_age: row.patient_age,
            patient_gender: row.patient_gender,
            surgery_type: row.surgery_type,
            description: row.description,
            scheduled_date: row.scheduled_date,
            scheduled_time: row.scheduled_time,
            duration_minutes: row.duration_minutes,
            theatre_id: row.theatre_id,
            surgeon_id: row.surgeon_id,
            surgeon: row.surgeon_id ? {
                id: row.surgeon_id,
                name: row.surgeon_name,
                email: row.surgeon_email
            } : null,
            status: row.status,
            priority: row.priority,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at
        }));

        res.status(200).json({
            success: true,
            count: surgeries.length,
            data: surgeries,
            filters: {
                startDate: startDate || null,
                endDate: endDate || null,
                status: status || null
            }
        });
    } catch (error) {
        console.error('Error fetching surgeries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching surgeries',
            error: error.message
        });
    }
};

// ============================================================================
// GET SURGERY BY ID
// ============================================================================
// @desc    Get a single surgery by ID with surgeon details
// @route   GET /api/surgeries/:id
// @access  Protected
// Created by: M3 (Janani) - Day 5
// ============================================================================
export const getSurgeryById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID is a positive integer
        if (!id || isNaN(id) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid surgery ID'
            });
        }

        const { rows } = await pool.query(
            `SELECT 
                s.*,
                u.name   AS surgeon_name,
                u.email  AS surgeon_email
             FROM surgeries s
             LEFT JOIN users u ON s.surgeon_id = u.id
             WHERE s.id = $1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Surgery not found'
            });
        }

        const row = rows[0];

        // Transform into a nested structure consistent with getAllSurgeries
        const surgery = {
            id: row.id,
            patient_id: row.patient_id,
            patient_name: row.patient_name,
            patient_age: row.patient_age,
            patient_gender: row.patient_gender,
            surgery_type: row.surgery_type,
            description: row.description,
            scheduled_date: row.scheduled_date,
            scheduled_time: row.scheduled_time,
            duration_minutes: row.duration_minutes,
            theatre_id: row.theatre_id,
            surgeon_id: row.surgeon_id,
            surgeon: row.surgeon_id ? {
                id: row.surgeon_id,
                name: row.surgeon_name,
                email: row.surgeon_email
            } : null,
            status: row.status,
            priority: row.priority,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at
        };

        res.status(200).json({
            success: true,
            data: surgery
        });
    } catch (error) {
        console.error('Error fetching surgery:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching surgery',
            error: error.message
        });
    }
};

// ============================================================================
// DELETE SURGERY
// ============================================================================
// @desc    Delete a surgery by ID
// @route   DELETE /api/surgeries/:id
// @access  Protected (Coordinator, Admin)
// Created by: M2 (Chandeepa) - Day 6
// ============================================================================
export const deleteSurgery = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID is a positive integer
        if (!id || isNaN(id) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid surgery ID'
            });
        }

        // Check if surgery exists before deleting
        const { rows: existing } = await pool.query(
            'SELECT id, surgery_type, status FROM surgeries WHERE id = $1',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Surgery not found'
            });
        }

        const surgery = existing[0];

        // Prevent deletion of in-progress surgeries
        if (surgery.status === 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a surgery that is currently in progress'
            });
        }

        // Delete the surgery
        await pool.query('DELETE FROM surgeries WHERE id = $1', [id]);

        res.status(200).json({
            success: true,
            message: 'Surgery deleted successfully',
            data: {
                id: surgery.id,
                surgery_type: surgery.surgery_type
            }
        });

    } catch (error) {
        console.error('Error deleting surgery:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting surgery',
            error: error.message
        });
    }
};

// ============================================================================
// GET SURGEONS FOR DROPDOWN (M5 Task - Day 5)
// ============================================================================
export const getSurgeonsDropdown = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT id, name, email 
            FROM users 
            WHERE role = 'surgeon' AND is_active = true
            ORDER BY name ASC
        `);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching surgeons:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching surgeons',
            error: error.message
        });
    }
};

// ============================================================================
// GET AVAILABLE SURGEONS (M1 - Day 9)
// ============================================================================
// @desc    Get surgeons with availability status for a given date/time/duration
// @route   GET /api/surgeries/surgeons/available?date=...&time=...&duration=...
// @access  Protected
// Created by: M1 (Pasindu) - Day 9
// ============================================================================
export const getAvailableSurgeons = async (req, res) => {
    try {
        const { date, time, duration, exclude_surgery_id } = req.query;

        // Validate required query params
        if (!date || !time || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Missing required query params: date, time, duration'
            });
        }

        const durationMins = parseInt(duration, 10);
        if (isNaN(durationMins) || durationMins <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be a positive number (minutes)'
            });
        }

        // Build exclusion clause if editing an existing surgery
        const excludeClause = exclude_surgery_id
            ? `AND s.id <> $4`
            : '';
        const conflictParams = exclude_surgery_id
            ? [date, time, durationMins, parseInt(exclude_surgery_id, 10)]
            : [date, time, durationMins];

        // 1. Get all active surgeons from users table
        const { rows: allSurgeons } = await pool.query(`
            SELECT id, name, email
            FROM users
            WHERE role = 'surgeon' AND is_active = true
            ORDER BY name ASC
        `);

        // 2. Find surgeon IDs that have conflicting surgeries at the given time
        const conflictQuery = `
            SELECT DISTINCT s.surgeon_id,
                   json_agg(json_build_object(
                       'surgery_id', s.id,
                       'surgery_type', s.surgery_type,
                       'scheduled_time', s.scheduled_time,
                       'duration_minutes', s.duration_minutes,
                       'patient_name', s.patient_name
                   )) AS conflicting_surgeries
            FROM surgeries s
            WHERE s.surgeon_id IS NOT NULL
              AND s.scheduled_date = $1
              AND s.status IN ('scheduled', 'in_progress')
              ${excludeClause}
              AND (
                  s.scheduled_time < ($2::time + ($3 || ' minutes')::interval)
                  AND (s.scheduled_time + (s.duration_minutes || ' minutes')::interval) > $2::time
              )
            GROUP BY s.surgeon_id
        `;
        const { rows: conflicts } = await pool.query(conflictQuery, conflictParams);

        // Build a map of surgeon_id -> conflict details
        const conflictMap = {};
        conflicts.forEach(c => {
            conflictMap[c.surgeon_id] = {
                conflicting_surgeries: c.conflicting_surgeries
            };
        });

        // 3. Merge availability info into surgeon list
        const surgeonsWithAvailability = allSurgeons.map(surgeon => {
            const conflict = conflictMap[surgeon.id];
            return {
                ...surgeon,
                available: !conflict,
                conflict_reason: conflict
                    ? `Surgeon has ${conflict.conflicting_surgeries.length} conflicting surgery(ies) at this time`
                    : null,
                conflicting_surgeries: conflict ? conflict.conflicting_surgeries : []
            };
        });

        const availableCount = surgeonsWithAvailability.filter(s => s.available).length;

        res.status(200).json({
            success: true,
            count: surgeonsWithAvailability.length,
            available_count: availableCount,
            data: surgeonsWithAvailability
        });
    } catch (error) {
        console.error('Error fetching available surgeons:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available surgeons',
            error: error.message
        });
    }
};

// ============================================================================
// GET AVAILABLE NURSES (M2 - Day 9)
// ============================================================================
// @desc    Get nurses with availability status for a given date/time/duration
// @route   GET /api/surgeries/nurses/available?date=...&time=...&duration=...
// @access  Protected
// Created by: M2 (Chandeepa) - Day 9
// ============================================================================
export const getAvailableNurses = async (req, res) => {
    try {
        const { date, time, duration, exclude_surgery_id } = req.query;

        // Validate required query params
        if (!date || !time || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Missing required query params: date, time, duration'
            });
        }

        const durationMins = parseInt(duration, 10);
        if (isNaN(durationMins) || durationMins <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be a positive number (minutes)'
            });
        }

        // Build exclusion clause if editing an existing surgery
        const excludeClause = exclude_surgery_id
            ? `AND s.id <> $4`
            : '';
        const conflictParams = exclude_surgery_id
            ? [date, time, durationMins, parseInt(exclude_surgery_id, 10)]
            : [date, time, durationMins];

        // 1. Get all active nurses from nurses table
        const { rows: allNurses } = await pool.query(`
            SELECT id, name, email, specialization, phone, shift_preference
            FROM nurses
            WHERE is_active = TRUE
            ORDER BY name ASC
        `);

        // 2. Find nurse IDs that have conflicting surgeries at the given time
        //    A nurse is "busy" if they are assigned (via surgery_nurses table)
        //    to a surgery that overlaps the requested time slot.
        const conflictQuery = `
            SELECT DISTINCT sn.nurse_id,
                   json_agg(json_build_object(
                       'surgery_id', s.id,
                       'surgery_type', s.surgery_type,
                       'scheduled_time', s.scheduled_time,
                       'duration_minutes', s.duration_minutes,
                       'patient_name', s.patient_name
                   )) AS conflicting_surgeries
            FROM surgery_nurses sn
            JOIN surgeries s ON sn.surgery_id = s.id
            WHERE s.scheduled_date = $1
              AND s.status IN ('scheduled', 'in_progress')
              ${excludeClause}
              AND (
                  s.scheduled_time < ($2::time + ($3 || ' minutes')::interval)
                  AND (s.scheduled_time + (s.duration_minutes || ' minutes')::interval) > $2::time
              )
            GROUP BY sn.nurse_id
        `;
        const { rows: conflicts } = await pool.query(conflictQuery, conflictParams);

        // Build a map of nurse_id -> conflict details
        const conflictMap = {};
        conflicts.forEach(c => {
            conflictMap[c.nurse_id] = {
                conflicting_surgeries: c.conflicting_surgeries
            };
        });

        // 3. Merge availability info into nurse list
        const nursesWithAvailability = allNurses.map(nurse => {
            const conflict = conflictMap[nurse.id];
            return {
                ...nurse,
                available: !conflict,
                conflict_reason: conflict
                    ? `Nurse has ${conflict.conflicting_surgeries.length} conflicting surgery(ies) at this time`
                    : null,
                conflicting_surgeries: conflict ? conflict.conflicting_surgeries : []
            };
        });

        const availableCount = nursesWithAvailability.filter(n => n.available).length;

        res.status(200).json({
            success: true,
            count: nursesWithAvailability.length,
            available_count: availableCount,
            max_per_surgery: 3,
            data: nursesWithAvailability
        });
    } catch (error) {
        console.error('Error fetching available nurses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available nurses',
            error: error.message
        });
    }
};

// ============================================================================
// UPDATE SURGERY
// ============================================================================
// @desc    Update an existing surgery
// @route   PUT /api/surgeries/:id
// @access  Protected (Coordinator, Admin)
// Created by: M1 (Pasindu) - Day 6
// ============================================================================
export const updateSurgery = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID is a positive integer
        if (!id || isNaN(id) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid surgery ID'
            });
        }

        // Check if surgery exists
        const existingResult = await pool.query(
            'SELECT * FROM surgeries WHERE id = $1',
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Surgery not found'
            });
        }

        const {
            patient_id,
            patient_name,
            patient_age,
            patient_gender,
            surgery_type,
            description,
            scheduled_date,
            scheduled_time,
            duration_minutes,
            theatre_id,
            surgeon_id,
            status,
            priority,
            notes,
            nurse_ids  // M2 Day 9 - array of nurse IDs
        } = req.body;

        // Build dynamic UPDATE query with only provided fields
        const updates = [];
        const values = [];
        let paramCounter = 1;

        if (patient_id !== undefined) {
            updates.push(`patient_id = $${paramCounter++}`);
            values.push(patient_id || null);
        }
        if (patient_name !== undefined) {
            updates.push(`patient_name = $${paramCounter++}`);
            values.push(patient_name || null);
        }
        if (patient_age !== undefined) {
            updates.push(`patient_age = $${paramCounter++}`);
            values.push(patient_age || null);
        }
        if (patient_gender !== undefined) {
            updates.push(`patient_gender = $${paramCounter++}`);
            values.push(patient_gender || null);
        }
        if (surgery_type !== undefined) {
            updates.push(`surgery_type = $${paramCounter++}`);
            values.push(surgery_type);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCounter++}`);
            values.push(description || null);
        }
        if (scheduled_date !== undefined) {
            updates.push(`scheduled_date = $${paramCounter++}`);
            values.push(scheduled_date);
        }
        if (scheduled_time !== undefined) {
            updates.push(`scheduled_time = $${paramCounter++}`);
            values.push(scheduled_time);
        }
        if (duration_minutes !== undefined) {
            updates.push(`duration_minutes = $${paramCounter++}`);
            values.push(duration_minutes);
        }
        if (theatre_id !== undefined) {
            updates.push(`theatre_id = $${paramCounter++}`);
            values.push(theatre_id || null);
        }
        if (surgeon_id !== undefined) {
            updates.push(`surgeon_id = $${paramCounter++}`);
            values.push(surgeon_id || null);
        }
        if (status !== undefined) {
            updates.push(`status = $${paramCounter++}`);
            values.push(status);
        }
        if (priority !== undefined) {
            updates.push(`priority = $${paramCounter++}`);
            values.push(priority);
        }
        if (notes !== undefined) {
            updates.push(`notes = $${paramCounter++}`);
            values.push(notes || null);
        }

        // Always update the updated_at timestamp
        updates.push(`updated_at = NOW()`);

        if (updates.length === 1) {
            return res.status(400).json({
                success: false,
                message: 'No fields provided to update'
            });
        }

        // Add surgery ID to values
        values.push(id);

        const updateQuery = `
            UPDATE surgeries 
            SET ${updates.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;

        const { rows } = await pool.query(updateQuery, values);
        const updatedSurgery = rows[0];

        // Fetch surgeon details for response
        let surgeonDetails = null;
        if (updatedSurgery.surgeon_id) {
            const surgeonResult = await pool.query(
                'SELECT id, name, email FROM users WHERE id = $1',
                [updatedSurgery.surgeon_id]
            );
            if (surgeonResult.rows.length > 0) {
                surgeonDetails = surgeonResult.rows[0];
            }
        }

        // Update nurse assignments if nurse_ids provided (M2 Day 9)
        let assignedNurses = [];
        if (nurse_ids !== undefined && Array.isArray(nurse_ids)) {
            try {
                const validNurseIds = nurse_ids.filter(nid => nid && !isNaN(nid)).map(Number).slice(0, 3);
                await assignNursesToSurgery(updatedSurgery.id, validNurseIds);
                assignedNurses = await getNursesBySurgeryId(updatedSurgery.id);
            } catch (nurseErr) {
                console.error('Warning: Error updating nurse assignments:', nurseErr.message);
            }
        } else {
            // Fetch existing nurse assignments
            try {
                assignedNurses = await getNursesBySurgeryId(updatedSurgery.id);
            } catch (nurseErr) {
                console.error('Warning: Error fetching nurse assignments:', nurseErr.message);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Surgery updated successfully',
            data: {
                ...updatedSurgery,
                surgeon: surgeonDetails,
                nurses: assignedNurses
            }
        });

    } catch (error) {
        console.error('Error updating surgery:', error);

        // Handle specific PostgreSQL errors
        if (error.code === '23503') {
            return res.status(400).json({
                success: false,
                message: 'Invalid reference - theatre or surgeon does not exist'
            });
        }

        if (error.code === '23514') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed - check enum values (status, priority, gender)'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating surgery',
            error: error.message
        });
    }
};

// ============================================================================
// GET SURGERY CALENDAR EVENTS
// ============================================================================
// @desc    Get surgeries formatted as FullCalendar-compatible events
// @route   GET /api/surgeries/events
// @access  Protected
// Created by: M2 (Chandeepa) - Day 7
//
// Returns surgeries with start/end ISO strings, color coding by
// status & priority, and extendedProps for tooltip/detail rendering.
// Accepts optional query params: startDate, endDate, status
// ============================================================================

// Color maps for status and priority
const STATUS_COLORS = {
    scheduled:   { backgroundColor: '#3B82F6', borderColor: '#2563EB' }, // blue
    in_progress: { backgroundColor: '#F59E0B', borderColor: '#D97706' }, // amber
    completed:   { backgroundColor: '#10B981', borderColor: '#059669' }, // green
    cancelled:   { backgroundColor: '#EF4444', borderColor: '#DC2626' }  // red
};

const PRIORITY_COLORS = {
    emergency: { backgroundColor: '#EF4444', borderColor: '#DC2626' }, // red
    urgent:    { backgroundColor: '#F97316', borderColor: '#EA580C' }, // orange
    routine:   null // use status color
};

export const getCalendarEvents = async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        // Build dynamic WHERE clause
        let whereConditions = [];
        let queryParams = [];
        let paramCounter = 1;

        if (startDate) {
            whereConditions.push(`s.scheduled_date >= $${paramCounter}`);
            queryParams.push(startDate);
            paramCounter++;
        }
        if (endDate) {
            whereConditions.push(`s.scheduled_date <= $${paramCounter}`);
            queryParams.push(endDate);
            paramCounter++;
        }
        const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
        if (status && validStatuses.includes(status)) {
            whereConditions.push(`s.status = $${paramCounter}`);
            queryParams.push(status);
            paramCounter++;
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        const query = `
            SELECT
                s.*,
                u.name AS surgeon_name
            FROM surgeries s
            LEFT JOIN users u ON s.surgeon_id = u.id
            ${whereClause}
            ORDER BY s.scheduled_date ASC, s.scheduled_time ASC
        `;

        const { rows } = await pool.query(query, queryParams);

        // Transform each surgery row into a FullCalendar event object
        const events = rows.map(row => {
            // Build ISO start string
            const dateStr = row.scheduled_date instanceof Date
                ? row.scheduled_date.toISOString().split('T')[0]
                : String(row.scheduled_date).split('T')[0];

            let timeStr = '';
            if (row.scheduled_time) {
                const raw = String(row.scheduled_time);
                timeStr = raw.includes('T')
                    ? raw.split('T')[1].substring(0, 8)
                    : raw.substring(0, 8);
            }

            const start = timeStr ? `${dateStr}T${timeStr}` : dateStr;

            // Calculate end from duration
            let end = null;
            if (row.duration_minutes && timeStr) {
                const startDate = new Date(`${dateStr}T${timeStr}`);
                end = new Date(startDate.getTime() + row.duration_minutes * 60000).toISOString();
            }

            // Determine colors: emergency/urgent override status color
            const priorityColor = PRIORITY_COLORS[row.priority];
            const statusColor = STATUS_COLORS[row.status] || STATUS_COLORS.scheduled;
            const colors = priorityColor || statusColor;

            return {
                id: String(row.id),
                title: row.surgery_type || 'Surgery',
                start,
                end,
                allDay: !timeStr,
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                textColor: '#FFFFFF',
                extendedProps: {
                    surgeryId: row.id,
                    surgeryType: row.surgery_type,
                    patientName: row.patient_name || 'Unknown',
                    surgeonName: row.surgeon_name || 'Unassigned',
                    theatreId: row.theatre_id,
                    theatreName: row.theatre_id
                        ? `Theatre-${String(row.theatre_id).padStart(2, '0')}`
                        : 'No Theatre',
                    status: row.status,
                    priority: row.priority,
                    duration: row.duration_minutes,
                    description: row.description,
                    notes: row.notes
                }
            };
        });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching calendar events',
            error: error.message
        });
    }
};

// ============================================================================
// UPDATE SURGERY STATUS
// ============================================================================
// @desc    Update only the status of a surgery (with transition validation)
// @route   PATCH /api/surgeries/:id/status
// @access  Protected (Coordinator, Admin)
// Created by: M3 (Janani) - Day 6
// ============================================================================

// Valid status transitions map
const VALID_STATUS_TRANSITIONS = {
    scheduled:   ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed:   [],           // terminal state
    cancelled:   ['scheduled'] // allow rescheduling
};

// 
// CHECK CONFLICTS

// @desc    Check for scheduling conflicts (theatre, surgeon, staff) for a
//          proposed surgery time slot. Returns all detected conflicts.
// @route   POST /api/surgeries/check-conflicts
// @access  Protected
// Created by: M1 (Pasindu) - Day 8

export const checkConflicts = async (req, res) => {
    try {
        const {
            scheduled_date,
            scheduled_time,
            duration_minutes,
            theatre_id,
            surgeon_id,
            nurse_ids,        // array of nurse IDs
            anaesthetist_id,
            exclude_surgery_id // optional: exclude this surgery (for edits)
        } = req.body;

        // Validate required params
        if (!scheduled_date || !scheduled_time || !duration_minutes) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: scheduled_date, scheduled_time, duration_minutes'
            });
        }

        const durationMins = parseInt(duration_minutes, 10);
        if (isNaN(durationMins) || durationMins <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Duration must be a positive number (minutes)'
            });
        }

        const conflicts = [];

        // Build exclusion clause if editing an existing surgery
        const excludeClause = exclude_surgery_id
            ? `AND s.id <> ${parseInt(exclude_surgery_id, 10)}`
            : '';

        
        // 1. Theatre Conflict Check
        
        if (theatre_id) {
            const theatreConflictQuery = `
                SELECT s.id, s.surgery_type, s.scheduled_time, s.duration_minutes,
                       s.patient_name
                FROM surgeries s
                WHERE s.theatre_id = $1
                  AND s.scheduled_date = $2
                  AND s.status IN ('scheduled', 'in_progress')
                  ${excludeClause}
                  AND (
                      s.scheduled_time < ($3::time + ($4 || ' minutes')::interval)
                      AND (s.scheduled_time + (s.duration_minutes || ' minutes')::interval) > $3::time
                  )
            `;
            const { rows: theatreConflicts } = await pool.query(theatreConflictQuery, [
                theatre_id,
                scheduled_date,
                scheduled_time,
                durationMins
            ]);

            if (theatreConflicts.length > 0) {
                conflicts.push({
                    type: 'theatre',
                    resource_id: theatre_id,
                    message: `Theatre has ${theatreConflicts.length} conflicting surgery(ies) at this time`,
                    conflicting_surgeries: theatreConflicts.map(c => ({
                        surgery_id: c.id,
                        surgery_type: c.surgery_type,
                        scheduled_time: c.scheduled_time,
                        duration: c.duration_minutes,
                        patient: c.patient_name
                    }))
                });
            }
        }

        // -------------------------------------------------------------------
        // 2. Surgeon Conflict Check
        // -------------------------------------------------------------------
        if (surgeon_id) {
            const surgeonConflictQuery = `
                SELECT s.id, s.surgery_type, s.scheduled_time, s.duration_minutes,
                       s.patient_name, t.name AS theatre_name
                FROM surgeries s
                LEFT JOIN theatres t ON s.theatre_id = t.id
                WHERE s.surgeon_id = $1
                  AND s.scheduled_date = $2
                  AND s.status IN ('scheduled', 'in_progress')
                  ${excludeClause}
                  AND (
                      s.scheduled_time < ($3::time + ($4 || ' minutes')::interval)
                      AND (s.scheduled_time + (s.duration_minutes || ' minutes')::interval) > $3::time
                  )
            `;
            const { rows: surgeonConflicts } = await pool.query(surgeonConflictQuery, [
                surgeon_id,
                scheduled_date,
                scheduled_time,
                durationMins
            ]);

            if (surgeonConflicts.length > 0) {
                // Fetch surgeon name
                const surgeonResult = await pool.query('SELECT name FROM users WHERE id = $1', [surgeon_id]);
                const surgeonName = surgeonResult.rows[0]?.name || 'Unknown Surgeon';

                conflicts.push({
                    type: 'surgeon',
                    resource_id: surgeon_id,
                    resource_name: surgeonName,
                    message: `Surgeon "${surgeonName}" has ${surgeonConflicts.length} conflicting surgery(ies)`,
                    conflicting_surgeries: surgeonConflicts.map(c => ({
                        surgery_id: c.id,
                        surgery_type: c.surgery_type,
                        scheduled_time: c.scheduled_time,
                        duration: c.duration_minutes,
                        patient: c.patient_name,
                        theatre: c.theatre_name
                    }))
                });
            }
        }

        // -------------------------------------------------------------------
        // 3. Anaesthetist Conflict Check (if anaesthetist_id stored in DB)
        // Note: This checks surgeries table if it has anaesthetist_id column.
        //       Currently the schema may not have it, so we do a safe check.
        // -------------------------------------------------------------------
        if (anaesthetist_id) {
            try {
                const anaesConflictQuery = `
                    SELECT s.id, s.surgery_type, s.scheduled_time, s.duration_minutes,
                           s.patient_name
                    FROM surgeries s
                    WHERE s.anaesthetist_id = $1
                      AND s.scheduled_date = $2
                      AND s.status IN ('scheduled', 'in_progress')
                      ${excludeClause}
                      AND (
                          s.scheduled_time < ($3::time + ($4 || ' minutes')::interval)
                          AND (s.scheduled_time + (s.duration_minutes || ' minutes')::interval) > $3::time
                      )
                `;
                const { rows: anaesConflicts } = await pool.query(anaesConflictQuery, [
                    anaesthetist_id,
                    scheduled_date,
                    scheduled_time,
                    durationMins
                ]);

                if (anaesConflicts.length > 0) {
                    conflicts.push({
                        type: 'anaesthetist',
                        resource_id: anaesthetist_id,
                        message: `Anaesthetist has ${anaesConflicts.length} conflicting surgery(ies)`,
                        conflicting_surgeries: anaesConflicts.map(c => ({
                            surgery_id: c.id,
                            surgery_type: c.surgery_type,
                            scheduled_time: c.scheduled_time,
                            duration: c.duration_minutes,
                            patient: c.patient_name
                        }))
                    });
                }
            } catch (err) {
                // Column might not exist yet — skip silently
                console.log('Anaesthetist conflict check skipped (column may not exist)');
            }
        }

        // -------------------------------------------------------------------
        // 4. Nurse Conflict Check (multiple nurses)
        // Note: Assumes surgeries might have nurse assignment in a join table
        //       or column. This is a placeholder for future implementation.
        // -------------------------------------------------------------------
        if (nurse_ids && Array.isArray(nurse_ids) && nurse_ids.length > 0) {
            // M2 Day 9: Check each nurse for scheduling conflicts via surgery_nurses table
            for (const nurseId of nurse_ids) {
                try {
                    const nurseConflictQuery = `
                        SELECT s.id, s.surgery_type, s.scheduled_time, s.duration_minutes,
                               s.patient_name
                        FROM surgery_nurses sn
                        JOIN surgeries s ON sn.surgery_id = s.id
                        WHERE sn.nurse_id = $1
                          AND s.scheduled_date = $2
                          AND s.status IN ('scheduled', 'in_progress')
                          ${excludeClause}
                          AND (
                              s.scheduled_time < ($3::time + ($4 || ' minutes')::interval)
                              AND (s.scheduled_time + (s.duration_minutes || ' minutes')::interval) > $3::time
                          )
                    `;
                    const { rows: nurseConflicts } = await pool.query(nurseConflictQuery, [
                        nurseId,
                        scheduled_date,
                        scheduled_time,
                        durationMins
                    ]);

                    if (nurseConflicts.length > 0) {
                        // Fetch nurse name
                        const nurseResult = await pool.query('SELECT name FROM nurses WHERE id = $1', [nurseId]);
                        const nurseName = nurseResult.rows[0]?.name || 'Unknown Nurse';

                        conflicts.push({
                            type: 'nurse',
                            resource_id: nurseId,
                            resource_name: nurseName,
                            message: `Nurse "${nurseName}" has ${nurseConflicts.length} conflicting surgery(ies)`,
                            conflicting_surgeries: nurseConflicts.map(c => ({
                                surgery_id: c.id,
                                surgery_type: c.surgery_type,
                                scheduled_time: c.scheduled_time,
                                duration: c.duration_minutes,
                                patient: c.patient_name
                            }))
                        });
                    }
                } catch (err) {
                    console.log(`Nurse conflict check for nurse ${nurseId} skipped:`, err.message);
                }
            }
        }

        // -------------------------------------------------------------------
        // Build response
        // -------------------------------------------------------------------
        const hasConflicts = conflicts.length > 0;

        res.status(200).json({
            success: true,
            has_conflicts: hasConflicts,
            conflict_count: conflicts.length,
            conflicts,
            query: {
                scheduled_date,
                scheduled_time,
                duration_minutes: durationMins,
                theatre_id: theatre_id || null,
                surgeon_id: surgeon_id || null,
                anaesthetist_id: anaesthetist_id || null,
                nurse_ids: nurse_ids || []
            }
        });

    } catch (error) {
        console.error('Error checking conflicts:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking scheduling conflicts',
            error: error.message
        });
    }
};

export const updateSurgeryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate ID
        if (!id || isNaN(id) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid surgery ID'
            });
        }

        // Validate status is provided
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        // Validate status is a valid enum value
        const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Fetch current surgery
        const existingResult = await pool.query(
            'SELECT id, status, surgery_type FROM surgeries WHERE id = $1',
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Surgery not found'
            });
        }

        const currentStatus = existingResult.rows[0].status;

        // Same status — no-op
        if (currentStatus === status) {
            return res.status(200).json({
                success: true,
                message: 'Status is already set to ' + status,
                data: existingResult.rows[0]
            });
        }

        // Validate status transition
        const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
        if (!allowedTransitions.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot transition from '${currentStatus}' to '${status}'. Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (terminal state)'}`,
                currentStatus,
                allowedTransitions
            });
        }

        // Perform the status update
        const { rows } = await pool.query(
            `UPDATE surgeries
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        const updatedSurgery = rows[0];

        // Fetch surgeon details for response
        let surgeonDetails = null;
        if (updatedSurgery.surgeon_id) {
            const surgeonResult = await pool.query(
                'SELECT id, name, email FROM users WHERE id = $1',
                [updatedSurgery.surgeon_id]
            );
            if (surgeonResult.rows.length > 0) {
                surgeonDetails = surgeonResult.rows[0];
            }
        }

        res.status(200).json({
            success: true,
            message: `Surgery status updated from '${currentStatus}' to '${status}'`,
            data: {
                ...updatedSurgery,
                surgeon: surgeonDetails
            }
        });

    } catch (error) {
        console.error('Error updating surgery status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating surgery status',
            error: error.message
        });
    }
};
