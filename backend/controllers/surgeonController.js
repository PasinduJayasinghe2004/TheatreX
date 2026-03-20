// ============================================================================
// Surgeon Controller
// ============================================================================
// Created by: M1 (Pasindu) - Day 13
// Updated by: M1 (Pasindu) - Day 14 (added updateSurgeon, deleteSurgeon)
//
// Handles all surgeon-related HTTP requests and business logic.
//
// EXPORTS:
// - createSurgeon:   POST   /api/surgeons      - Create a new surgeon (Coordinator/Admin)
// - getAllSurgeons:  GET    /api/surgeons      - List all active surgeons (Protected)
// - getSurgeonById: GET    /api/surgeons/:id  - Get one surgeon by ID (Protected)
// - updateSurgeon:  PUT    /api/surgeons/:id  - Update a surgeon (Coordinator/Admin)
// - deleteSurgeon:  DELETE /api/surgeons/:id  - Soft-delete a surgeon (Coordinator/Admin)
// ============================================================================

import { pool } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// ============================================================================
// CREATE SURGEON
// ============================================================================
// @desc    Create a new surgeon record
// @route   POST /api/surgeons
// @access  Protected (coordinator, admin)
// Created by: M1 (Pasindu) - Day 13
// ============================================================================
export const createSurgeon = async (req, res, next) => {
    try {
        const {
            name, specialization, license_number, years_of_experience,
            phone, email, is_available = true,
        } = req.body;

        const profile_picture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

        const insertQuery = `
            INSERT INTO surgeons (
                name, specialization, license_number, years_of_experience,
                phone, email, is_available, is_active, profile_picture
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8)
            RETURNING *
        `;

        const values = [
            name.trim(), specialization.trim(), license_number.trim(),
            years_of_experience ? parseInt(years_of_experience, 10) : null,
            phone.trim(), email.trim().toLowerCase(), is_available, profile_picture
        ];

        const { rows } = await pool.query(insertQuery, values);
        sendSuccess(res, rows[0], 'Surgeon created successfully', 201);
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'A surgeon with this email or licence number already exists', 409, ERROR_CODES.CONFLICT);
        }
        next(error);
    }
};

// ============================================================================
// GET ALL SURGEONS
// ============================================================================
// @desc    Get all active surgeons, with optional ?search= and ?available= filters
// @route   GET /api/surgeons
// @access  Protected
// Created by: M1 (Pasindu) - Day 13
// ============================================================================
export const getAllSurgeons = async (req, res) => {
    try {
        const { search, available } = req.query;

        // Build dynamic WHERE clause
        const conditions = ['s.is_active = TRUE'];
        const params = [];
        let paramIdx = 1;

        // Full-text search on name, specialization, or email
        if (search && search.trim()) {
            conditions.push(
                `(s.name ILIKE $${paramIdx} OR s.specialization ILIKE $${paramIdx} OR s.email ILIKE $${paramIdx})`
            );
            params.push(`%${search.trim()}%`);
            paramIdx++;
        }

        // Filter by availability flag
        if (available === 'true') {
            conditions.push(`s.is_available = TRUE`);
        } else if (available === 'false') {
            conditions.push(`s.is_available = FALSE`);
        }

        const whereClause = `WHERE ${conditions.join(' AND ')}`;

        // Count of surgeries each surgeon is currently assigned to (scheduled/in_progress)
        const query = `
            SELECT
                s.*,
                COUNT(DISTINCT sg.id) FILTER (
                    WHERE sg.status IN ('scheduled', 'in_progress')
                ) AS active_surgery_count
            FROM surgeons s
            LEFT JOIN surgeries sg ON sg.surgeon_id = s.id
            ${whereClause}
            GROUP BY s.id
            ORDER BY s.name ASC
        `;

        const { rows } = await pool.query(query, params);

        sendSuccess(res, rows, 'Surgeons fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// GET SURGEON BY ID
// ============================================================================
// @desc    Get a single surgeon by ID (active only)
// @route   GET /api/surgeons/:id
// @access  Protected
// Created by: M2 (Chandeepa) - Day 13
// ============================================================================
export const getSurgeonById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const surgeonId = parseInt(id, 10);
        if (isNaN(surgeonId) || surgeonId <= 0) {
            return sendError(res, 'Invalid surgeon ID. Must be a positive integer.', 400, ERROR_CODES.BAD_REQUEST);
        }

        const query = `
            SELECT
                s.*,
                COUNT(DISTINCT sg.id) FILTER (
                    WHERE sg.status IN ('scheduled', 'in_progress')
                ) AS active_surgery_count
            FROM surgeons s
            LEFT JOIN surgeries sg ON sg.surgeon_id = s.id
            WHERE s.id = $1 AND s.is_active = TRUE
            GROUP BY s.id
        `;

        const { rows } = await pool.query(query, [surgeonId]);
        if (rows.length === 0) {
            return sendError(res, 'Surgeon not found', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, rows[0], 'Surgeon fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// UPDATE SURGEON
// ============================================================================
// @desc    Update an existing surgeon's details (partial update supported)
// @route   PUT /api/surgeons/:id
// @access  Protected (coordinator, admin)
// Created by: M1 (Pasindu) - Day 14
// ============================================================================
export const updateSurgeon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const surgeonId = parseInt(id, 10);
        if (isNaN(surgeonId) || surgeonId <= 0) {
            return sendError(res, 'Invalid surgeon ID. Must be a positive integer.', 400, ERROR_CODES.BAD_REQUEST);
        }

        const existing = await pool.query('SELECT * FROM surgeons WHERE id = $1 AND is_active = TRUE', [surgeonId]);
        if (existing.rows.length === 0) {
            return sendError(res, 'Surgeon not found', 404, ERROR_CODES.NOT_FOUND);
        }

        const current = existing.rows[0];
        const {
            name = current.name, specialization = current.specialization,
            license_number = current.license_number, years_of_experience = current.years_of_experience,
            phone = current.phone, email = current.email, is_available = current.is_available,
        } = req.body;

        const profile_picture = req.file ? `/uploads/profiles/${req.file.filename}` : current.profile_picture;

        const updateQuery = `
            UPDATE surgeons
            SET
                name = $1, specialization = $2, license_number = $3,
                years_of_experience = $4, phone = $5, email = $6,
                is_available = $7, profile_picture = $8, updated_at = NOW()
            WHERE id = $9 AND is_active = TRUE
            RETURNING *
        `;

        const values = [
            name.trim(), specialization.trim(), license_number.trim(),
            years_of_experience ? parseInt(years_of_experience, 10) : null,
            phone.trim(), email.trim().toLowerCase(), is_available, profile_picture, surgeonId
        ];

        const { rows } = await pool.query(updateQuery, values);
        sendSuccess(res, rows[0], 'Surgeon updated successfully', 200);
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'A surgeon with this email or licence number already exists', 409, ERROR_CODES.CONFLICT);
        }
        next(error);
    }
};

// ============================================================================
// DELETE SURGEON (Soft Delete)
// ============================================================================
// @desc    Soft-delete a surgeon by setting is_active = FALSE
// @route   DELETE /api/surgeons/:id
// @access  Protected (coordinator, admin)
// Created by: M1 (Pasindu) - Day 14
// ============================================================================
export const deleteSurgeon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const surgeonId = parseInt(id, 10);
        if (isNaN(surgeonId) || surgeonId <= 0) {
            return sendError(res, 'Invalid surgeon ID. Must be a positive integer.', 400, ERROR_CODES.BAD_REQUEST);
        }

        const { rows } = await pool.query(
            `UPDATE surgeons SET is_active = FALSE, updated_at = NOW() WHERE id = $1 AND is_active = TRUE RETURNING id, name`,
            [surgeonId]
        );

        if (rows.length === 0) {
            return sendError(res, 'Surgeon not found', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, null, `Surgeon "${rows[0].name}" deleted successfully`, 200);
    } catch (error) {
        next(error);
    }
};
