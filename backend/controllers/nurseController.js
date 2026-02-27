// ============================================================================
// Nurse Controller
// ============================================================================
// Created by: M3 (Janani) - Day 13
//
// Handles all nurse-related HTTP requests and business logic.
//
// EXPORTS:
// - createNurse:   POST /api/nurses        - Create a new nurse (Coordinator/Admin)
// - getAllNurses:   GET  /api/nurses        - List all active nurses (Protected)
// - getNurseById:  GET  /api/nurses/:id    - Get a single nurse by ID (Protected)
// ============================================================================

import { pool } from '../config/database.js';

// ============================================================================
// CREATE NURSE
// ============================================================================
// @desc    Create a new nurse record
// @route   POST /api/nurses
// @access  Protected (coordinator, admin)
// Created by: M3 (Janani) - Day 13
// ============================================================================
export const createNurse = async (req, res) => {
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

        // ── 1. Required field check ──────────────────────────────────────────
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!specialization) missingFields.push('specialization');
        if (!license_number) missingFields.push('license_number');
        if (!phone) missingFields.push('phone');
        if (!email) missingFields.push('email');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: missingFields.map(f => `${f} is required`),
            });
        }

        // ── 2. Email format check ─────────────────────────────────────────────
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: ['email must be a valid email address'],
            });
        }

        // ── 3. years_of_experience type check (optional field) ────────────────
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

        // ── 4. shift_preference check ─────────────────────────────────────────
        const validShifts = ['morning', 'afternoon', 'night', 'flexible'];
        if (shift_preference && !validShifts.includes(shift_preference)) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: [`shift_preference must be one of: ${validShifts.join(', ')}`],
            });
        }

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

        return res.status(201).json({
            success: true,
            message: 'Nurse created successfully',
            data: newNurse,
        });

    } catch (error) {
        console.error('Error creating nurse:', error);

        // Duplicate email
        if (error.code === '23505' && error.constraint?.includes('email')) {
            return res.status(409).json({
                success: false,
                message: 'A nurse with this email already exists',
            });
        }

        // Duplicate license number
        if (error.code === '23505' && error.constraint?.includes('license_number')) {
            return res.status(409).json({
                success: false,
                message: 'A nurse with this licence number already exists',
            });
        }

        // Generic duplicate
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Duplicate entry — email or licence number already registered',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error creating nurse',
            error: error.message,
        });
    }
};

// ============================================================================
// UPDATE NURSE
// ============================================================================
// @desc    Update a nurse record
// @route   PUT /api/nurses/:id
// @access  Protected (coordinator, admin)
// ============================================================================
export const updateNurse = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            specialization,
            license_number,
            years_of_experience,
            phone,
            email,
            is_available,
            shift_preference,
        } = req.body;

        let profile_picture = req.body.profile_picture;
        if (req.file) {
            profile_picture = `/uploads/profiles/${req.file.filename}`;
        }

        const query = `
            UPDATE nurses
            SET 
                name = COALESCE($1, name),
                specialization = COALESCE($2, specialization),
                license_number = COALESCE($3, license_number),
                years_of_experience = COALESCE($4, years_of_experience),
                phone = COALESCE($5, phone),
                email = COALESCE($6, email),
                is_available = COALESCE($7, is_available),
                shift_preference = COALESCE($8, shift_preference),
                profile_picture = COALESCE($9, profile_picture),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $10 AND is_active = TRUE
            RETURNING *
        `;

        const values = [
            name ? name.trim() : null,
            specialization ? specialization.trim() : null,
            license_number ? license_number.trim() : null,
            years_of_experience ? parseInt(years_of_experience, 10) : null,
            phone ? phone.trim() : null,
            email ? email.trim().toLowerCase() : null,
            is_available === undefined ? null : is_available,
            shift_preference,
            profile_picture,
            id
        ];

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nurse not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Nurse updated successfully',
            data: rows[0],
        });
    } catch (error) {
        console.error('Error updating nurse:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating nurse',
            error: error.message,
        });
    }
};

// ============================================================================
// DELETE NURSE
// ============================================================================
// @desc    Soft delete a nurse
// @route   DELETE /api/nurses/:id
// @access  Protected (admin)
// ============================================================================
export const deleteNurse = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `UPDATE nurses SET is_active = FALSE WHERE id = $1 RETURNING *`;
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nurse not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Nurse deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting nurse:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting nurse',
            error: error.message,
        });
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

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows,
            filters: {
                search: search || null,
                available: available || null,
                shift: shift || null,
            },
        });

    } catch (error) {
        console.error('Error fetching nurses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching nurses',
            error: error.message,
        });
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
export const getNurseById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID is a positive integer
        const nurseId = parseInt(id, 10);
        if (isNaN(nurseId) || nurseId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid nurse ID. Must be a positive integer.',
            });
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
            return res.status(404).json({
                success: false,
                message: 'Nurse not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0],
        });

    } catch (error) {
        console.error('Error fetching nurse by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching nurse',
            error: error.message,
        });
    }
};
