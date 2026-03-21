// ============================================================================
// Patient Controller
// ============================================================================
// Created by: M1 (Pasindu) - Day 15
// Updated by: M6 (Dinil) - Day 15 (added patient search API)
//
// Handles patient-related HTTP requests including:
// - Listing all active patients (with optional gender/blood_type/search filters)
// - Getting a single patient by ID
// - Creating a new patient
// - Updating an existing patient
//
// EXPORTS:
// - getPatients:     GET  /api/patients          - List all active patients
// - getPatientById:  GET  /api/patients/:id      - Get patient detail
// - createPatient:   POST /api/patients          - Create a new patient
// - updatePatient:   PUT  /api/patients/:id      - Update a patient
// ============================================================================

import { pool } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// ============================================================================
// GET ALL PATIENTS
// ============================================================================
// @desc    Get all active patients with optional filters:
//          - ?gender=male
//          - ?blood_type=A+
//          - ?is_active=true
//          - ?search=john  (search by name, phone, email)
// @route   GET /api/patients
// @access  Protected
// ============================================================================
export const getPatients = async (req, res, next) => {
    try {
        const { gender, blood_type, is_active, search } = req.query;

        const conditions = [];
        const params = [];

        // Default to active patients unless explicitly set
        if (is_active !== undefined) {
            const activeBool = is_active === 'true';
            params.push(activeBool);
            conditions.push(`is_active = $${params.length}`);
        } else {
            conditions.push('is_active = TRUE');
        }

        if (gender) {
            params.push(gender.toLowerCase());
            conditions.push(`gender = $${params.length}`);
        }

        if (blood_type) {
            params.push(blood_type);
            conditions.push(`blood_type = $${params.length}`);
        }

        // Server-side search by name, phone, or email
        if (search && search.trim()) {
            const searchTerm = `%${search.trim().toLowerCase()}%`;
            params.push(searchTerm);
            const idx = params.length;
            conditions.push(
                `(LOWER(name) LIKE $${idx} OR LOWER(phone) LIKE $${idx} OR LOWER(COALESCE(email, '')) LIKE $${idx})`
            );
        }

        const whereClause = conditions.length > 0
            ? conditions.join(' AND ')
            : '1=1';

        const { rows } = await pool.query(`
            SELECT
                id,
                name,
                date_of_birth,
                age,
                gender,
                blood_type,
                phone,
                email,
                address,
                emergency_contact_name,
                emergency_contact_phone,
                emergency_contact_relationship,
                medical_history,
                allergies,
                current_medications,
                is_active,
                created_at,
                updated_at
            FROM patients
            WHERE ${whereClause}
            ORDER BY name ASC
        `, params);

        sendSuccess(res, rows, 'Patients fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};


// ============================================================================
// GET PATIENT BY ID
// ============================================================================
// @desc    Get a single patient by ID, including their surgery history
// @route   GET /api/patients/:id
// @access  Protected
// Updated by: M3 (Janani) - Day 15  (added surgery history join)
// ============================================================================
export const getPatientById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch patient
        const { rows } = await pool.query(`
            SELECT
                id,
                name,
                date_of_birth,
                age,
                gender,
                blood_type,
                phone,
                email,
                address,
                emergency_contact_name,
                emergency_contact_phone,
                emergency_contact_relationship,
                medical_history,
                allergies,
                current_medications,
                is_active,
                created_at,
                updated_at
            FROM patients
            WHERE id = $1
        `, [id]);

        if (rows.length === 0) {
            return sendError(res, 'Patient not found', 404);
        }

        const patient = rows[0];

        // Fetch related surgeries for this patient
        let surgeries = [];
        try {
            const surgeryResult = await pool.query(`
                SELECT
                    id,
                    surgery_type,
                    status,
                    priority,
                    scheduled_date,
                    scheduled_start_time,
                    scheduled_end_time,
                    theatre_id,
                    surgeon_id,
                    notes,
                    created_at
                FROM surgeries
                WHERE patient_id = $1
                ORDER BY scheduled_date DESC, scheduled_start_time DESC
            `, [id]);
            surgeries = surgeryResult.rows;
        } catch {
            // surgeries table may not have patient_id yet – silently skip
        }

        sendSuccess(res, {
            ...patient,
            surgeries
        }, 'Patient fetched successfully', 200);
    } catch (error) {
        next(error);
    }
};

// ============================================================================
// CREATE PATIENT
// ============================================================================
// @desc    Create a new patient record
// @route   POST /api/patients
// @access  Protected (coordinator, admin)
// ============================================================================
export const createPatient = async (req, res, next) => {
    try {
        const {
            name, date_of_birth, gender, blood_type, phone, email,
            address, emergency_contact_name, emergency_contact_phone,
            emergency_contact_relationship, medical_history,
            allergies, current_medications
        } = req.body;

        const dob = new Date(date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        const { rows } = await pool.query(`
            INSERT INTO patients (
                name, date_of_birth, age, gender, blood_type,
                phone, email, address,
                emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                medical_history, allergies, current_medications
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `, [
            name.trim(), date_of_birth, age, gender.toLowerCase(),
            blood_type || null, phone.trim(),
            email ? email.trim().toLowerCase() : null, address || null,
            emergency_contact_name || null, emergency_contact_phone || null,
            emergency_contact_relationship || null, medical_history || null,
            allergies || null, current_medications || null
        ]);

        sendSuccess(res, rows[0], `Patient '${rows[0].name}' created successfully`, 201);
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'A patient with this phone number already exists', 409, ERROR_CODES.CONFLICT);
        }
        next(error);
    }
};

// ============================================================================
// UPDATE PATIENT
// ============================================================================
// @desc    Update an existing patient record
// @route   PUT /api/patients/:id
// @access  Protected (coordinator, admin)
// ============================================================================
export const updatePatient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name, date_of_birth, gender, blood_type, phone, email,
            address, emergency_contact_name, emergency_contact_phone,
            emergency_contact_relationship, medical_history,
            allergies, current_medications
        } = req.body;

        const { rows: existing } = await pool.query('SELECT id FROM patients WHERE id = $1', [id]);
        if (existing.length === 0) {
            return sendError(res, 'Patient not found', 404, ERROR_CODES.NOT_FOUND);
        }

        const fields = [];
        const params = [];
        let idx = 0;

        if (name !== undefined) {
            params.push(name.trim());
            fields.push(`name = $${++idx}`);
        }

        if (date_of_birth !== undefined) {
            const dob = new Date(date_of_birth);
            params.push(date_of_birth);
            fields.push(`date_of_birth = $${++idx}`);

            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            params.push(age);
            fields.push(`age = $${++idx}`);
        }

        if (gender !== undefined) {
            params.push(gender.toLowerCase());
            fields.push(`gender = $${++idx}`);
        }

        if (blood_type !== undefined) {
            params.push(blood_type || null);
            fields.push(`blood_type = $${++idx}`);
        }

        if (phone !== undefined) {
            params.push(phone.trim());
            fields.push(`phone = $${++idx}`);
        }

        if (email !== undefined) {
            params.push(email ? email.trim().toLowerCase() : null);
            fields.push(`email = $${++idx}`);
        }

        if (address !== undefined) {
            params.push(address || null);
            fields.push(`address = $${++idx}`);
        }

        if (emergency_contact_name !== undefined) {
            params.push(emergency_contact_name || null);
            fields.push(`emergency_contact_name = $${++idx}`);
        }

        if (emergency_contact_phone !== undefined) {
            params.push(emergency_contact_phone || null);
            fields.push(`emergency_contact_phone = $${++idx}`);
        }

        if (emergency_contact_relationship !== undefined) {
            params.push(emergency_contact_relationship || null);
            fields.push(`emergency_contact_relationship = $${++idx}`);
        }

        if (medical_history !== undefined) {
            params.push(medical_history || null);
            fields.push(`medical_history = $${++idx}`);
        }

        if (allergies !== undefined) {
            params.push(allergies || null);
            fields.push(`allergies = $${++idx}`);
        }

        if (current_medications !== undefined) {
            params.push(current_medications || null);
            fields.push(`current_medications = $${++idx}`);
        }

        if (fields.length === 0) {
            return sendError(res, 'No fields provided to update', 400, ERROR_CODES.BAD_REQUEST);
        }

        params.push(id);
        const { rows } = await pool.query(`
            UPDATE patients
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $${params.length}
            RETURNING *
        `, params);

        sendSuccess(res, rows[0], `Patient '${rows[0].name}' updated successfully`, 200);
    } catch (error) {
        if (error.code === '23505') {
            return sendError(res, 'A patient with this phone number already exists', 409, ERROR_CODES.CONFLICT);
        }
        next(error);
    }
};

// ============================================================================
// DELETE PATIENT (soft-delete)
// ============================================================================
// @desc    Soft-delete a patient (set is_active = false)
// @route   DELETE /api/patients/:id
// @access  Protected (coordinator, admin)
// ============================================================================
export const deletePatient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows: existing } = await pool.query(
            'SELECT id, name, is_active FROM patients WHERE id = $1',
            [id]
        );

        if (existing.length === 0) {
            return sendError(res, 'Patient not found', 404, ERROR_CODES.NOT_FOUND);
        }

        if (!existing[0].is_active) {
            return sendError(res, 'Patient is already deactivated', 400, ERROR_CODES.BAD_REQUEST);
        }

        await pool.query(
            'UPDATE patients SET is_active = FALSE, updated_at = NOW() WHERE id = $1',
            [id]
        );

        sendSuccess(res, null, `Patient '${existing[0].name}' has been deactivated`, 200);
    } catch (error) {
        next(error);
    }
};
