import * as AnaesthetistRecord from '../models/anaesthetistModel.js';
import { pool } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * @desc    Get all anaesthetists
 * @route   GET /api/anaesthetists
 * @access  Private (Coordinator/Admin)
 */
export const getAnaesthetists = async (req, res, next) => {
    try {
        const anaesthetists = await AnaesthetistRecord.getAllAnaesthetists();
        sendSuccess(res, anaesthetists, 'Anaesthetists fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get available anaesthetists
 * @route   GET /api/anaesthetists/available
 * @access  Private (Coordinator/Admin)
 */
export const getAvailableAnaesthetists = async (req, res, next) => {
    try {
        const anaesthetists = await AnaesthetistRecord.getAvailableAnaesthetists();
        sendSuccess(res, anaesthetists, 'Available anaesthetists fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new anaesthetist
 * @route   POST /api/anaesthetists
 * @access  Private (Admin)
 */
export const createAnaesthetist = async (req, res, next) => {
    try {
        const { name, email, phone, specialization, license_number, years_of_experience, qualification, shift_preference } = req.body;
        const profile_picture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

        const newAnaesthetist = await AnaesthetistRecord.createAnaesthetist({
            name,
            email,
            phone,
            specialization,
            license_number,
            years_of_experience,
            qualification,
            shift_preference,
            profile_picture
        });

        sendSuccess(res, newAnaesthetist, 'Anaesthetist created successfully', 201);
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'An anaesthetist with this email or licence number already exists', 409, ERROR_CODES.CONFLICT);
        }
        next(error);
    }
};

/**
 * @desc    Get anaesthetist by ID
 * @route   GET /api/anaesthetists/:id
 * @access  Private (Coordinator/Admin)
 */
export const getAnaesthetistById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const anaesthetistId = parseInt(id, 10);
        if (isNaN(anaesthetistId) || anaesthetistId <= 0) {
            return sendError(res, 'Invalid anaesthetist ID. Must be a positive integer.', 400, ERROR_CODES.BAD_REQUEST);
        }

        const anaesthetist = await AnaesthetistRecord.getAnaesthetistById(anaesthetistId);
        if (!anaesthetist || !anaesthetist.is_active) {
            return sendError(res, 'Anaesthetist not found', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, anaesthetist, 'Anaesthetist fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update anaesthetist details (partial update)
 * @route   PUT /api/anaesthetists/:id
 * @access  Private (Coordinator/Admin)
 * Created by: M3 (Janani) - Day 14
 */
export const updateAnaesthetist = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validate ID
        const anaesthetistId = parseInt(id, 10);
        if (isNaN(anaesthetistId) || anaesthetistId <= 0) {
            return sendError(res, 'Invalid anaesthetist ID. Must be a positive integer.', 400, ERROR_CODES.BAD_REQUEST);
        }

        // 2. Check anaesthetist exists and is active
        const existing = await pool.query(
            'SELECT * FROM anaesthetists WHERE id = $1 AND is_active = TRUE',
            [anaesthetistId]
        );
        if (existing.rows.length === 0) {
            return sendError(res, 'Anaesthetist not found', 404);
        }

        const current = existing.rows[0];

        // 3. Merge with existing values (partial update)
        const {
            name = current.name,
            email = current.email,
            phone = current.phone,
            specialization = current.specialization,
            license_number = current.license_number,
            years_of_experience = current.years_of_experience,
            qualification = current.qualification,
            is_available = current.is_available,
            shift_preference = current.shift_preference,
            notes = current.notes,
        } = req.body;

        // 4. Business-rule validations
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return sendError(res, 'Validation failed: email must be a valid email address', 400, ERROR_CODES.VALIDATION_ERROR);
        }

        if (years_of_experience !== undefined && years_of_experience !== null && years_of_experience !== '') {
            const yoe = Number(years_of_experience);
            if (isNaN(yoe) || yoe < 0 || !Number.isInteger(yoe)) {
                return sendError(res, 'Validation failed: years_of_experience must be a non-negative integer', 400, ERROR_CODES.VALIDATION_ERROR);
            }
        }

        // 5. Run UPDATE
        const updateQuery = `
            UPDATE anaesthetists
            SET
                name                = $1,
                email               = $2,
                phone               = $3,
                specialization      = $4,
                license_number      = $5,
                years_of_experience = $6,
                qualification       = $7,
                is_available        = $8,
                shift_preference    = $9,
                notes               = $10,
                updated_at          = NOW()
            WHERE id = $11 AND is_active = TRUE
            RETURNING *
        `;

        const values = [
            name?.trim?.() ?? name,
            email?.trim?.()?.toLowerCase?.() ?? email,
            phone?.trim?.() ?? phone,
            specialization?.trim?.() ?? specialization,
            license_number?.trim?.() ?? license_number,
            years_of_experience !== '' && years_of_experience !== null
                ? parseInt(years_of_experience, 10)
                : null,
            qualification?.trim?.() ?? qualification,
            is_available,
            shift_preference,
            notes?.trim?.() ?? notes,
            anaesthetistId,
        ];

        const { rows } = await pool.query(updateQuery, values);

        sendSuccess(res, rows[0], 'Anaesthetist updated successfully', 200);
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'An anaesthetist with this email or licence number already exists', 409);
        }
        next(error);
    }
};

/**
 * @desc    Soft-delete an anaesthetist (sets is_active = FALSE)
 * @route   DELETE /api/anaesthetists/:id
 * @access  Private (Coordinator/Admin)
 * Created by: M3 (Janani) - Day 14
 */
export const deleteAnaesthetist = async (req, res) => {
    try {
        const { id } = req.params;

        const anaesthetistId = parseInt(id, 10);
        if (isNaN(anaesthetistId) || anaesthetistId <= 0) {
            return sendError(res, 'Invalid anaesthetist ID. Must be a positive integer.', 400, ERROR_CODES.BAD_REQUEST);
        }

        const { rows } = await pool.query(
            `UPDATE anaesthetists
             SET is_active = FALSE, updated_at = NOW()
             WHERE id = $1 AND is_active = TRUE
             RETURNING id, name`,
            [anaesthetistId]
        );

        if (rows.length === 0) {
            return sendError(res, 'Anaesthetist not found', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, null, `Anaesthetist "${rows[0].name}" deleted successfully`, 200);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update anaesthetist availability
 * @route   PUT /api/anaesthetists/:id/availability
 * @access  Private (Coordinator/Admin)
 */
export const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_available } = req.body;

        if (is_available === undefined) {
            return sendError(res, 'Please provide is_available status', 400, ERROR_CODES.BAD_REQUEST);
        }

        const updated = await AnaesthetistRecord.updateAnaesthetistAvailability(id, is_available);

        if (!updated) {
            return sendError(res, 'Anaesthetist not found', 404, ERROR_CODES.NOT_FOUND);
        }

        sendSuccess(res, null, 'Availability updated successfully', 200);
    } catch (error) {
        next(error);
    }
};
