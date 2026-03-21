// ============================================================================
// Surgery Controller
// ============================================================================
// Created by: M1 (Pasindu) - Day 5
// Updated by: M2 (Chandeepa) - Day 6 (Added deleteSurgery)
// Updated by: M3 (Janani) - Day 6 (Added updateSurgeryStatus, status filter)
// Updated by: M1 (Pasindu) - Day 8 (Added checkConflicts for emergency booking)
// Updated by: M2 (Chandeepa) - Day 9 (Added getAvailableNurses, nurse assignment)
// Updated by: M3 (Janani) - Day 9 (Added getAvailableAnaesthetists, anaesthetist dropdown)
// Updated by: M4 (Oneli) - Day 9 (Added checkStaffConflicts for warning UI)
// Updated by: M3 (Janani) - Day 12 (Added assignSurgeryToTheatre, getUnassignedSurgeries)
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
// - getAvailableAnaesthetists: GET /api/surgeries/anaesthetists/available - Available anaesthetists (M3 Day 9)
// - assignStaff: PATCH /api/surgeries/:id/staff - Unified staff assignment (M5 Day 9)
// - assignSurgeryToTheatre: PATCH /api/surgeries/:id/assign-theatre - Assign surgery to theatre (M3 Day 12)
// - getUnassignedSurgeries: GET /api/surgeries/unassigned - Surgeries without theatre (M3 Day 12)
// - getSurgeryHistory: GET /api/surgeries/history - Completed surgery history (M1 Day 20)
// - getCalendarEvents: GET /api/surgeries/events - FullCalendar events
// - checkConflicts: POST /api/surgeries/check-conflicts - Conflict detection (M1 Day 8)
// - checkStaffConflicts: POST /api/surgeries/check-staff-conflicts - Staff conflict warnings (M4 Day 9)
// ============================================================================

import { pool } from '../config/database.js';
import { assignNursesToSurgery, getNursesBySurgeryId } from '../models/surgeryNurseModel.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = String(value);
    if (/[,"\n\r]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
};

const buildCsvContent = (headers, rows) => {
    const headerLine = headers.join(',');
    const dataLines = rows.map((row) => row.map(escapeCsvValue).join(','));
    return [headerLine, ...dataLines].join('\n');
};

const buildHistoryFilters = (query = {}, includePagination = false) => {
    const { startDate, endDate, surgeonId, theatreId, page = '1', limit = '10' } = query;

    const filters = {
        startDate: startDate || null,
        endDate: endDate || null,
        surgeonId: null,
        theatreId: null,
        page: 1,
        limit: 10
    };

    if (surgeonId !== undefined && surgeonId !== null && surgeonId !== '') {
        const surgeonIdNum = Number(surgeonId);
        if (!Number.isInteger(surgeonIdNum) || surgeonIdNum <= 0) {
            return { error: 'surgeonId must be a positive integer', errorCode: ERROR_CODES.BAD_REQUEST };
        }
        filters.surgeonId = surgeonIdNum;
    }

    if (theatreId !== undefined && theatreId !== null && theatreId !== '') {
        const theatreIdNum = Number(theatreId);
        if (!Number.isInteger(theatreIdNum) || theatreIdNum <= 0) {
            return { error: 'theatreId must be a positive integer', errorCode: ERROR_CODES.BAD_REQUEST };
        }
        filters.theatreId = theatreIdNum;
    }

    if (includePagination) {
        const pageNum = Number(page);
        const limitNum = Number(limit);

        if (!Number.isInteger(pageNum) || pageNum <= 0) {
            return { error: 'page must be a positive integer', errorCode: ERROR_CODES.BAD_REQUEST };
        }

        if (!Number.isInteger(limitNum) || limitNum <= 0 || limitNum > 100) {
            return { error: 'limit must be an integer between 1 and 100', errorCode: ERROR_CODES.BAD_REQUEST };
        }

        filters.page = pageNum;
        filters.limit = limitNum;
    }

    let whereConditions = [`s.status = 'completed'`];
    let queryParams = [];
    let paramCounter = 1;

    if (filters.startDate) {
        whereConditions.push(`s.scheduled_date >= $${paramCounter}`);
        queryParams.push(filters.startDate);
        paramCounter++;
    }

    if (filters.endDate) {
        whereConditions.push(`s.scheduled_date <= $${paramCounter}`);
        queryParams.push(filters.endDate);
        paramCounter++;
    }

    if (filters.surgeonId) {
        whereConditions.push(`s.surgeon_id = $${paramCounter}`);
        queryParams.push(filters.surgeonId);
        paramCounter++;
    }

    if (filters.theatreId) {
        whereConditions.push(`s.theatre_id = $${paramCounter}`);
        queryParams.push(filters.theatreId);
        paramCounter++;
    }

    return {
        filters,
        whereClause: `WHERE ${whereConditions.join(' AND ')}`,
        queryParams,
        paramCounter
    };
};

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
            anaesthetist_id, // M3 Day 9
            // Nurse Assignment (M2 Day 9)
            nurse_ids,  // array of nurse IDs (up to 3)
            // Status and Priority
            status = 'scheduled',
            priority = 'routine',
            progress_percent = 0,
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
                anaesthetist_id,
                status,
                priority,
                progress_percent,
                notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
            anaesthetist_id || null, // M3 Day 9
            status,
            priority,
            progress_percent || 0,
            notes || null
        ];

        const { rows } = await pool.query(insertQuery, values);
        const newSurgery = rows[0];

        // Fetch theatre name for response
        let theatreName = null;
        if (newSurgery.theatre_id) {
            const theatreRes = await pool.query('SELECT name FROM theatres WHERE id = $1', [newSurgery.theatre_id]);
            if (theatreRes.rows.length > 0) theatreName = theatreRes.rows[0].name;
        }

        sendSuccess(res, {
            ...newSurgery,
            theatre_name: theatreName,
            nurses: assignedNurses
        }, 'Surgery created successfully', 201);

    } catch (error) {
        // Handle specific PostgreSQL errors
        if (error.code === '23505') {
            return sendError(res, 'Surgery conflict - duplicate entry detected', 409);
        }

        if (error.code === '23503') {
            return sendError(res, 'Invalid reference - theatre or surgeon does not exist', 400);
        }

        if (error.code === '23514') {
            return sendError(res, 'Validation failed - check patient data or enum values', 400);
        }

        sendError(res, 'Error creating surgery', 500, ERROR_CODES.INTERNAL_SERVER_ERROR, error);
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
        const { startDate, endDate, status, page = '1', limit = '12' } = req.query;

        const pageNum = Number(page);
        const limitNum = Number(limit);

        if (!Number.isInteger(pageNum) || pageNum <= 0) {
            return sendError(res, 'page must be a positive integer', 400, 'BAD_REQUEST');
        }

        if (!Number.isInteger(limitNum) || limitNum <= 0 || limitNum > 100) {
            return sendError(res, 'limit must be an integer between 1 and 100', 400, 'BAD_REQUEST');
        }

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

        const countQuery = `
            SELECT COUNT(*)::int AS total
            FROM surgeries s
            ${whereClause}
        `;

        const { rows: countRows } = await pool.query(countQuery, queryParams);
        const total = countRows[0]?.total || 0;
        const totalPages = total === 0 ? 1 : Math.ceil(total / limitNum);
        const effectivePage = total === 0 ? 1 : Math.min(pageNum, totalPages);
        const offset = (effectivePage - 1) * limitNum;

        const dataQuery = `
            SELECT
                s.*,
                u.name as surgeon_name,
                u.email as surgeon_email,
                t.name as theatre_name
            FROM surgeries s
            LEFT JOIN users u ON s.surgeon_id = u.id
            LEFT JOIN theatres t ON s.theatre_id = t.id
            ${whereClause}
            ORDER BY s.scheduled_date ASC, s.scheduled_time ASC
            LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
        `;

        const dataParams = [...queryParams, limitNum, offset];
        const { rows } = await pool.query(dataQuery, dataParams);

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
            theatre_name: row.theatre_name,
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

        sendSuccess(res, surgeries, 'Surgeries fetched successfully', 200, {
            pagination: {
                page: effectivePage,
                limit: limitNum,
                total,
                totalPages,
                hasNextPage: effectivePage < totalPages,
                hasPrevPage: effectivePage > 1
            }
        });
    } catch (error) {
        sendError(res, 'Error fetching surgeries', 500, 'INTERNAL_SERVER_ERROR', error);
    }
};

// ============================================================================
// GET SURGERY HISTORY (M1 - Day 20)
// ============================================================================
// @desc    Get completed surgeries for history view
// @route   GET /api/surgeries/history
// @access  Protected
// Created by: M1 (Pasindu) - Day 20
// Updated by: M2 (Chandeepa) - Day 20 (Added date range filtering)
// Updated by: M3 (Janani) - Day 20 (Added surgeon filtering)
// Updated by: M4 (Oneli) - Day 20 (Added theatre filtering)
// Updated by: M5 (User) - Day 20 (Added pagination)
// ============================================================================
export const getSurgeryHistory = async (req, res) => {
    try {
        const parsedFilters = buildHistoryFilters(req.query, true);
        if (parsedFilters.error) {
            return sendError(res, parsedFilters.error, 400, parsedFilters.errorCode || ERROR_CODES.BAD_REQUEST);
        }

        const {
            filters: { startDate, endDate, surgeonId, theatreId, page: pageNum, limit: limitNum },
            whereClause,
            queryParams,
            paramCounter
        } = parsedFilters;

        const countQuery = `
            SELECT COUNT(*)::int AS total
            FROM surgeries s
            ${whereClause}
        `;

        const { rows: countRows } = await pool.query(countQuery, queryParams);
        const total = countRows[0]?.total || 0;

        const totalPages = total === 0 ? 1 : Math.ceil(total / limitNum);
        const effectivePage = total === 0 ? 1 : Math.min(pageNum, totalPages);
        const offset = (effectivePage - 1) * limitNum;

        const query = `
            SELECT
                s.id,
                s.patient_name,
                s.surgery_type,
                s.scheduled_date,
                s.scheduled_time,
                s.duration_minutes,
                s.status,
                s.priority,
                s.theatre_id,
                t.name AS theatre_name,
                s.surgeon_id,
                u.name AS surgeon_name,
                s.updated_at
            FROM surgeries s
            LEFT JOIN theatres t ON s.theatre_id = t.id
            LEFT JOIN users u ON s.surgeon_id = u.id
            ${whereClause}
            ORDER BY s.scheduled_date DESC, s.scheduled_time DESC
            LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
        `;

        const dataParams = [...queryParams, limitNum, offset];
        const { rows } = await pool.query(query, dataParams);

        return sendSuccess(res, rows, 'Surgery history fetched successfully', 200, {
            pagination: {
                page: effectivePage,
                limit: limitNum,
                total,
                totalPages,
                hasNextPage: effectivePage < totalPages,
                hasPrevPage: effectivePage > 1
            }
        });
    } catch (error) {
        return sendError(res, 'Error fetching surgery history', 500, 'INTERNAL_SERVER_ERROR', error);
    }
};

// ============================================================================
// EXPORT SURGERY HISTORY AS CSV (M1/M2 - Day 21)
// ============================================================================
// @desc    Export completed surgery history (supports same filters as history API)
// @route   GET /api/surgeries/history/export/csv
// @access  Protected
// ============================================================================
export const exportSurgeryHistoryCsv = async (req, res) => {
    try {
        const parsedFilters = buildHistoryFilters(req.query, false);
        if (parsedFilters.error) {
            return res.status(400).json({
                success: false,
                message: parsedFilters.error
            });
        }

        const {
            whereClause,
            queryParams,
            filters: { startDate, endDate, surgeonId, theatreId }
        } = parsedFilters;

        const query = `
            SELECT
                s.id,
                s.patient_name,
                s.surgery_type,
                s.scheduled_date,
                s.scheduled_time,
                s.duration_minutes,
                s.status,
                s.priority,
                t.name AS theatre_name,
                u.name AS surgeon_name,
                s.updated_at
            FROM surgeries s
            LEFT JOIN theatres t ON s.theatre_id = t.id
            LEFT JOIN users u ON s.surgeon_id = u.id
            ${whereClause}
            ORDER BY s.scheduled_date DESC, s.scheduled_time DESC
        `;

        const { rows } = await pool.query(query, queryParams);

        const csvRows = rows.map((row) => [
            row.id,
            row.patient_name || '',
            row.surgery_type || '',
            row.scheduled_date ? new Date(row.scheduled_date).toISOString().slice(0, 10) : '',
            row.scheduled_time || '',
            row.duration_minutes || '',
            row.status || '',
            row.priority || '',
            row.surgeon_name || '',
            row.theatre_name || '',
            row.updated_at ? new Date(row.updated_at).toISOString() : ''
        ]);

        const csvContent = buildCsvContent(
            [
                'ID',
                'Patient Name',
                'Surgery Type',
                'Scheduled Date',
                'Scheduled Time',
                'Duration (Minutes)',
                'Status',
                'Priority',
                'Surgeon',
                'Theatre',
                'Last Updated At'
            ],
            csvRows
        );

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filterSlug = [startDate || 'all', endDate || 'all', surgeonId || 'all', theatreId || 'all']
            .join('_')
            .replace(/[^a-zA-Z0-9_-]/g, '');
        const fileName = `surgery-history-${filterSlug}-${timestamp}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.status(200).send(`\uFEFF${csvContent}`);
    } catch (error) {
        console.error('Error exporting surgery history CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting surgery history CSV',
            error: error.message
        });
    }
};

// ============================================================================
// EXPORT SINGLE SURGERY DETAIL AS CSV (M3 - Day 21)
// ============================================================================
// @desc    Export a single surgery record as CSV
// @route   GET /api/surgeries/:id/export/csv
// @access  Protected
// ============================================================================
export const exportSurgeryDetailCsv = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid surgery ID'
            });
        }

        const { rows } = await pool.query(
            `SELECT
                s.id,
                s.patient_id,
                s.patient_name,
                s.patient_age,
                s.patient_gender,
                s.surgery_type,
                s.description,
                s.scheduled_date,
                s.scheduled_time,
                s.duration_minutes,
                s.status,
                s.priority,
                s.notes,
                s.created_at,
                s.updated_at,
                t.name AS theatre_name,
                u.name AS surgeon_name,
                a.name AS anaesthetist_name
             FROM surgeries s
             LEFT JOIN theatres t ON s.theatre_id = t.id
             LEFT JOIN users u ON s.surgeon_id = u.id
             LEFT JOIN anaesthetists a ON s.anaesthetist_id = a.id
             WHERE s.id = $1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Surgery not found'
            });
        }

        const surgery = rows[0];
        const nurses = await getNursesBySurgeryId(surgery.id);
        const nurseNames = (nurses || []).map((n) => n.name).filter(Boolean).join('; ');

        const csvContent = buildCsvContent(
            ['Field', 'Value'],
            [
                ['ID', surgery.id],
                ['Patient ID', surgery.patient_id || ''],
                ['Patient Name', surgery.patient_name || ''],
                ['Patient Age', surgery.patient_age || ''],
                ['Patient Gender', surgery.patient_gender || ''],
                ['Surgery Type', surgery.surgery_type || ''],
                ['Description', surgery.description || ''],
                ['Scheduled Date', surgery.scheduled_date ? new Date(surgery.scheduled_date).toISOString().slice(0, 10) : ''],
                ['Scheduled Time', surgery.scheduled_time || ''],
                ['Duration (Minutes)', surgery.duration_minutes || ''],
                ['Status', surgery.status || ''],
                ['Priority', surgery.priority || ''],
                ['Surgeon', surgery.surgeon_name || ''],
                ['Anaesthetist', surgery.anaesthetist_name || ''],
                ['Nurses', nurseNames],
                ['Theatre', surgery.theatre_name || ''],
                ['Notes', surgery.notes || ''],
                ['Created At', surgery.created_at ? new Date(surgery.created_at).toISOString() : ''],
                ['Updated At', surgery.updated_at ? new Date(surgery.updated_at).toISOString() : '']
            ]
        );

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `surgery-${surgery.id}-detail-${timestamp}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.status(200).send(`\uFEFF${csvContent}`);
    } catch (error) {
        console.error('Error exporting surgery detail CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting surgery detail CSV',
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
                u.email  AS surgeon_email,
                t.name   AS theatre_name
             FROM surgeries s
             LEFT JOIN users u ON s.surgeon_id = u.id
             LEFT JOIN theatres t ON s.theatre_id = t.id
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
            theatre_name: row.theatre_name,
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

        return sendSuccess(res, rows, 'Surgeons fetched successfully', 200);
    } catch (error) {
        return sendError(res, 'Error fetching surgeons', 500, 'INTERNAL_SERVER_ERROR', error);
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

        sendSuccess(res, {
            count: surgeonsWithAvailability.length,
            available_count: availableCount,
            data: surgeonsWithAvailability
        }, 'Available surgeons fetched successfully', 200);
    } catch (error) {
        console.error('Error fetching available surgeons:', error);
        sendError(res, 'Error fetching available surgeons', 500, ERROR_CODES.INTERNAL_SERVER_ERROR, error);
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
            SELECT sn.nurse_id,
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

        sendSuccess(res, {
            count: nursesWithAvailability.length,
            available_count: availableCount,
            max_per_surgery: 3,
            data: nursesWithAvailability
        }, 'Available nurses fetched successfully', 200);
    } catch (error) {
        console.error('Error fetching available nurses:', error);
        sendError(res, 'Error fetching available nurses', 500, ERROR_CODES.INTERNAL_SERVER_ERROR, error);
    }
};

// ============================================================================
// GET AVAILABLE ANAESTHETISTS (M3 - Day 9)
// ============================================================================
// @desc    Get anaesthetists with availability status for a given date/time/duration
// @route   GET /api/surgeries/anaesthetists/available?date=...&time=...&duration=...
// @access  Protected
// Created by: M3 (Janani) - Day 9
// ============================================================================
export const getAvailableAnaesthetists = async (req, res) => {
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

        // 1. Get all active & available anaesthetists from anaesthetists table
        const { rows: allAnaesthetists } = await pool.query(`
            SELECT id, name, email, specialization, phone, shift_preference,
                   years_of_experience, qualification
            FROM anaesthetists
            WHERE is_active = TRUE
            ORDER BY name ASC
        `);

        // 2. Find anaesthetist IDs that have conflicting surgeries at the given time
        //    An anaesthetist is "busy" if they are assigned (via surgeries.anaesthetist_id)
        //    to a surgery that overlaps the requested time slot.
        const conflictQuery = `
            SELECT s.anaesthetist_id,
                   json_agg(json_build_object(
                       'surgery_id', s.id,
                       'surgery_type', s.surgery_type,
                       'scheduled_time', s.scheduled_time,
                       'duration_minutes', s.duration_minutes,
                       'patient_name', s.patient_name
                   )) AS conflicting_surgeries
            FROM surgeries s
            WHERE s.anaesthetist_id IS NOT NULL
              AND s.scheduled_date = $1
              AND s.status IN ('scheduled', 'in_progress')
              ${excludeClause}
              AND (
                  s.scheduled_time < ($2::time + ($3 || ' minutes')::interval)
                  AND (s.scheduled_time + (s.duration_minutes || ' minutes')::interval) > $2::time
              )
            GROUP BY s.anaesthetist_id
        `;
        const { rows: conflicts } = await pool.query(conflictQuery, conflictParams);

        // Build a map of anaesthetist_id -> conflict details
        const conflictMap = {};
        conflicts.forEach(c => {
            conflictMap[c.anaesthetist_id] = {
                conflicting_surgeries: c.conflicting_surgeries
            };
        });

        // 3. Merge availability info into anaesthetist list
        const anaesthetistsWithAvailability = allAnaesthetists.map(anaes => {
            const conflict = conflictMap[anaes.id];
            return {
                ...anaes,
                available: !conflict,
                conflict_reason: conflict
                    ? `Anaesthetist has ${conflict.conflicting_surgeries.length} conflicting surgery(ies) at this time`
                    : null,
                conflicting_surgeries: conflict ? conflict.conflicting_surgeries : []
            };
        });

        const availableCount = anaesthetistsWithAvailability.filter(a => a.available).length;

        res.status(200).json({
            success: true,
            count: anaesthetistsWithAvailability.length,
            available_count: availableCount,
            data: anaesthetistsWithAvailability
        });
    } catch (error) {
        console.error('Error fetching available anaesthetists:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available anaesthetists',
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
            anaesthetist_id, // M3 Day 9
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
        if (anaesthetist_id !== undefined) {
            updates.push(`anaesthetist_id = $${paramCounter++}`);
            values.push(anaesthetist_id || null);
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

        // Fetch anaesthetist details for response (M3 Day 9)
        let anaesthetistDetails = null;
        if (updatedSurgery.anaesthetist_id) {
            try {
                const anaesResult = await pool.query(
                    'SELECT id, name, email, specialization FROM anaesthetists WHERE id = $1',
                    [updatedSurgery.anaesthetist_id]
                );
                if (anaesResult.rows.length > 0) {
                    anaesthetistDetails = anaesResult.rows[0];
                }
            } catch (err) {
                console.log('Warning: Error fetching anaesthetist details:', err.message);
            }
        }

        // Fetch theatre name for response
        let theatreName = null;
        if (updatedSurgery.theatre_id) {
            try {
                const theatreResult = await pool.query(
                    'SELECT name FROM theatres WHERE id = $1',
                    [updatedSurgery.theatre_id]
                );
                if (theatreResult.rows.length > 0) {
                    theatreName = theatreResult.rows[0].name;
                }
            } catch (err) {
                console.log('Warning: Error fetching theatre name:', err.message);
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
                theatre_name: theatreName,
                surgeon: surgeonDetails,
                anaesthetist: anaesthetistDetails,
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
// UPDATE SURGERY STATUS
// ============================================================================
// @desc    Update only the status of a surgery (with transition validation)
// @route   PATCH /api/surgeries/:id/status
// @access  Protected (Coordinator, Admin)
// Created by: M3 (Janani) - Day 6
// ============================================================================

// Valid status transitions map
const VALID_STATUS_TRANSITIONS = {
    scheduled: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],           // terminal state
    cancelled: ['scheduled'] // allow rescheduling
};

export const updateSurgeryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id || isNaN(id) || Number(id) <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid surgery ID' });
        }
        if (!status) {
            return res.status(400).json({ success: false, message: 'New status is required' });
        }

        const { rows: existingSurgery } = await pool.query(
            'SELECT id, status FROM surgeries WHERE id = $1',
            [id]
        );

        if (existingSurgery.length === 0) {
            return res.status(404).json({ success: false, message: 'Surgery not found' });
        }

        const currentStatus = existingSurgery[0].status;

        // Validate status transition
        const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
        if (!allowedTransitions || !allowedTransitions.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed transitions: ${allowedTransitions.join(', ')}`
            });
        }

        const { rows } = await pool.query(
            'UPDATE surgeries SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );

        res.status(200).json({
            success: true,
            message: `Surgery status updated from '${currentStatus}' to '${status}'`,
            data: rows[0]
        });

    } catch (error) {
        console.error('Error updating surgery status:', error);
        if (error.code === '23514') { // Check constraint violation (e.g., invalid enum value)
            return res.status(400).json({
                success: false,
                message: 'Invalid status value provided',
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating surgery status',
            error: error.message
        });
    }
};

// ============================================================================
// ASSIGN STAFF (M5 - Day 9)
// ============================================================================
// @desc    Assign or reassign surgeon, anaesthetist, and nurses to a surgery
// @route   PATCH /api/surgeries/:id/staff
// @access  Protected (Coordinator, Admin)
export const assignStaff = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { surgeon_id, anaesthetist_id, nurse_ids } = req.body;

        // Validate ID
        if (!id || isNaN(id) || Number(id) <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid surgery ID' });
        }

        // Check if surgery exists
        const existingSurgeryResult = await client.query(
            'SELECT id FROM surgeries WHERE id = $1',
            [id]
        );
        if (existingSurgeryResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Surgery not found' });
        }

        await client.query('BEGIN');

        const updates = [];
        const values = [];
        let paramCounter = 1;

        if (surgeon_id !== undefined) {
            updates.push(`surgeon_id = $${paramCounter++}`);
            values.push(surgeon_id || null);
        }
        if (anaesthetist_id !== undefined) {
            updates.push(`anaesthetist_id = $${paramCounter++}`);
            values.push(anaesthetist_id || null);
        }

        // Only update if there are fields to update in the surgeries table
        let updatedSurgery;
        if (updates.length > 0) {
            updates.push(`updated_at = NOW()`);
            values.push(id); // Add surgery ID for WHERE clause

            const updateQuery = `
                UPDATE surgeries
                SET ${updates.join(', ')}
                WHERE id = $${paramCounter}
                RETURNING *
            `;
            const { rows } = await client.query(updateQuery, values);
            updatedSurgery = rows[0];
        } else {
            // If no direct surgery fields updated, fetch the existing one
            const { rows } = await client.query('SELECT * FROM surgeries WHERE id = $1', [id]);
            updatedSurgery = rows[0];
        }

        // Handle nurse assignments (M2 Day 9)
        let assignedNurses = [];
        if (nurse_ids !== undefined && Array.isArray(nurse_ids)) {
            const validNurseIds = nurse_ids.filter(nid => nid && !isNaN(nid)).map(Number).slice(0, 3);
            await assignNursesToSurgery(updatedSurgery.id, validNurseIds, client); // Pass client for transaction
            assignedNurses = await getNursesBySurgeryId(updatedSurgery.id, client); // Pass client for transaction
        } else {
            // Fetch existing nurse assignments if not provided in the request
            assignedNurses = await getNursesBySurgeryId(updatedSurgery.id, client);
        }

        await client.query('COMMIT');

        // Fetch surgeon and anaesthetist details for the response
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

        let anaesthetistDetails = null;
        if (updatedSurgery.anaesthetist_id) {
            const anaesResult = await pool.query(
                'SELECT id, name, email FROM anaesthetists WHERE id = $1',
                [updatedSurgery.anaesthetist_id]
            );
            if (anaesResult.rows.length > 0) {
                anaesthetistDetails = anaesResult.rows[0];
            }
        }

        let theatreName = null;
        if (updatedSurgery.theatre_id) {
            const theatreResult = await pool.query(
                'SELECT name FROM theatres WHERE id = $1',
                [updatedSurgery.theatre_id]
            );
            if (theatreResult.rows.length > 0) {
                theatreName = theatreResult.rows[0].name;
            }
        }

        res.status(200).json({
            success: true,
            message: 'Staff assigned successfully',
            data: {
                ...updatedSurgery,
                theatre_name: theatreName,
                surgeon: surgeonDetails,
                anaesthetist: anaesthetistDetails,
                nurses: assignedNurses
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error assigning staff to surgery:', error);

        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({
                success: false,
                message: 'Invalid staff ID provided (surgeon, anaesthetist, or nurse does not exist)',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error assigning staff to surgery',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// ============================================================================
// ASSIGN SURGERY TO THEATRE (M3 - Day 12)
// ============================================================================
// @desc    Assign (or reassign) a surgery to a specific theatre.
//          Validates that both surgery and theatre exist, the theatre is
//          active and not under maintenance, and checks for time-slot
//          conflicts with other surgeries already in that theatre.
// @route   PATCH /api/surgeries/:id/assign-theatre
// @access  Protected (coordinator, admin)
// Created by: M3 (Janani) - Day 12
// ============================================================================
export const assignSurgeryToTheatre = async (req, res) => {
    try {
        const { id } = req.params;
        const { theatre_id } = req.body;

        // ── Validate inputs ───────────────────────────────────────────────
        if (!id || isNaN(id) || Number(id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid surgery ID'
            });
        }

        if (!theatre_id || isNaN(theatre_id) || Number(theatre_id) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'theatre_id is required and must be a positive integer'
            });
        }

        const theatreIdNum = Number(theatre_id);
        const surgeryIdNum = Number(id);

        // ── Verify surgery exists and fetch scheduling details ────────────
        const { rows: surgeryRows } = await pool.query(
            `SELECT id, surgery_type, patient_name, scheduled_date, scheduled_time,
                    duration_minutes, theatre_id, status
             FROM surgeries WHERE id = $1`,
            [surgeryIdNum]
        );

        if (surgeryRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Surgery not found'
            });
        }

        const surgery = surgeryRows[0];

        // Cannot reassign a completed or cancelled surgery
        if (surgery.status === 'completed' || surgery.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: `Cannot assign a theatre to a surgery with status '${surgery.status}'`
            });
        }

        // ── Verify theatre exists and is active ───────────────────────────
        const { rows: theatreRows } = await pool.query(
            `SELECT id, name, status, is_active, theatre_type
             FROM theatres WHERE id = $1`,
            [theatreIdNum]
        );

        if (theatreRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Theatre not found'
            });
        }

        const theatre = theatreRows[0];

        if (!theatre.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Cannot assign surgery to an inactive theatre'
            });
        }

        if (theatre.status === 'maintenance') {
            return res.status(400).json({
                success: false,
                message: `Theatre '${theatre.name}' is currently under maintenance`
            });
        }

        // ── Already assigned to this theatre? (no-op guard) ───────────────
        if (surgery.theatre_id === theatreIdNum) {
            return res.status(200).json({
                success: true,
                message: 'Surgery is already assigned to this theatre',
                data: { surgery_id: surgeryIdNum, theatre_id: theatreIdNum, theatre_name: theatre.name }
            });
        }

        // ── Conflict detection: overlapping surgeries in target theatre ───
        if (surgery.scheduled_date && surgery.scheduled_time && surgery.duration_minutes) {
            const { rows: conflicts } = await pool.query(`
                SELECT id, surgery_type, patient_name, scheduled_time, duration_minutes
                FROM surgeries
                WHERE theatre_id = $1
                  AND scheduled_date = $2
                  AND status IN ('scheduled', 'in_progress')
                  AND id <> $3
                  AND (
                      scheduled_time < ($4::time + ($5 || ' minutes')::interval)
                      AND (scheduled_time + (duration_minutes || ' minutes')::interval) > $4::time
                  )
            `, [theatreIdNum, surgery.scheduled_date, surgeryIdNum, surgery.scheduled_time, surgery.duration_minutes]);

            if (conflicts.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: `Theatre '${theatre.name}' has a conflicting surgery at this time`,
                    conflicts: conflicts.map(c => ({
                        surgery_id: c.id,
                        surgery_type: c.surgery_type,
                        patient_name: c.patient_name,
                        scheduled_time: c.scheduled_time,
                        duration_minutes: c.duration_minutes
                    }))
                });
            }
        }

        // ── Perform the assignment ────────────────────────────────────────
        const { rows: updated } = await pool.query(`
            UPDATE surgeries
            SET theatre_id = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `, [theatreIdNum, surgeryIdNum]);

        res.status(200).json({
            success: true,
            message: `Surgery assigned to theatre '${theatre.name}' successfully`,
            data: {
                ...updated[0],
                theatre_name: theatre.name,
                theatre_type: theatre.theatre_type
            }
        });
    } catch (error) {
        console.error('Error assigning surgery to theatre:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning surgery to theatre',
            error: error.message
        });
    }
};

// ============================================================================
// GET UNASSIGNED SURGERIES (M3 - Day 12)
// ============================================================================
// @desc    Get surgeries that do not have a theatre assigned yet.
//          Supports optional date range + status filters.
//          Useful for the coordinator assignment dropdown.
// @route   GET /api/surgeries/unassigned
// @access  Protected
// Created by: M3 (Janani) - Day 12
// ============================================================================
export const getUnassignedSurgeries = async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        const conditions = ['s.theatre_id IS NULL'];
        const params = [];
        let p = 1;

        // By default, only show scheduled / in_progress (not completed/cancelled)
        const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
        if (status && validStatuses.includes(status)) {
            conditions.push(`s.status = $${p++}`);
            params.push(status);
        } else {
            conditions.push(`s.status IN ('scheduled', 'in_progress')`);
        }

        if (startDate) {
            conditions.push(`s.scheduled_date >= $${p++}`);
            params.push(startDate);
        }
        if (endDate) {
            conditions.push(`s.scheduled_date <= $${p++}`);
            params.push(endDate);
        }

        const whereClause = conditions.join(' AND ');

        const { rows } = await pool.query(`
            SELECT
                s.id,
                s.patient_name,
                s.surgery_type,
                s.scheduled_date,
                s.scheduled_time,
                s.duration_minutes,
                s.status,
                s.priority,
                u.name AS surgeon_name
            FROM surgeries s
            LEFT JOIN users u ON s.surgeon_id = u.id
            WHERE ${whereClause}
            ORDER BY s.priority = 'emergency' DESC,
                     s.priority = 'urgent' DESC,
                     s.scheduled_date ASC,
                     s.scheduled_time ASC
        `, params);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching unassigned surgeries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unassigned surgeries',
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
    scheduled: { backgroundColor: '#3B82F6', borderColor: '#2563EB' }, // blue
    in_progress: { backgroundColor: '#F59E0B', borderColor: '#D97706' }, // amber
    completed: { backgroundColor: '#10B981', borderColor: '#059669' }, // green
    cancelled: { backgroundColor: '#EF4444', borderColor: '#DC2626' }  // red
};

const PRIORITY_COLORS = {
    emergency: { backgroundColor: '#EF4444', borderColor: '#DC2626' }, // red
    urgent: { backgroundColor: '#F97316', borderColor: '#EA580C' }, // orange
    routine: null // use status color
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
        // -------------------------------------------------------------------
        // 3. Anaesthetist Conflict Check
        // -------------------------------------------------------------------
        if (anaesthetist_id) {
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
                // Fetch anaesthetist name
                const anaesResult = await pool.query('SELECT name FROM users WHERE id = $1', [anaesthetist_id]);
                const anaesName = anaesResult.rows[0]?.name || 'Unknown Anaesthetist';

                conflicts.push({
                    type: 'anaesthetist',
                    resource_id: anaesthetist_id,
                    resource_name: anaesName,
                    message: `Anaesthetist "${anaesName}" has ${anaesConflicts.length} conflicting surgery(ies)`,
                    conflicting_surgeries: anaesConflicts.map(c => ({
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
        // 4. Nurse Conflict Check (single nurse column for now based on schema)
        // -------------------------------------------------------------------
        if (req.body.nurse_id) {
            const nurse_id = req.body.nurse_id;
            const nurseConflictQuery = `
                SELECT s.id, s.surgery_type, s.scheduled_time, s.duration_minutes,
                       s.patient_name
                FROM surgeries s
                WHERE s.nurse_id = $1
                  AND s.scheduled_date = $2
                  AND s.status IN ('scheduled', 'in_progress')
                  ${excludeClause}
                  AND (
                      s.scheduled_time < ($3::time + ($4 || ' minutes')::interval)
                      AND (s.scheduled_time + (s.duration_minutes || ' minutes')::interval) > $3::time
                  )
            `;
            const { rows: nurseConflicts } = await pool.query(nurseConflictQuery, [
                nurse_id,
                scheduled_date,
                scheduled_time,
                durationMins
            ]);

            if (nurseConflicts.length > 0) {
                // Fetch nurse name
                const nurseResult = await pool.query('SELECT name FROM users WHERE id = $1', [nurse_id]);
                const nurseName = nurseResult.rows[0]?.name || 'Unknown Nurse';

                conflicts.push({
                    type: 'nurse',
                    resource_id: nurse_id,
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
        }

        // Multi-nurse support (placeholder for future array implementation)
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
                nurse_id: req.body.nurse_id || null
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

// ============================================================================
// CHECK STAFF CONFLICTS
// ============================================================================
// @desc    Check for staff-specific scheduling conflicts and return warnings
//          Specifically designed for UI warning display during staff assignment
// @route   POST /api/surgeries/check-staff-conflicts
// @access  Protected
// Created by: M4 (Oneli) - Day 9
// ============================================================================
export const checkStaffConflicts = async (req, res) => {
    try {
        const {
            scheduled_date,
            scheduled_time,
            duration_minutes,
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

        const warnings = [];

        // Build exclusion clause if editing an existing surgery
        const excludeClause = exclude_surgery_id
            ? `AND s.id <> ${parseInt(exclude_surgery_id, 10)}`
            : '';

        // -------------------------------------------------------------------
        // 1. Surgeon Conflict Check
        // -------------------------------------------------------------------
        if (surgeon_id) {
            const surgeonConflictQuery = `
                SELECT s.id, s.surgery_type, s.scheduled_time, s.duration_minutes,
                       s.patient_name, t.name AS theatre_name, s.priority
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

                warnings.push({
                    type: 'surgeon',
                    severity: 'error',
                    staff_id: parseInt(surgeon_id),
                    staff_name: surgeonName,
                    staff_role: 'Surgeon',
                    message: `${surgeonName} is already assigned to another surgery at this time`,
                    conflicting_surgeries: surgeonConflicts.map(c => ({
                        surgery_id: c.id,
                        surgery_type: c.surgery_type,
                        scheduled_time: c.scheduled_time,
                        duration: c.duration_minutes,
                        patient: c.patient_name,
                        theatre: c.theatre_name,
                        priority: c.priority
                    }))
                });
            }
        }

        // -------------------------------------------------------------------
        // 2. Anaesthetist Conflict Check
        // -------------------------------------------------------------------
        if (anaesthetist_id) {
            try {
                const anaesConflictQuery = `
                    SELECT s.id, s.surgery_type, s.scheduled_time, s.duration_minutes,
                           s.patient_name, t.name AS theatre_name, s.priority
                    FROM surgeries s
                    LEFT JOIN theatres t ON s.theatre_id = t.id
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
                    // Fetch anaesthetist name
                    const anaesResult = await pool.query('SELECT name FROM anaesthetists WHERE id = $1', [anaesthetist_id]);
                    const anaesName = anaesResult.rows[0]?.name || 'Unknown Anaesthetist';

                    warnings.push({
                        type: 'anaesthetist',
                        severity: 'error',
                        staff_id: parseInt(anaesthetist_id),
                        staff_name: anaesName,
                        staff_role: 'Anaesthetist',
                        message: `${anaesName} is already assigned to another surgery at this time`,
                        conflicting_surgeries: anaesConflicts.map(c => ({
                            surgery_id: c.id,
                            surgery_type: c.surgery_type,
                            scheduled_time: c.scheduled_time,
                            duration: c.duration_minutes,
                            patient: c.patient_name,
                            theatre: c.theatre_name,
                            priority: c.priority
                        }))
                    });
                }
            } catch (err) {
                // Column might not exist yet — skip silently
                console.log('Anaesthetist conflict check skipped (column may not exist):', err.message);
            }
        }

        // -------------------------------------------------------------------
        // 3. Nurse Conflict Check (multiple nurses)
        // -------------------------------------------------------------------
        if (nurse_ids && Array.isArray(nurse_ids) && nurse_ids.length > 0) {
            for (const nurseId of nurse_ids) {
                try {
                    const nurseConflictQuery = `
                        SELECT s.id, s.surgery_type, s.scheduled_time, s.duration_minutes,
                               s.patient_name, t.name AS theatre_name, s.priority
                        FROM surgery_nurses sn
                        JOIN surgeries s ON sn.surgery_id = s.id
                        LEFT JOIN theatres t ON s.theatre_id = t.id
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

                        warnings.push({
                            type: 'nurse',
                            severity: 'warning',
                            staff_id: parseInt(nurseId),
                            staff_name: nurseName,
                            staff_role: 'Nurse',
                            message: `${nurseName} is already assigned to another surgery at this time`,
                            conflicting_surgeries: nurseConflicts.map(c => ({
                                surgery_id: c.id,
                                surgery_type: c.surgery_type,
                                scheduled_time: c.scheduled_time,
                                duration: c.duration_minutes,
                                patient: c.patient_name,
                                theatre: c.theatre_name,
                                priority: c.priority
                            }))
                        });
                    }
                } catch (err) {
                    console.log(`Nurse conflict check for nurse ${nurseId} skipped:`, err.message);
                }
            }
        }

        // -------------------------------------------------------------------
        // Build response with warnings summary
        // -------------------------------------------------------------------
        const hasWarnings = warnings.length > 0;
        const errorCount = warnings.filter(w => w.severity === 'error').length;
        const warningCount = warnings.filter(w => w.severity === 'warning').length;

        res.status(200).json({
            success: true,
            has_conflicts: hasWarnings,
            summary: {
                total: warnings.length,
                errors: errorCount,
                warnings: warningCount
            },
            warnings,
            query: {
                scheduled_date,
                scheduled_time,
                duration_minutes: durationMins,
                surgeon_id: surgeon_id || null,
                anaesthetist_id: anaesthetist_id || null,
                nurse_ids: nurse_ids || []
            }
        });

    } catch (error) {
        console.error('Error checking staff conflicts:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking staff scheduling conflicts',
            error: error.message
        });
    }
};
