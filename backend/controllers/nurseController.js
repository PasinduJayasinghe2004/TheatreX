// ============================================================================
// Nurse Controller
// ============================================================================
// Created by: M4 (Oneli) - Day 13
//
// Handles nurse-related HTTP requests including:
// - Listing all active nurses (with optional specialization/availability filters)
// - Getting a single nurse by ID
// - Creating a new nurse
//
// EXPORTS:
// - getNurses:     GET  /api/nurses              - List all active nurses
// - getNurseById:  GET  /api/nurses/:id          - Get nurse detail
// - createNurse:   POST /api/nurses              - Create a new nurse
// ============================================================================

import { pool } from '../config/database.js';

// ============================================================================
// GET ALL NURSES
// ============================================================================
// @desc    Get all active nurses with optional filters:
//          - ?specialization=ICU
//          - ?is_available=true
// @route   GET /api/nurses
// @access  Protected
// ============================================================================
export const getNurses = async (req, res) => {
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
            FROM nurses
            WHERE ${whereClause}
            ORDER BY name ASC
        `, params);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching nurses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching nurses',
            error: error.message
        });
    }
};

// ============================================================================
// GET NURSE BY ID
// ============================================================================
// @desc    Get a single nurse by ID
// @route   GET /api/nurses/:id
// @access  Protected
// ============================================================================
export const getNurseById = async (req, res) => {
    try {
        const { id } = req.params;

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
            FROM nurses
            WHERE id = $1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nurse not found'
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching nurse:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching nurse',
            error: error.message
        });
    }
};

// ============================================================================
// CREATE NURSE
// ============================================================================
// @desc    Create a new nurse record
// @route   POST /api/nurses
// @access  Protected (coordinator, admin)
// ============================================================================
export const createNurse = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            specialization,
            license_number,
            years_of_experience,
            is_available,
            shift_preference
        } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate shift_preference if provided
        const validShifts = ['morning', 'afternoon', 'night', 'flexible'];
        if (shift_preference && !validShifts.includes(shift_preference)) {
            return res.status(400).json({
                success: false,
                message: `Invalid shift_preference. Must be one of: ${validShifts.join(', ')}`
            });
        }

        // Validate years_of_experience if provided
        if (years_of_experience !== undefined && years_of_experience !== null) {
            const yearsNum = parseInt(years_of_experience, 10);
            if (isNaN(yearsNum) || yearsNum < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'years_of_experience must be a non-negative number'
                });
            }
        }

        // Check for duplicate email
        const { rows: existing } = await pool.query(
            'SELECT id FROM nurses WHERE email = $1',
            [email.trim().toLowerCase()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A nurse with this email already exists'
            });
        }

        // Insert nurse
        const { rows } = await pool.query(`
            INSERT INTO nurses (
                name,
                email,
                phone,
                specialization,
                license_number,
                years_of_experience,
                is_available,
                shift_preference
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                id, name, email, phone, specialization, license_number,
                years_of_experience, is_available, shift_preference,
                is_active, created_at, updated_at
        `, [
            name.trim(),
            email.trim().toLowerCase(),
            phone || null,
            specialization || null,
            license_number || null,
            years_of_experience !== undefined && years_of_experience !== null
                ? parseInt(years_of_experience, 10)
                : 0,
            is_available !== undefined ? Boolean(is_available) : true,
            shift_preference || 'flexible'
        ]);

        res.status(201).json({
            success: true,
            message: `Nurse '${rows[0].name}' created successfully`,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error creating nurse:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating nurse',
            error: error.message
        });
    }
};
