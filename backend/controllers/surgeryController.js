// ============================================================================
// Surgery Controller
// ============================================================================
// Created by: M1 (Pasindu) - Day 5
// 
// Handles all surgery-related HTTP requests and business logic.
// Contains CRUD operations for surgery management.
//
// EXPORTS:
// - createSurgery: POST /api/surgeries - Create new surgery
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
// GET ALL SURGERIES (Placeholder for M2)
// ============================================================================
export const getAllSurgeries = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT * FROM surgeries 
            ORDER BY scheduled_date ASC, scheduled_time ASC
        `);

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
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
// GET SURGERY BY ID (Placeholder for M3)
// ============================================================================
export const getSurgeryById = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            'SELECT * FROM surgeries WHERE id = $1',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Surgery not found'
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
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
