import * as AnaesthetistRecord from '../models/anaesthetistModel.js';
import { pool } from '../config/database.js';

/**
 * @desc    Get all anaesthetists
 * @route   GET /api/anaesthetists
 * @access  Private (Coordinator/Admin)
 */
export const getAnaesthetists = async (req, res) => {
    try {
        const anaesthetists = await AnaesthetistRecord.getAllAnaesthetists();
        res.status(200).json({
            success: true,
            count: anaesthetists.length,
            data: anaesthetists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching anaesthetists',
            error: error.message
        });
    }
};

/**
 * @desc    Get available anaesthetists
 * @route   GET /api/anaesthetists/available
 * @access  Private (Coordinator/Admin)
 */
export const getAvailableAnaesthetists = async (req, res) => {
    try {
        const anaesthetists = await AnaesthetistRecord.getAvailableAnaesthetists();
        res.status(200).json({
            success: true,
            count: anaesthetists.length,
            data: anaesthetists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching available anaesthetists',
            error: error.message
        });
    }
};

/**
 * @desc    Create new anaesthetist
 * @route   POST /api/anaesthetists
 * @access  Private (Admin)
 */
export const createAnaesthetist = async (req, res) => {
    try {
        const { name, email, phone, specialization, license_number, years_of_experience, qualification, shift_preference } = req.body;
        const profile_picture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

        // Basic validation
        if (!name || !email || !specialization || !license_number) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

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

        res.status(201).json({
            success: true,
            message: 'Anaesthetist created successfully',
            data: newAnaesthetist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating anaesthetist',
            error: error.message
        });
    }
};

/**
 * @desc    Get anaesthetist by ID
 * @route   GET /api/anaesthetists/:id
 * @access  Private (Coordinator/Admin)
 * Created by: M3 (Janani) - Day 14
 */
export const getAnaesthetistById = async (req, res) => {
    try {
        const { id } = req.params;
        const anaesthetistId = parseInt(id, 10);
        if (isNaN(anaesthetistId) || anaesthetistId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid anaesthetist ID. Must be a positive integer.',
            });
        }

        const anaesthetist = await AnaesthetistRecord.getAnaesthetistById(anaesthetistId);
        if (!anaesthetist || !anaesthetist.is_active) {
            return res.status(404).json({
                success: false,
                message: 'Anaesthetist not found',
            });
        }

        res.status(200).json({
            success: true,
            data: anaesthetist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching anaesthetist',
            error: error.message,
        });
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
            return res.status(400).json({
                success: false,
                message: 'Invalid anaesthetist ID. Must be a positive integer.',
            });
        }

        // 2. Check anaesthetist exists and is active
        const existing = await pool.query(
            'SELECT * FROM anaesthetists WHERE id = $1 AND is_active = TRUE',
            [anaesthetistId]
        );
        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anaesthetist not found',
            });
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
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: ['email must be a valid email address'],
            });
        }

        if (years_of_experience !== undefined && years_of_experience !== null && years_of_experience !== '') {
            const yoe = Number(years_of_experience);
            if (isNaN(yoe) || yoe < 0 || !Number.isInteger(yoe)) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: ['years_of_experience must be a non-negative integer'],
                });
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

        return res.status(200).json({
            success: true,
            message: 'Anaesthetist updated successfully',
            data: rows[0],
        });
    } catch (error) {
        console.error('Error updating anaesthetist:', error);

        if (error.code === '23505' && error.constraint?.includes('email')) {
            return res.status(409).json({
                success: false,
                message: 'An anaesthetist with this email already exists',
            });
        }

        if (error.code === '23505' && error.constraint?.includes('license_number')) {
            return res.status(409).json({
                success: false,
                message: 'An anaesthetist with this licence number already exists',
            });
        }

        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Duplicate entry — email or licence number already registered',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error updating anaesthetist',
            error: error.message,
        });
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
            return res.status(400).json({
                success: false,
                message: 'Invalid anaesthetist ID. Must be a positive integer.',
            });
        }

        const { rows } = await pool.query(
            `UPDATE anaesthetists
             SET is_active = FALSE, updated_at = NOW()
             WHERE id = $1 AND is_active = TRUE
             RETURNING id, name`,
            [anaesthetistId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anaesthetist not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: `Anaesthetist "${rows[0].name}" deleted successfully`,
        });
    } catch (error) {
        console.error('Error deleting anaesthetist:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting anaesthetist',
            error: error.message,
        });
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
            return res.status(400).json({
                success: false,
                message: 'Please provide is_available status'
            });
        }

        const updated = await AnaesthetistRecord.updateAnaesthetistAvailability(id, is_available);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Anaesthetist not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Availability updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating availability',
            error: error.message
        });
    }
};
