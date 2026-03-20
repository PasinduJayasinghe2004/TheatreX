// ============================================================================
// Nurse Controller
// ============================================================================
// Created by: M3 (Janani) - Day 13
// Updated by: M2 (Chandeepa) - Day 14 (added updateNurse, deleteNurse)
//
// Handles all nurse-related HTTP requests and business logic.
//
// EXPORTS:
// - createNurse:   POST   /api/nurses      - Create a new nurse (Coordinator/Admin)
// - getAllNurses:  GET    /api/nurses      - List all active nurses (Protected)
// - getNurseById: GET    /api/nurses/:id  - Get a single nurse by ID (Protected)
// - updateNurse:  PUT    /api/nurses/:id  - Update a nurse (Coordinator/Admin)
// - deleteNurse:  DELETE /api/nurses/:id  - Soft-delete a nurse (Coordinator/Admin)
// ============================================================================

import { pool } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// ============================================================================
// CREATE NURSE
// ============================================================================
// @desc    Create a new nurse record
// @route   POST /api/nurses
// @access  Protected (coordinator, admin)
// Created by: M3 (Janani) - Day 13
// ============================================================================
export const createNurse = async (req, res, next) => {
    try {
        const {
            name,
            specialization,
            license_number,
            years_of_experience,
            phone,
            email,
            is_available = true,
            shift_preference = 'flexible',
        } = req.body;

        const profile_picture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

        // ── 5. Insert into nurses table ───────────────────────────────────────
        const insertQuery = `
            INSERT INTO nurses (
                name,
                specialization,
                license_number,
                years_of_experience,
                phone,
                email,
                is_available,
                shift_preference,
                is_active,
                profile_picture
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, $9)
            RETURNING *
        `;

        const values = [
            name.trim(),
            specialization.trim(),
            license_number.trim(),
            years_of_experience ? parseInt(years_of_experience, 10) : null,
            phone.trim(),
            email.trim().toLowerCase(),
            is_available,
            shift_preference || 'flexible',
            profile_picture
        ];

        const { rows } = await pool.query(insertQuery, values);
        const newNurse = rows[0];

        sendSuccess(res, newNurse, 'Nurse created successfully', 201);

    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'A nurse with this email or licence number already exists', 409, ERROR_CODES.CONFLICT);
        }
        next(error);
    }
};



// ============================================================================
// GET ALL NURSES
// ============================================================================
// @desc    Get all active nurses, with optional ?search= and ?available= filters
// @route   GET /api/nurses
// @access  Protected
// Created by: M3 (Janani) - Day 13
// ============================================================================
export const getAllNurses = async (req, res) => {
    try {
        const { search, available, shift } = req.query;

        // Build dynamic WHERE clause
        const conditions = ['n.is_active = TRUE'];
        const params = [];
        let paramIdx = 1;

        // Full-text search on name, specialization, or email
        if (search && search.trim()) {
            conditions.push(
                `(n.name ILIKE $${paramIdx} OR n.specialization ILIKE $${paramIdx} OR n.email ILIKE $${paramIdx})`
            );
            params.push(`%${search.trim()}%`);
            paramIdx++;
        }

        // Filter by availability flag
        if (available === 'true') {
            conditions.push(`n.is_available = TRUE`);
        } else if (available === 'false') {
            conditions.push(`n.is_available = FALSE`);
        }

        // Filter by shift preference
        if (shift && ['morning', 'afternoon', 'night', 'flexible'].includes(shift)) {
            conditions.push(`n.shift_preference = $${paramIdx}`);
            params.push(shift);
            paramIdx++;
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`;

        // Count of surgeries each nurse is currently assigned to (scheduled/in_progress)
        const query = `
            SELECT
                n.*,
                COUNT(DISTINCT sn.surgery_id) FILTER (
                    WHERE sg.status IN ('scheduled', 'in_progress')
                ) AS active_surgery_count
            FROM nurses n
            LEFT JOIN surgery_nurses sn ON sn.nurse_id = n.id
            LEFT JOIN surgeries sg ON sg.id = sn.surgery_id
            ${whereClause}
            GROUP BY n.id
            ORDER BY n.name ASC
        `;

        const { rows } = await pool.query(query, params);

        sendSuccess(res, rows, 'Nurses fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// GET NURSE BY ID
// ============================================================================
// @desc    Get a single nurse by ID (active only)
// @route   GET /api/nurses/:id
// @access  Protected
// Created by: M3 (Janani) - Day 13
// ============================================================================
export const getNurseById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const nurseId = parseInt(id, 10);
        if (isNaN(nurseId) || nurseId <= 0) {
            return sendError(res, 'Invalid nurse ID. Must be a positive integer.', 400, ERROR_CODES.BAD_REQUEST);
        }

        const query = `
            SELECT
                n.*,
                COUNT(DISTINCT sn.surgery_id) FILTER (
                    WHERE sg.status IN ('scheduled', 'in_progress')
                ) AS active_surgery_count
            FROM nurses n
            LEFT JOIN surgery_nurses sn ON sn.nurse_id = n.id
            LEFT JOIN surgeries sg ON sg.id = sn.surgery_id
            WHERE n.id = $1 AND n.is_active = TRUE
            GROUP BY n.id
        `;

        const { rows } = await pool.query(query, [nurseId]);

        if (rows.length === 0) {
            return sendError(res, 'Nurse not found', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, rows[0], 'Nurse fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// UPDATE NURSE
// ============================================================================
// @desc    Update an existing nurse's details (partial update supported)
// @route   PUT /api/nurses/:id
// @access  Protected (coordinator, admin)
// Created by: M2 (Chandeepa) - Day 14
// ============================================================================
export const updateNurse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const nurseId = parseInt(id, 10);
        if (isNaN(nurseId) || nurseId <= 0) {
            return sendError(res, 'Invalid nurse ID. Must be a positive integer.', 400, ERROR_CODES.BAD_REQUEST);
        }

        const existing = await pool.query(
            'SELECT * FROM nurses WHERE id = $1 AND is_active = TRUE',
            [nurseId]
        );
        if (existing.rows.length === 0) {
            return sendError(res, 'Nurse not found', 404, ERROR_CODES.NOT_FOUND);
        }

        const current = existing.rows[0];
        const {
            name = current.name,
            specialization = current.specialization,
            license_number = current.license_number,
            years_of_experience = current.years_of_experience,
            phone = current.phone,
            email = current.email,
            is_available = current.is_available,
            shift_preference = current.shift_preference,
        } = req.body;

        const updateQuery = `
            UPDATE nurses
            SET
                name                = $1,
                specialization      = $2,
                license_number      = $3,
                years_of_experience = $4,
                phone               = $5,
                email               = $6,
                is_available        = $7,
                shift_preference    = $8,
                updated_at          = NOW()
            WHERE id = $9 AND is_active = TRUE
            RETURNING *
        `;

        const values = [
            name.trim(), specialization.trim(), license_number.trim(),
            years_of_experience ? parseInt(years_of_experience, 10) : null,
            phone.trim(), email.trim().toLowerCase(), is_available,
            shift_preference || 'flexible', nurseId
        ];

        const { rows } = await pool.query(updateQuery, values);
        sendSuccess(res, rows[0], 'Nurse updated successfully', 200);
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'A nurse with this email or licence number already exists', 409, ERROR_CODES.CONFLICT);
        }
        next(error);
    }
};

// ============================================================================
// DELETE NURSE (Soft Delete)
// ============================================================================
// @desc    Soft-delete a nurse by setting is_active = FALSE
// @route   DELETE /api/nurses/:id
// @access  Protected (coordinator, admin)
// Created by: M2 (Chandeepa) - Day 14
// ============================================================================
export const deleteNurse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const nurseId = parseInt(id, 10);
        if (isNaN(nurseId) || nurseId <= 0) {
            return sendError(res, 'Invalid nurse ID. Must be a positive integer.', 400, ERROR_CODES.BAD_REQUEST);
        }

        const { rows } = await pool.query(
            `UPDATE nurses
             SET is_active = FALSE, updated_at = NOW()
             WHERE id = $1 AND is_active = TRUE
             RETURNING id, name`,
            [nurseId]
        );

        if (rows.length === 0) {
            return sendError(res, 'Nurse not found', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, null, `Nurse "${rows[0].name}" deleted successfully`, 200);
    } catch (error) {
        next(error);
    }
};
