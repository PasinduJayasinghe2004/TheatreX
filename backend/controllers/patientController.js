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

// ============================================================================
// GET ALL PATIENTS
// ============================================================================
// @desc    Get all active patients with optional filters:
//          - ?gender=male
//          - ?blood_type=A+
//          - ?is_active=true
//          - ?search=john         (M6 Day 15 - searches name, phone, email)
// @route   GET /api/patients
// @access  Protected
// ============================================================================
export const getPatients = async (req, res) => {
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

        // M6 Day 15: Patient search - filters by name, phone, or email (case-insensitive)
        if (search && search.trim()) {
            const term = `%${search.trim()}%`;
            params.push(term);
            conditions.push(
                `(name ILIKE $${params.length} OR phone ILIKE $${params.length} OR email ILIKE $${params.length})`
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

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patients',
            error: error.message
        });
    }
};


// ============================================================================
// GET PATIENT BY ID
// ============================================================================
// @desc    Get a single patient by ID
// @route   GET /api/patients/:id
// @access  Protected
// ============================================================================
export const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;

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
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching patient',
            error: error.message
        });
    }
};

// ============================================================================
// CREATE PATIENT
// ============================================================================
// @desc    Create a new patient record
// @route   POST /api/patients
// @access  Protected (coordinator, admin)
// ============================================================================
export const createPatient = async (req, res) => {
    try {
        const {
            name,
            date_of_birth,
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
            current_medications
        } = req.body;

        // ── Validate required fields ────────────────────────────────────
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (!date_of_birth) {
            return res.status(400).json({
                success: false,
                message: 'Date of birth is required'
            });
        }

        // Validate date_of_birth format
        const dob = new Date(date_of_birth);
        if (isNaN(dob.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date of birth format'
            });
        }

        if (!gender || !gender.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Gender is required'
            });
        }

        // Validate gender enum
        const validGenders = ['male', 'female', 'other'];
        if (!validGenders.includes(gender.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid gender. Must be one of: ${validGenders.join(', ')}`
            });
        }

        if (!phone || !phone.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Phone is required'
            });
        }

        // Validate blood_type if provided
        const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (blood_type && !validBloodTypes.includes(blood_type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid blood type. Must be one of: ${validBloodTypes.join(', ')}`
            });
        }

        // Validate email format if provided
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }
        }

        // Check for duplicate phone
        const { rows: existing } = await pool.query(
            'SELECT id FROM patients WHERE phone = $1',
            [phone.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A patient with this phone number already exists'
            });
        }

        // Calculate age from date_of_birth
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        // ── Insert patient ──────────────────────────────────────────────
        const { rows } = await pool.query(`
            INSERT INTO patients (
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
                current_medications
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING
                id, name, date_of_birth, age, gender, blood_type,
                phone, email, address,
                emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                medical_history, allergies, current_medications,
                is_active, created_at, updated_at
        `, [
            name.trim(),
            date_of_birth,
            age,
            gender.toLowerCase(),
            blood_type || null,
            phone.trim(),
            email ? email.trim().toLowerCase() : null,
            address || null,
            emergency_contact_name || null,
            emergency_contact_phone || null,
            emergency_contact_relationship || null,
            medical_history || null,
            allergies || null,
            current_medications || null
        ]);

        res.status(201).json({
            success: true,
            message: `Patient '${rows[0].name}' created successfully`,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating patient',
            error: error.message
        });
    }
};

// ============================================================================
// UPDATE PATIENT
// ============================================================================
// @desc    Update an existing patient (partial update)
// @route   PUT /api/patients/:id
// @access  Protected (coordinator, admin)
// ============================================================================
export const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;

        // Check patient exists
        const { rows: existingRows } = await pool.query(
            'SELECT id FROM patients WHERE id = $1',
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found'
            });
        }

        const {
            name,
            date_of_birth,
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
            current_medications
        } = req.body;

        // ── Validate provided fields ────────────────────────────────────

        // Validate name if provided
        if (name !== undefined && (!name || !name.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Name cannot be empty'
            });
        }

        // Validate date_of_birth if provided
        let newAge;
        if (date_of_birth !== undefined) {
            if (!date_of_birth) {
                return res.status(400).json({
                    success: false,
                    message: 'Date of birth cannot be empty'
                });
            }
            const dob = new Date(date_of_birth);
            if (isNaN(dob.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date of birth format'
                });
            }
            // Recalculate age
            const today = new Date();
            newAge = today.getFullYear() - dob.getFullYear();
            const monthDiff = today.getMonth() - dob.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                newAge--;
            }
        }

        // Validate gender if provided
        const validGenders = ['male', 'female', 'other'];
        if (gender !== undefined) {
            if (!gender || !gender.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Gender cannot be empty'
                });
            }
            if (!validGenders.includes(gender.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid gender. Must be one of: ${validGenders.join(', ')}`
                });
            }
        }

        // Validate blood_type if provided
        const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (blood_type !== undefined && blood_type && !validBloodTypes.includes(blood_type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid blood type. Must be one of: ${validBloodTypes.join(', ')}`
            });
        }

        // Validate phone if provided
        if (phone !== undefined && (!phone || !phone.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Phone cannot be empty'
            });
        }

        // Duplicate phone check (excluding current patient)
        if (phone !== undefined) {
            const { rows: dupRows } = await pool.query(
                'SELECT id FROM patients WHERE phone = $1 AND id != $2',
                [phone.trim(), id]
            );
            if (dupRows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'A patient with this phone number already exists'
                });
            }
        }

        // Validate email format if provided
        if (email !== undefined && email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }
        }

        // ── Build dynamic SET clause ─────────────────────────────────────
        const setClauses = [];
        const params = [];

        if (name !== undefined) {
            params.push(name.trim());
            setClauses.push(`name = $${params.length}`);
        }
        if (date_of_birth !== undefined) {
            params.push(date_of_birth);
            setClauses.push(`date_of_birth = $${params.length}`);
            params.push(newAge);
            setClauses.push(`age = $${params.length}`);
        }
        if (gender !== undefined) {
            params.push(gender.toLowerCase());
            setClauses.push(`gender = $${params.length}`);
        }
        if (blood_type !== undefined) {
            params.push(blood_type || null);
            setClauses.push(`blood_type = $${params.length}`);
        }
        if (phone !== undefined) {
            params.push(phone.trim());
            setClauses.push(`phone = $${params.length}`);
        }
        if (email !== undefined) {
            params.push(email ? email.trim().toLowerCase() : null);
            setClauses.push(`email = $${params.length}`);
        }
        if (address !== undefined) {
            params.push(address || null);
            setClauses.push(`address = $${params.length}`);
        }
        if (emergency_contact_name !== undefined) {
            params.push(emergency_contact_name || null);
            setClauses.push(`emergency_contact_name = $${params.length}`);
        }
        if (emergency_contact_phone !== undefined) {
            params.push(emergency_contact_phone || null);
            setClauses.push(`emergency_contact_phone = $${params.length}`);
        }
        if (emergency_contact_relationship !== undefined) {
            params.push(emergency_contact_relationship || null);
            setClauses.push(`emergency_contact_relationship = $${params.length}`);
        }
        if (medical_history !== undefined) {
            params.push(medical_history || null);
            setClauses.push(`medical_history = $${params.length}`);
        }
        if (allergies !== undefined) {
            params.push(allergies || null);
            setClauses.push(`allergies = $${params.length}`);
        }
        if (current_medications !== undefined) {
            params.push(current_medications || null);
            setClauses.push(`current_medications = $${params.length}`);
        }

        if (setClauses.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        // Always update updated_at
        setClauses.push('updated_at = NOW()');

        params.push(id);
        const idPlaceholder = `$${params.length}`;

        const { rows } = await pool.query(`
            UPDATE patients
            SET ${setClauses.join(', ')}
            WHERE id = ${idPlaceholder}
            RETURNING
                id, name, date_of_birth, age, gender, blood_type,
                phone, email, address,
                emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                medical_history, allergies, current_medications,
                is_active, created_at, updated_at
        `, params);

        res.status(200).json({
            success: true,
            message: `Patient '${rows[0].name}' updated successfully`,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating patient',
            error: error.message
        });
    }
};
