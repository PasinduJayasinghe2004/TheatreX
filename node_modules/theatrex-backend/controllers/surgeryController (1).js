// ============================================================================
// Surgery Controller
// ============================================================================
// Created by: M1 (Pasindu) - Day 5
// Updated by: M2 (Chandeepa) - Day 6 (Added deleteSurgery)
// Updated by: M3 (Janani) - Day 6 (Added updateSurgeryStatus, status filter)
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
// ============================================================================

import { pool } from '../config/database.js';

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

        res.status(201).json({
            success: true,
            message: 'Surgery created successfully',
            data: newSurgery
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
            notes
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

        res.status(200).json({
            success: true,
            message: 'Surgery updated successfully',
            data: {
                ...updatedSurgery,
                surgeon: surgeonDetails
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
