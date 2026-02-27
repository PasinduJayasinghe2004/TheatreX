import { pool } from '../config/database.js';

// @desc    Create a new technician
// @route   POST /api/technicians
// @access  Protected
export const createTechnician = async (req, res) => {
    try {
        const { name, email, phone, specialization, license_number, years_of_experience, shift_preference } = req.body;
        const profile_picture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

        const query = `
            INSERT INTO technicians (name, email, phone, specialization, license_number, years_of_experience, shift_preference, profile_picture)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [name, email, phone, specialization, license_number, years_of_experience || 0, shift_preference || 'flexible', profile_picture];

        const { rows } = await pool.query(query, values);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error creating technician:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get all technicians
// @route   GET /api/technicians
// @access  Protected
export const getAllTechnicians = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM technicians WHERE is_active = TRUE ORDER BY name ASC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching technicians:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single technician
// @route   GET /api/technicians/:id
// @access  Protected
export const getTechnicianById = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM technicians WHERE id = $1 AND is_active = TRUE', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Technician not found' });
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update technician
// @route   PUT /api/technicians/:id
// @access  Protected
export const updateTechnician = async (req, res) => {
    try {
        const { name, email, phone, specialization, license_number, years_of_experience, shift_preference, is_available } = req.body;
        let profile_picture = req.body.profile_picture;

        if (req.file) {
            profile_picture = `/uploads/profiles/${req.file.filename}`;
        }

        const query = `
            UPDATE technicians 
            SET name = $1, email = $2, phone = $3, specialization = $4, license_number = $5, 
                years_of_experience = $6, shift_preference = $7, is_available = $8, profile_picture = $9, updated_at = CURRENT_TIMESTAMP
            WHERE id = $10 AND is_active = TRUE
            RETURNING *
        `;
        const values = [name, email, phone, specialization, license_number, years_of_experience, shift_preference, is_available, profile_picture, req.params.id];

        const { rows } = await pool.query(query, values);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Technician not found' });
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete technician (Soft delete)
// @route   DELETE /api/technicians/:id
// @access  Protected
export const deleteTechnician = async (req, res) => {
    try {
        const { rows } = await pool.query('UPDATE technicians SET is_active = FALSE WHERE id = $1 RETURNING *', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Technician not found' });
        res.status(200).json({ success: true, message: 'Technician deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
