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
// GET ALL SURGERIES
// ============================================================================
// @desc    Get all surgeries with surgeon details
// @route   GET /api/surgeries
// @access  Protected
// Updated by: M2 (Chandeepa) - Day 5 (Added surgeon JOIN)
// ============================================================================
export const getAllSurgeries = async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                s.*,
                u.name as surgeon_name,
                u.email as surgeon_email
            FROM surgeries s
            LEFT JOIN users u ON s.surgeon_id = u.id
            ORDER BY s.scheduled_date ASC, s.scheduled_time ASC
        `);

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

        res.status(200).json({
            success: true,
            count: surgeries.length,
            data: surgeries
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
                u.email  AS surgeon_email
             FROM surgeries s
             LEFT JOIN users u ON s.surgeon_id = u.id
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
