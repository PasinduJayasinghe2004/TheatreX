import * as AnaesthetistRecord from '../models/anaesthetistModel.js';

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
 * @desc    Update anaesthetist
 * @route   PUT /api/anaesthetists/:id
 * @access  Private (Coordinator/Admin)
 */
export const updateAnaesthetist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, specialization, license_number, years_of_experience, qualification, shift_preference, is_available } = req.body;

        let profile_picture = req.body.profile_picture;
        if (req.file) {
            profile_picture = `/uploads/profiles/${req.file.filename}`;
        }

        const query = `
            UPDATE anaesthetists
            SET 
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                phone = COALESCE($3, phone),
                specialization = COALESCE($4, specialization),
                license_number = COALESCE($5, license_number),
                years_of_experience = COALESCE($6, years_of_experience),
                qualification = COALESCE($7, qualification),
                shift_preference = COALESCE($8, shift_preference),
                is_available = COALESCE($9, is_available),
                profile_picture = COALESCE($10, profile_picture),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $11 AND is_active = TRUE
            RETURNING *
        `;

        const values = [
            name, email, phone, specialization, license_number,
            years_of_experience, qualification, shift_preference,
            is_available === undefined ? null : is_available,
            profile_picture,
            id
        ];

        const { rows } = await AnaesthetistRecord.pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anaesthetist not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Anaesthetist updated successfully',
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating anaesthetist',
            error: error.message
        });
    }
};

/**
 * @desc    Delete anaesthetist (Soft delete)
 * @route   DELETE /api/anaesthetists/:id
 * @access  Private (Admin)
 */
export const deleteAnaesthetist = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `UPDATE anaesthetists SET is_active = FALSE WHERE id = $1 RETURNING *`;
        const { rows } = await AnaesthetistRecord.pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Anaesthetist not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Anaesthetist deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting anaesthetist',
            error: error.message
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
