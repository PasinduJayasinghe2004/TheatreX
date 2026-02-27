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

// ============================================================================
// CREATE SURGEON
// ============================================================================
// @desc    Create a new surgeon record
// @route   POST /api/surgeons
// @access  Protected (coordinator, admin)
// Created by: M1 (Pasindu) - Day 13
// ============================================================================
export const createSurgeon = async (req, res) => {
    try {
        const {
            name,
            specialization,
            license_number,
            years_of_experience,
            phone,
            email,
            is_available = true,
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

        // ── 4. Insert into surgeons table ─────────────────────────────────────
        const insertQuery = `
            INSERT INTO surgeons (
                name,
                specialization,
                license_number,
                years_of_experience,
                phone,
                email,
                is_available,
                is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
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
        ];

        const { rows } = await pool.query(insertQuery, values);
        const newSurgeon = rows[0];

        return res.status(201).json({
            success: true,
            message: 'Surgeon created successfully',
            data: newSurgeon,
        });

    } catch (error) {
        console.error('Error creating surgeon:', error);

        // Duplicate email
        if (error.code === '23505' && error.constraint?.includes('email')) {
            return res.status(409).json({
                success: false,
                message: 'A surgeon with this email already exists',
            });
        }

        // Duplicate license number
        if (error.code === '23505' && error.constraint?.includes('license_number')) {
            return res.status(409).json({
                success: false,
                message: 'A surgeon with this licence number already exists',
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
            message: 'Error creating surgeon',
            error: error.message,
        });
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

        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows,
            filters: {
                search: search || null,
                available: available || null,
            },
        });

    } catch (error) {
        console.error('Error fetching surgeons:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching surgeons',
            error: error.message,
        });
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
export const getSurgeonById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID is a positive integer
        const surgeonId = parseInt(id, 10);
        if (isNaN(surgeonId) || surgeonId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid surgeon ID. Must be a positive integer.',
            });
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
            return res.status(404).json({
                success: false,
                message: 'Surgeon not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0],
        });

    } catch (error) {
        console.error('Error fetching surgeon by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching surgeon',
            error: error.message,
        });
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
export const updateSurgeon = async (req, res) => {
    try {
        const { id } = req.params;

        // ── 1. Validate ID ────────────────────────────────────────────────────
        const surgeonId = parseInt(id, 10);
        if (isNaN(surgeonId) || surgeonId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid surgeon ID. Must be a positive integer.',
            });
        }

        // ── 2. Check surgeon exists and is active ─────────────────────────────
        const existing = await pool.query(
            'SELECT * FROM surgeons WHERE id = $1 AND is_active = TRUE',
            [surgeonId]
        );
        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Surgeon not found',
            });
        }

        const current = existing.rows[0];

        // ── 3. Merge with existing values (partial update) ────────────────────
        const {
            name = current.name,
            specialization = current.specialization,
            license_number = current.license_number,
            years_of_experience = current.years_of_experience,
            phone = current.phone,
            email = current.email,
            is_available = current.is_available,
        } = req.body;

        // ── 4. Business-rule validations (email format, YOE) ──────────────────
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

        // ── 5. Run UPDATE ─────────────────────────────────────────────────────
        const updateQuery = `
            UPDATE surgeons
            SET
                name                = $1,
                specialization      = $2,
                license_number      = $3,
                years_of_experience = $4,
                phone               = $5,
                email               = $6,
                is_available        = $7,
                updated_at          = NOW()
            WHERE id = $8 AND is_active = TRUE
            RETURNING *
        `;

        const values = [
            name.trim(),
            specialization.trim(),
            license_number.trim(),
            years_of_experience !== '' && years_of_experience !== null
                ? parseInt(years_of_experience, 10)
                : null,
            phone.trim(),
            email.trim().toLowerCase(),
            is_available,
            surgeonId,
        ];

        const { rows } = await pool.query(updateQuery, values);

        return res.status(200).json({
            success: true,
            message: 'Surgeon updated successfully',
            data: rows[0],
        });

    } catch (error) {
        console.error('Error updating surgeon:', error);

        // Duplicate email
        if (error.code === '23505' && error.constraint?.includes('email')) {
            return res.status(409).json({
                success: false,
                message: 'A surgeon with this email already exists',
            });
        }

        // Duplicate licence number
        if (error.code === '23505' && error.constraint?.includes('license_number')) {
            return res.status(409).json({
                success: false,
                message: 'A surgeon with this licence number already exists',
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
            message: 'Error updating surgeon',
            error: error.message,
        });
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
export const deleteSurgeon = async (req, res) => {
    try {
        const { id } = req.params;

        // ── 1. Validate ID ────────────────────────────────────────────────────
        const surgeonId = parseInt(id, 10);
        if (isNaN(surgeonId) || surgeonId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid surgeon ID. Must be a positive integer.',
            });
        }

        // ── 2. Soft-delete (set is_active = FALSE) ────────────────────────────
        const { rows } = await pool.query(
            `UPDATE surgeons
             SET is_active = FALSE, updated_at = NOW()
             WHERE id = $1 AND is_active = TRUE
             RETURNING id, name`,
            [surgeonId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Surgeon not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: `Surgeon "${rows[0].name}" deleted successfully`,
        });

    } catch (error) {
        console.error('Error deleting surgeon:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting surgeon',
            error: error.message,
        });
    }
};
