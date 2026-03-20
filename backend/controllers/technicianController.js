// ============================================================================
// Technician Controller
// ============================================================================
// Created by: M4 (Oneli) - Day 14
//
// Handles technician-related HTTP requests (full CRUD):
// - getTechnicians:      GET    /api/technicians          - List all active
// - getTechnicianById:   GET    /api/technicians/:id      - Get detail
// - createTechnician:    POST   /api/technicians          - Create
// - updateTechnician:    PUT    /api/technicians/:id      - Update
// - deleteTechnician:    DELETE /api/technicians/:id      - Soft-delete
// ============================================================================

import { pool } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// ============================================================================
// GET ALL TECHNICIANS
// ============================================================================
// @desc    Get all active technicians with optional filters:
//          - ?specialization=Equipment
//          - ?is_available=true
// @route   GET /api/technicians
// @access  Protected
// ============================================================================
export const getTechnicians = async (req, res) => {
    try {
        const { specialization, is_available } = req.query;

        const conditions = ['is_active = TRUE'];
        const params = [];

        if (specialization) {
            params.push(specialization);
            conditions.push(`specialization ILIKE $${params.length}`);
        }

        if (is_available !== undefined) {
            const availBool = is_available === 'true';
            params.push(availBool);
            conditions.push(`is_available = $${params.length}`);
        }

        const whereClause = conditions.join(' AND ');

        const { rows } = await pool.query(`
            SELECT
                id,
                name,
                email,
                phone,
                specialization,
                license_number,
                years_of_experience,
                is_available,
                shift_preference,
                is_active,
                created_at,
                updated_at
            FROM technicians
            WHERE ${whereClause}
            ORDER BY name ASC
        `, params);

        sendSuccess(res, rows, 'Technicians fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// GET TECHNICIAN BY ID
// ============================================================================
// @desc    Get a single technician by ID
// @route   GET /api/technicians/:id
// @access  Protected
// ============================================================================
export const getTechnicianById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(`
            SELECT id, name, email, phone, specialization, license_number,
                   years_of_experience, is_available, shift_preference,
                   is_active, created_at, updated_at
            FROM technicians
            WHERE id = $1
        `, [id]);

        if (rows.length === 0) {
            return sendError(res, 'Technician not found', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, rows[0], 'Technician fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// CREATE TECHNICIAN
// ============================================================================
// @desc    Create a new technician record
// @route   POST /api/technicians
// @access  Protected (coordinator, admin)
// ============================================================================
export const createTechnician = async (req, res, next) => {
    try {
        const {
            name, email, phone, specialization, license_number,
            years_of_experience, is_available = true, shift_preference = 'flexible'
        } = req.body;

        const { rows } = await pool.query(`
            INSERT INTO technicians (
                name, email, phone, specialization, license_number,
                years_of_experience, is_available, shift_preference
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `, [
            name.trim(), email.trim().toLowerCase(), phone || null,
            specialization || null, license_number || null,
            years_of_experience ? parseInt(years_of_experience, 10) : 0,
            is_available, shift_preference
        ]);

        sendSuccess(res, rows[0], `Technician '${rows[0].name}' created successfully`, 201);
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'A technician with this email already exists', 409, ERROR_CODES.CONFLICT);
        }
        next(error);
    }
};

// ============================================================================
// UPDATE TECHNICIAN
// ============================================================================
// @desc    Update an existing technician (partial update)
// @route   PUT /api/technicians/:id
// @access  Protected (coordinator, admin)
// ============================================================================
export const updateTechnician = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name, email, phone, specialization, license_number,
            years_of_experience, is_available, shift_preference
        } = req.body;

        const { rows: existingRows } = await pool.query('SELECT id FROM technicians WHERE id = $1', [id]);
        if (existingRows.length === 0) {
            return sendError(res, 'Technician not found', 404, ERROR_CODES.NOT_FOUND);
        }

        const setClauses = [];
        const params = [];

        if (name !== undefined) {
            params.push(name.trim());
            setClauses.push(`name = $${params.length}`);
        }
        if (email !== undefined) {
            params.push(email.trim().toLowerCase());
            setClauses.push(`email = $${params.length}`);
        }
        if (phone !== undefined) {
            params.push(phone || null);
            setClauses.push(`phone = $${params.length}`);
        }
        if (specialization !== undefined) {
            params.push(specialization || null);
            setClauses.push(`specialization = $${params.length}`);
        }
        if (license_number !== undefined) {
            params.push(license_number || null);
            setClauses.push(`license_number = $${params.length}`);
        }
        if (years_of_experience !== undefined) {
            params.push(years_of_experience !== null ? parseInt(years_of_experience, 10) : 0);
            setClauses.push(`years_of_experience = $${params.length}`);
        }
        if (is_available !== undefined) {
            params.push(Boolean(is_available));
            setClauses.push(`is_available = $${params.length}`);
        }
        if (shift_preference !== undefined) {
            params.push(shift_preference || 'flexible');
            setClauses.push(`shift_preference = $${params.length}`);
        }

        if (setClauses.length === 0) {
            return sendError(res, 'No fields to update', 400, ERROR_CODES.BAD_REQUEST);
        }

        params.push(id);
        const { rows } = await pool.query(`
            UPDATE technicians
            SET ${setClauses.join(', ')}, updated_at = NOW()
            WHERE id = $${params.length}
            RETURNING *
        `, params);

        sendSuccess(res, rows[0], `Technician '${rows[0].name}' updated successfully`, 200);
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'A technician with this email already exists', 409, ERROR_CODES.CONFLICT);
        }
        next(error);
    }
};

// ============================================================================
// DELETE TECHNICIAN (soft-delete)
// ============================================================================
// @desc    Soft-delete a technician (set is_active = FALSE)
// @route   DELETE /api/technicians/:id
// @access  Protected (coordinator, admin)
// ============================================================================
export const deleteTechnician = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(`
            UPDATE technicians
            SET is_active = FALSE, updated_at = NOW()
            WHERE id = $1 AND is_active = TRUE
            RETURNING id, name
        `, [id]);

        if (rows.length === 0) {
            return sendError(res, 'Technician not found or already deleted', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, null, `Technician '${rows[0].name}' deleted successfully`, 200);
    } catch (error) {
        next(error);
    }
};
